---
layout: post
title: Noop, Not my Safe
date: 2025-01-29 00:00:00
description: Stealing a Safe Address — Even with CREATE2
tags: Security Gnosis Safe Disclosures
featured: true
---

If you're like me, you get a kick out of deploying Safe multisigs deterministically to [vanity addresses](https://etherscan.io/address/0xC001d00d425Fa92C4F840baA8f1e0c27c4297a0B) and across multiple networks.

But how safe is this practice?

We all remember when [Wintermute lost 20M OP](https://banteg.mirror.xyz/iZAsBNL3j_5NIAY2Erav1r7Q4ecc7SC76AfMjyScs34) because an attacker replicated their Safe address on Optimism with malicious owners. Lesson learned: nobody deploys multichain Safes with `CREATE` anymore— CREATE2 is the way to go. And since my deployments depend on an initializer containing my owner addresses, nobody can steal my Safe on new networks, right?

**Wrong.**

Today, I stumbled upon a way to "steal" a Safe address even with the `CREATE2` deploy method.

_(Note: This was responsibly disclosed to the Safe team, and they confirmed it was a known issue, fixed in v1.4.1.)_

---

### **How Normal Safe Deployments Work**

Safe follows the **EIP-1167 minimal proxy pattern**. The proxy deployments come from a factory that requires the following data:

- A list of owners
- A threshold
- Other optional data

This data is hashed into the `CREATE2` salt, ensuring deterministic deployment across chains. Normally, deployment looks like this:

<p align="center" >
    <img src="/assets/img/safe_deploy1.png" alt="Alt text" width="650"/>
    <em style="color: #808080;"><br/>
        Safe deployment happy path.
    </em>
</p>
But what if the Safe **implementation contract** doesn’t exist on the network yet?

---

### **How an Attacker Steals Your Safe**

Let’s say you deploy on a new chain, **Sonic**, which at the time of observation doesn’t yet have a Safe implementation contract. Here’s what happens:

1. The proxy factory deploys your Safe proxy.
2. The proxy calls `setup()`, but since the implementation contract **doesn’t exist yet**, the delegate call does not revert, but nothing is written to storage.
3. The proxy is now deployed at its expected deterministic address, but it's **uninitialized**.
4. An attacker **deploys the implementation contract**, then calls `setup()` themselves—setting their own owners and threshold.

<p align="center" >
    <img src="/assets/img/safe_deploy2.png" alt="Alt text" width="650"/>
    <em style="color: #808080;"><br/>
        Safe deployment happy path.
    </em>
</p>

**Boom.** They now control your Safe address before you even get the chance to initialize it.

---

### **How to Prevent This**

Good news—this attack is mitigated in several ways:

- **Safe v1.4.1+ fixes this issue** by [explicitly checking](https://github.com/safe-global/safe-smart-account/blob/v1.4.1/contracts/proxies/SafeProxyFactory.sol#L27) for code at the implementation address before deployment.
- **OP chains are safe** because they [preinstall Safe implementations](https://docs.optimism.io/builders/chain-operators/features/preinstalls), blocking attackers from front-running deployments.
