---
layout: post
title: Using Convex Just Got Cheaper for Everyone
date: 2023-12-28 00:00:00
description: How I was able to permissionlessly resolve a code inefficiency and drop costs by over 50%.
tags: Curve Convex data
featured: true
---

### Overview
If you're like me, you've noticed increased gas costs when interacting with Convex. I decided to investigated why.

What I found was an extremely inefficient code path which actually had nothing to do with Convex contracts at all - despite it having an outsized impact on their users. In fact, the gas guzzling code turned out to be related to a niche feature in Curve's LP gauges. 

To visualize it, I analyzed data from every Convex deposit over the last ~14 months, and the gas consumption of each. 

<p align="center" >
    <img src="/assets/img/gas_chart0.png" alt="Alt text" width="800"/>
    <em style="color: #808080;">
        Gas cost of each deposit transaction sent to Convex in the last 14 months.
    </em>
</p>

As you can see, the average cost of a deposit had been growing steadily over time, increasing by 123% to nearly 1.25M gas per transaction.

This post will provide a technical overview of what caused this ramping of gas costs, why it affected Convex more than others, and what the fix was. We'll finish with some suggestions for how Curve might mitigate this in the future.

### Background
Every Convex deposit routes a user's LPs into their respective Curve gauge. The process is routine. However, as execution is handed over to the Curve gauge via `deposit`, `withdraw` or `claim`, it is possible for a significant jump in gas costs when certain conditions are in place.

Curve invented a concept of "boost" which allows people who lock more CRV to earn higher emissions on the same sized LP position. A couple years ago, they took this concept further by introducing a clever mechanism called "boost delegation", which allows users with unutilized boost to delegate it to others. This opened the possibility for boost selling marketplaces like [Warden](https://app.warden.vote/boosts/) to emerge.

This boost delegation feature was built into new gauges and requires a few additional operations during each user interaction. In the context of Convex's gas issue we're discussing today, two key contracts played a role here:
1. [**Boost Delegation V2**](https://etherscan.io/address/0xd0921691c7debc698e6e372c6f74dc01fc9d3778#code). This contract tracks all boost delegations. Under the hood, when a delegation is made, this contract saves the data and performs the math to apply a modified veCRV balance to the users involved. The `adjusted_balance_of(_user)` function it exposes returns this modified amount.
1. [**veBoost Patch**](https://etherscan.io/address/0xe7330c73b373a50B95D3Beb25C13D2BEDB6FcE7E). As the name suggests, this contract is a patch. It was introduced at block 17,964,967 to fix an unrelated issue ([outlined here](https://hackmd.io/WKwRKhEfTiCeWY8qFxiMJA)), but as we'll see, it also contributed to the problem.

### The Problem
When a gauge checks for a user's adjusted balance, this call gets routed through multiple contracts. Importantly, the call reaches *Boost Delegation V2* it arrives at a function called `_checkpoint_read()` on each check for adjusted balance. By glancing at this code, you can probably guess where this is going...

```python
@view
@internal
def _checkpoint_read(_user: address, _delegated: bool) -> Point:
    ...

    ts: uint256 = (point.ts / WEEK) * WEEK
    for _ in range(255):
        ts += WEEK

        dslope: uint256 = 0
        if block.timestamp < ts:
            ts = block.timestamp
        else:
            if _delegated:
                dslope = self.delegated_slope_changes[_user][ts]
            else:
                dslope = self.received_slope_changes[_user][ts]

        point.bias -= point.slope * (ts - point.ts)
        point.slope -= dslope
        point.ts = ts
    ...

    return point
```

The `for` loop must be entered twice on each gauge interaction as it checks for each user's boost sent, and again for his boost received. Certainly this threatens to be expensive, but a close look at the surrounding code shows that some unique conditions are required in order for a user to find themselves stuck in this loop.

Specifically, a user must have an update (or `Point`) written in the past via them sending or receiving boost from another user. The problem grows more pronounced as the number of weeks since the last `Point` write increases, forcing the view function to compute the data for each missing week. Each week that passes adds an extra two SLOADs (`2 * 21,000 gas`) plus a few math operations.

At the time of my research, it had been 71 weeks (!!!) since the last update had ocurred for both Yearn and Convex's veCRV position. And sure enough, as we can see in the chart above, the average cost to transact is trending upwards as new weeks add iterations to the loop.

But the problem became even more acute for Convex users in late August 2023, as you can see in the chart above where the smooth trend upwards in gas prices suddenly becomes disjointed, leaping upward. This is when the patch contract mentioned above was implemented. Taking a quick look at the code, you'll notice why immediately. 

```python
@view
@external
def adjusted_balance_of(_user: address) -> uint256:
    if _user == CONVEX_WALLET:
        return ERC20(BOOST_V2).balanceOf(CONVEX_WALLET) - BoostV2(BOOST_V2).delegated_balance(YEARN_WALLET)
    
    if _user == YEARN_WALLET:
        return ERC20(VE).balanceOf(YEARN_WALLET)

    return ERC20(BOOST_V2).balanceOf(_user)
```

As you can see, it forces each query for Convex's `adjusted_balance()` to also involve an additional query to Yearn's boost, effectively multiplying the amount of work needing to be done as Yearn's position *also* must traverse a large number of weeks.

In this example transaction, [we can profile its gas usage on Tenderly](https://dashboard.tenderly.co/tx/mainnet/0x5b93c34cd96150443682aa0cc8a652711155022b4918f5825c92fde65e806955/gas-usage). It's almost difficult to see, but you can notice over 100 SLOADs along the bottom row which should be a huge red flag.

<img src="/assets/img/tenderly_gas.png" alt="Alt text" width="800"/>


### The Fix
Luckily I found that within the Boost Delegation V2 contract, Curve exposes a handy `checkpoint_user` function which is totally permissionless to call. It does exactly what we need in order to fix the problem: loops through all the unfilled weeks, and populates them with data. 

And just like that, two ~$85 transactions (one for Convex, and one for Yearn) fixed our problem! Several weeks later, we can see the impact it's had...

<p align="center" >
    <img src="/assets/img/gas_chart_checkpoint_fix.png" alt="Alt text" width="800"/>
    <em style="color: #808080;">
        Gas cost of each deposit transaction sent to Convex, highlighting patch and checkpoint blocks.
    </em>
</p>

Notice:
- The less frequent dots tha appear along the bottom, even before the checkpoint, represent deposits to older gauges which do not support delegation. These transactions bypass the issue entirely.
- We can now get gas on each transaction significantly below 1M again to an average of 0.6M.

### Proposed Long Term Solutions
Because the problem is multi-faceted, there are several things Curve might consider to permanently address this.
1. First and foremost, the patch contract should be deprecated in favor of a new Boost Delegation V3 contract which properly addresses the issue it was attempting to solve in the first place. This can be done by simply redeploying the contract.
1. In all future gauge codebases, create a "write" counterpart for the `adjusted_balance_of()` function, which should populate any unfilled weeks on each user interaction. This will enforce that no two users in the same week will have to traverse many iterations of the `for` loop.