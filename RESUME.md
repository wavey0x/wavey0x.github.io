# wavey

Ethereum data tools, smart contracts, and DeFi operations systems

[GitHub](https://github.com/wavey0x) | [Website](https://wavey0x.github.io) | [X](https://x.com/wavey0x)

## Elevator Pitch

I build the operational layer DeFi teams need when protocol work gets messy: smart contracts, indexing pipelines, APIs, dashboards, Safe tooling, and transaction systems that turn on-chain state into reliable decisions and executable actions. My strongest work sits where EVM internals, production data infrastructure, and protocol operations overlap, especially across the Yearn, Curve, Convex, Prisma, and Resupply ecosystems.

## Summary

- Ethereum engineer focused on DeFi protocol operations, smart-contract tooling, data products, and incident analysis.
- Builds across the stack: Solidity/Vyper contracts, Foundry/Brownie/Ape workflows, Python APIs and indexers, TypeScript/React frontends, SQL-backed services, and on-chain data pipelines.
- Public GitHub footprint includes 126 repositories as of May 3, 2026, with primary work in Python, Solidity, TypeScript, and JavaScript.
- Writes technical research on EVM storage reverse engineering, Safe deployment edge cases, Curve/Convex gas behavior, and Prisma shutdown mechanics.

## Selected Work

### [Tidal](https://github.com/wavey0x/tidal)

Yearn auction operations stack for scanning strategy and fee-burner inventories, caching balances and token prices, preparing auction actions, and exposing an operator dashboard.

- Built a Python/FastAPI control plane with SQLite persistence, Alembic migrations, API-key auth, scanner jobs, action audit history, and CLI client workflows.
- Designed the trust boundary so shared state and action preparation live on the server while private keys stay local to the CLI client for transaction signing and broadcast.
- Added a React dashboard for monitoring strategies, fee burners, logs, and action flows.
- Built a Foundry `AuctionKicker` helper contract for atomic auction execution with fork-tested validation around source, auction, sell token, and want token assumptions.

### [SlotScan](https://github.com/wavey0x/slotscan)

Ethereum smart-contract storage analyzer for viewing storage layouts, decoding values, and tracing transaction storage changes.

- Built a FastAPI backend, Next.js frontend, and PostgreSQL cache around contract metadata, source parsing, storage reads, and transaction tracing.
- Implemented workflows for decoding EVM storage layouts and transaction diffs, including mapping preimage capture, `SSTORE` ordering, proxy handling, and `DELEGATECALL` attribution.
- Published a companion technical writeup on reverse engineering EVM storage from layouts and execution traces.

### [safesmith](https://github.com/wavey0x/safesmith)

Python CLI wrapper around Foundry scripts with Safe transaction support.

- Built tooling to create, sign, post, and delete Safe multisig transactions from Foundry script workflows.
- Added dynamic Solidity interface generation through address-based and preset interface directives.
- Designed layered configuration across CLI arguments, environment variables, project config, and global config.

### [token-price-agg](https://github.com/wavey0x/token-price-agg)

Ethereum token metadata, price, and quote API with plugin-style providers.

- Built FastAPI endpoints for token metadata, prices, quotes, provider discovery, health, readiness, and Prometheus metrics.
- Implemented provider fanout and deterministic response contracts across Curve, DeFiLlama, Enso, LiFi, Odos, and vault-aware token resolution.
- Added API-key management, anonymous rate limits, structured configuration, observability, unit/integration/e2e tests, systemd deployment assets, Kubernetes manifests, and MkDocs documentation.

### [Vesting Escrow App](https://github.com/wavey0x/vesting-escrow-app)

Frontend and indexer for inspecting, tracking, and creating Yearn/Curve vesting escrows on Ethereum mainnet.

- Built a Vite/React/wagmi/viem app with manage, create, and escrow-detail flows.
- Supports live RPC reads, indexed escrow metadata, token pricing, local names, starred escrows, status filtering, claims, revokes, and disown actions.
- Added a Python/web3.py indexer and daily GitHub Actions refresh for escrow and token datasets.

### [Safe Transaction Deleter](https://github.com/wavey0x/safe-tx-deleter)

Client-side TypeScript app for deleting queued Safe multisig transactions proposed by the connected wallet.

- Built a React/Vite/wagmi/viem SPA that discovers owner Safes across supported networks, supports manual lookup, and stores favorites locally.
- Uses Safe Transaction Service APIs directly with no backend.
- Implements proposer eligibility checks and EIP-712 delete signatures for queued transaction removal.

### DeFi Dashboards and Data APIs

- [crv.lol](https://github.com/wavey0x/curve-ll-charts): Curve liquid-locker dashboards for gauges, DAO voting data, treasury views, APR charts, favorites, and token/logo enrichment.
- [rsup.lol](https://github.com/wavey0x/rsup.lol): Resupply ecosystem dashboard for DeFi lending markets, sortable market data, auto-refreshing views, and contract links.
- [ybs.wavey.info](https://github.com/wavey0x/ybs-dash-app): Dashboard for Yearn Boosted Staker deployments, weekly data, user lookups, and token-level views.
- [wavey-api](https://github.com/wavey0x/wavey-api): Flask API for Curve gauge data, Resupply endpoints, and Prisma shadow-log search over pre-fetched on-chain datasets.
- [open-data](https://github.com/wavey0x/open-data) and [open-data-scripts](https://github.com/wavey0x/open-data-scripts): Public JSON datasets and scripts for Prisma, Resupply, YBS, market, and position data.

### Smart Contracts and Protocol Tooling

- [yearn/yearn-boosted-staker](https://github.com/yearn/yearn-boosted-staker): Solidity staking system and factory with weekly weight growth, checkpointing, reward distribution utilities, and audit artifacts.
- [auction-curves](https://github.com/wavey0x/auction-curves): Solidity/Python Dutch auction price-decay experiments with configurable auction parameters and analysis scripts.
- [prisma-shutdown](https://github.com/wavey0x/prisma-shutdown): Foundry contracts and tests for Prisma shutdown tooling, including custom price feeds, a PSM, claim operators, gas-pool reimbursement, and emission schedule logic.
- [yearn-v3-deployer](https://github.com/wavey0x/yearn-v3-deployer): Python deployment tooling for Yearn V3 flows.
- Additional public Solidity work spans Curve strategy proxies, yCRV tooling, crvUSD flash selling, upgradeability experiments, and protocol-specific PoCs.

## Research and Protocol Response

- [Using Convex Just Got Cheaper for Everyone](https://wavey0x.github.io/posts/2023/convex-just-got-cheaper/): Analyzed roughly 14 months of Convex deposit gas data, traced an inefficient Curve boost-delegation code path, and documented a permissionless fix that reduced user costs.
- [Decommissioning Prisma Finance](https://wavey0x.github.io/posts/2025/decomissioning-prisma-finance/): Helped reason through Prisma shutdown mechanics, including Trove Manager debt-accounting failure modes, stuck-collateral recovery, stability-pool exploit analysis, and peg-restoration tooling.
- [Noop, Not my Safe](https://wavey0x.github.io/posts/2025/noop-not-my-safe/): Documented and responsibly disclosed a Safe CREATE2 deployment edge case where missing implementation code can leave a proxy uninitialized on new networks.
- [Reverse Engineering EVM Storage](https://wavey0x.github.io/posts/2025/reverse-engineering-evm-storage/): Wrote about practical storage-slot decoding, mapping preimages, execution traces, proxy detection, and transaction-level storage diffs.

## Technical Skills

- Smart contracts: Solidity, Vyper, Foundry, Brownie, Ape, fork testing, Safe multisig workflows, CREATE2, proxy patterns, storage layouts, EVM traces.
- Backend and data: Python, FastAPI, Flask, SQLAlchemy, Alembic, SQLite, PostgreSQL, DuckDB, Pandas, Web3.py, async HTTP, API auth, Prometheus metrics.
- Frontend: TypeScript, JavaScript, React, Next.js, Vite, wagmi, viem, React Query, Tailwind CSS, Chakra UI, CSS Modules.
- DeFi domains: Yearn, Curve, Convex, Prisma, Resupply, Safe, token pricing, vault accounting, gauges, liquid lockers, auctions, vesting, lending markets.
- Operations: CLI tooling, local wallet signing, systemd services, GitHub Actions, Vercel, MkDocs, API runbooks, open datasets, dashboards, incident writeups.

## Public Project Snapshot

Generated from public project data on May 3, 2026.

- GitHub: 126 public repositories; 64 original repositories and 62 forks from the public API snapshot.
- Most visible public project: `safesmith`, with 36 GitHub stars at generation time.
- Public apps highlighted on the website: auctionscan, token vesting, SlotScan, crv.lol, rsup.lol, YBS dashboard, and Safe transaction deleter.
