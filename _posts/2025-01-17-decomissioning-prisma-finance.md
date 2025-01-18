---
layout: post
title: Decommissioning Prisma Finance - A Turbulent but Ultimately Soft-Landing
date: 2025-01-17 00:00:00
description: How I was able to permissionlessly resolve a code inefficiency and drop costs by over 50%.
tags: Resupply Prisma
featured: true
---

As the Resupply team prepares for an exciting launch, one pesky task has occupied the focus of the team: shutting down Prisma Finance, a [hacked](https://rekt.news/prismafi-rekt/) Liquity fork that has since become a ghost ship. Once supported by Yearn and Convex liquid locker products, Prisma Finance was abandoned by its team, leaving it in a fragile state. In fact, Resupply was originally conceived as a replacement for Prisma, which governance approved with [PIP-46](https://gov.prismafinance.com/t/pip-46-shutdown-prisma-finance-introduce-resupply/232). But unwidning the system turned out to be a trickier task than expected.

This post highlights a few unexpected challenges that cropped up, but that were eventually overcome with great success. Including two critical bugs, complex economics, and creative solutions to ensure all users are able to exit safely from a protocol that we neither designed nor fully understood at the outset.

### Exposing a Trove Manager Accounting Bug

As Prisma’s TVL dwindled thanks to the PSMs described in a later section, a subtle accounting bug was brought to light. I noticed a sizeable mismatch between the sum of user debt and what the trove thinks its total debt is. A search for the culprit was on. With some meticulous code inspection and some help from Tenderly, I was able to identify the issue within the `openTrove()` function.

<p align="center" >
    <img src="https://hackmd.io/_uploads/HkahFOOD1l.png" alt="Alt text" width="750"/>
    <em style="color: #808080;">
        The bug in the Trove Manager's `openTrove()` function.
    </em>
</p>

The code incorrectly writes a state update to `totalActiveDebt` using a stale value that doesn't include the interest accrued since the prior checkpoint. During normal operations, this bug was largely transparent because `totalActiveDebt` was high enough that there was no underflow risk when subtracting a repayment amount. But if the discrepancy is big enough, and as TVL drops, even a modest sized repayments can trigger it. In fact, the bug would render repayments, redemptions, and even liquidations impossible because when the final borrower repays, say $1,000 the trove manager's attempt to subtract that amount from `totalActiveDebt` (some number less than $1,000) will underflow. These reverting transactions effectively trap users' collateral.

Come to find out later, a patch was introduced by Prisma in one of the later versions of their Trove Manager code.So this bug is only present in older versions of trove managers.

Unfortunately, there is no way to manipulate this value back in line with where it should be. Additionally, at this point, governance had already placed all Trove Managers in “sunsetting” mode, preventing any obvious methods of intervention. However, we discovered a loophole: the ability for governance to upgrade the oracle was still available.

By setting a custom oracle that priced collateral at `type(uint).max` (effectively infinite), users could withdraw their collateral, minus a small dust amount. Essentially, given the manipulated price, users need just a few wei of collateral would be used to collateralize the outstanding debt. This maneuver created about $35,000 in bad debt as stuck users were relieved of their remaining debt.

In a nice piece of news, we found more than enough money to pay that down via unclaimed crvUSD earned by Prisma’s veCRV voter. Transferring this crvUSD to the PSM now means that all mkUSD is backed 1:1, and the protocol is fully solvency.

### Identifying the Stability Pool Exploit

<p align="center" >
    <img src="https://hackmd.io/_uploads/BJvtYd_vyx.png" alt="Alt text" width="600"/>
    <em style="color: #808080;">
    </em>
</p>

In late December, a Discord user pastelfork flagged a new issue during the shutdown: collateral gains from the ULTRA stability pool depositors couldn’t be claimed. After some review, we discovered a bug introduced to ULTRA’s stability pool. An errant line in `claimCollateralGains()` resets a value that should have been zeroed out, incorrectly allowing repeated claims of the same amount until the pool is fully drained.

<p align="center" >
    <img src="https://hackmd.io/_uploads/HyFcFd_vkx.png" alt="Alt text" width="750"/>
    <em style="color: #808080;">
    </em>
</p>
<p align="center" >
    <img src="https://hackmd.io/_uploads/BkajF_uvye.png" alt="Alt text" width="750"/>
    <em style="color: #808080;">
    </em>
</p>

A user was able to extract approximately 13.92 ETH that did not belong to him. In all likelihood, he didn't set out to find this bug, but rather stumbled across it.

To prevent further abuse, a call to users to withdraw from the ULTRA stability pool was issued.

### Stablecoin Hoarders Trigger an Upward Depeg

Shutting down Prisma began with reducing the debt ceiling to zero, preventing new mkUSD and ULTRA loans. However, this move triggered a destructive market dynamic: mkUSD and ULTRA, Prisma’s stablecoins, deviated from their $1 peg, climbing as high as $1.45. This happened because these stablecoins are required for borrowers to close their loans. Opportunistic traders saw this as a chance to hoard these tokens, driving up the prices, allowing an eventual sale at a profit.

Our solution was announced in [PIP-47: Operation Rainbow Pegger](https://x.com/wavey0x/status/1870629576294158463) which introduced the concept of a custom Peg Stability Module (PSM) disguised as a regular Trove Manager, giving it permissions to mint new stablecoins. By design, the PSMs offer two-way purchasing of stables via key functions:

- `repayDebt`: Accepts crvUSD, mints corresponding amount of mkUSD/ULTRA at a 1:1 rate, and closes the user's loan atomically.
- `sellDebtToken`: Burns mkUSD/ULTRA and returns crvUSD at a 1:1 rate.

This innovation got the protocol out of the jam by providing users with liquidity they needed, and eliminated the price gouging. The PSMs will exist perpetually to facilitate repayments and serve as a facility to redeem mkUSD and ULTRA.

Custom UI development work was done to provide users with an app to interact with the PSM.

- https://prisma-psm.yearn.space/

As of writing the PSM balances are as follows:

- [mkUSD PSM](https://etherscan.io/address/0x9d7634b2B99c2684611c0Ac3150bAF6AEEa4Ed77): `1,115,770` crvUSD
- [ULTRA PSM](https://etherscan.io/address/0xAe21Fe5B61998b143f721CE343aa650a6d5EadCe): `180,835` crvUSD

### Wrapping Up

Shutting down Prisma is still in progress, with less than $80k debt remaining, but it was far from straightforward. Between economic exploits and protocol bugs, the process required custom tools, clever engineering, and delicate maneuvering to ensure users exited with minimal harm. The experience highlights the complexity of unwinding DeFi protocols and the importance of testing and robust design.

Resupply emerges from this experience stronger and ready to chart a new path, leaving behind the lessons learned from Prisma’s closure.
