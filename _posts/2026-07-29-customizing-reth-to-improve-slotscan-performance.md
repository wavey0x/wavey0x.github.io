---
layout: post
title: Customizing Reth to Improve SlotScan Performance
date: 2026-07-29 00:00:00 -0400
description: How a custom Reth RPC method reduced SlotScan tracing from two transaction replays to one, delivering up to a 16× speedup
tags: Reth EVM Tracing Performance
featured: true
---

Until now, SlotScan—my tool for decoding storage changes in EVM transactions—was executing every traced transaction twice.

In [Part 1](https://wavey.info/posts/2025/reverse-engineering-evm-storage/), I wrote that multiple trace passes were necessary to collect the state diff, ordered writes, call-frame attribution, and hash preimages SlotScan needs.

That was true at the JSON-RPC boundary: none of Reth's default methods returned all of that evidence in one trace. But what if I moved my custom tracing logic into Reth itself?

Using Reth's NodeBuilder, I built a custom binary that handles SlotScan's tracing in one RPC call backed by one replay. The transaction executes once, and every trace view is built from that execution.

Across four sample transactions, I measured a **2.03× to 16.07× speedup**. Trace processing time for the largest fell from 10.5 seconds to 656 milliseconds.

## The problem: one tracer per request meant two executions

Reth's execution engine could produce the evidence SlotScan needed. The limitation was its default external API: `debug_traceTransaction` runs one selected tracer per request, and that tracer determines what the execution returns. No default method combined Reth's pre/post state diff with SlotScan's custom ordered evidence.

SlotScan needed two kinds of evidence:

- an authoritative diff of committed state changes; and
- an ordered timeline of every write attempted, including repeated, restored, transient, and reverted writes.

The first request used Reth's built-in `prestateTracer` in diff mode to produce the committed state diff. The second used a compact JavaScript tracer to record the ordered execution evidence and the hash preimages needed to resolve mappings and dynamic storage.

Each request performed its own heavyweight replay. To trace a historical transaction, Reth reconstructs the block's starting state, processes earlier transactions in the same block, and then executes the target while the selected tracer observes it:

```text
debug_traceTransaction(tracer: "prestateTracer", diffMode: true)
└── reconstruct state → process earlier block transactions
    → execute target → build committed diff

debug_traceTransaction(tracer: JavaScript tracer)
└── reconstruct state → process earlier block transactions
    → execute target → collect ordered evidence
```

Putting both calls into one JSON-RPC batch would save a network round trip. It would not save either replay or execution.

## The constraint: extend Reth without forking it

I wanted one canonical replay without losing either evidence view. I also wanted to reuse Reth's state database, execution environment, and tracing controls—not reimplement historical state reconstruction or maintain a permanent source fork. The real constraint was keeping that integration narrow enough to survive Reth upgrades.

## The implementation: extending Reth instead of forking it

Reth made this easier than I expected. [Reth's NodeBuilder](https://reth.rs/docs/reth/builder/struct.NodeBuilder.html) assembles a node from standard components and exposes hooks for adding custom functionality. The [`extend_rpc_modules`](https://reth.rs/sdk/examples/modify-node/) hook can add custom RPC methods before the servers launch.

The node-level change is small:

```rust
let handle = builder
    .node(EthereumNode::default())
    .extend_rpc_modules(|ctx| {
        let adapter = RethTraceAdapter::new(ctx.registry.eth_api().clone());
        ctx.modules
            .merge_configured(SlotScanRpc::new(adapter).into_rpc())?;
        Ok(())
    })
    .launch_with_debug_capabilities()
    .await?;
```

Reth still handles networking, consensus, the database, the transaction pool, and its standard RPC methods; SlotScan adds one `slotscan` namespace. I maintain a version-specific adapter, but the change to Reth stays small.

Inside `slotscan_traceTransaction`, the adapter invokes Reth's canonical `spawn_trace_transaction_in_block_with_inspector` helper and supplies a custom REVM inspector. When the replay finishes, the completion closure receives the inspector output, execution result, and historical database view—before any JSON serialization.

```text
slotscan_traceTransaction
└── reconstruct state → execute once with SlotScanInspector
                        ├── ordered write and hash evidence
                        ├── authoritative pre/post diff
                        └── transaction-start storage observations
```

During execution, `SlotScanInspector` records ordered `SSTORE` and `TSTORE` operations, call-frame outcomes, relevant `KECCAK256` preimages, and a bounded set of storage reads. REVM's journal supplies the immediate old value for each write, while its call hooks preserve storage attribution and rollback semantics.

After execution, `GethTraceBuilder` derives the committed state diff from the same result. The replay database supplies the transaction-start storage values.

## The result: 2× to 16× faster

Before measuring performance, I verified that both paths returned equivalent state diffs, ordered writes, frame attribution, hash evidence, storage observations, step counts, and transaction identity. I then warmed both modes and ran eight paired samples with alternating order against the same Reth v2.4.1 node.

| Transaction shape | EVM steps | Writes | Legacy median | Native median | Speedup |
|---|---:|---:|---:|---:|---:|
| ERC-20 transfer | 571 | 2 | 1,101.5 ms | 543.7 ms | 2.03× |
| Reverted writes | 318,375 | 468 | 2,360.9 ms | 487.4 ms | 4.84× |
| Proxy voting | 167,759 | 99 | 1,587.1 ms | 479.4 ms | 3.31× |
| [High-fanout delegation](https://etherscan.io/tx/0x0fe2542079644e107cbf13690eb9c2c65963ccb79089ff96bfaf8dced2331c92) | 2,324,323 | 511 | 10,545.8 ms | 656.4 ms | 16.07× |

Native response sizes stayed within -3.2% to +2.5% of the legacy responses, so the speedup did not come from dropping evidence.

I expected something close to a 2× improvement from removing one of two replays. That is roughly what happened for the small ERC-20 transfer. The 2.32-million-step transaction improved by 16× because the old path also paid for a JavaScript callback on every opcode.

These numbers cover uncached evidence acquisition, not total SlotScan page latency. Historical tracing is still expensive. This change only removes the work SlotScan was doing twice.

The complete methodology and measurements are in the [native transaction tracing benchmark](https://gist.wavey.info/8zJtl2G5EElwPHksP1vvjsFt).

You can try SlotScan at [slotscan.info](https://slotscan.info/).

## Sources

- [Custom node entrypoint](https://github.com/wavey0x/slotscan/blob/ae3af0e/reth-slotscan/src/main.rs)
- [Native replay adapter](https://github.com/wavey0x/slotscan/blob/ae3af0e/reth-slotscan/src/reth_adapter.rs)
- [SlotScan REVM inspector](https://github.com/wavey0x/slotscan/blob/ae3af0e/reth-slotscan/src/inspector.rs)
