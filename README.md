<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/header-dark.svg">
  <img alt="Nick Stankiewicz — Solana market-data infrastructure" src="assets/header-light.svg" width="100%">
</picture>

## Dexploit

**Skip the data pipeline. Ship your Solana app.**

[dexploit.dev](https://dexploit.dev) · [docs](https://docs.dexploit.dev) · [@dexploit/mcp](https://www.npmjs.com/package/@dexploit/mcp) · [DexploitV1](https://github.com/DexploitV1)

Pre-parsed OHLCV candles, swap events, and price streams across Solana DEXs — over REST, WebSocket, gRPC, and GraphQL, with a free tier instead of an enterprise contract.

Rust services parse swaps out of on-chain program data, normalize them through a shared pipeline, and aggregate candles into ClickHouse. NATS moves events between the protocol workers and the gateway. REST terminates behind Cloudflare; WebSocket and gRPC run direct to the edge, keeping proxy buffering out of the streaming path.

<!-- STATS:START -->
| Candles stored | Trading pairs | DEX protocols | Latest candle |
|---|---|---|---|
| **963M** | **4M** | **10** | `2026-08-18 10:08 UTC` |

<sub>Live from `api.dexploit.dev` · updated 2026-08-18</sub>
<!-- STATS:END -->

**[Dexploit-MCP](https://github.com/DexploitV1/Dexploit-MCP)** — an MCP server giving Claude Code, Claude Desktop, and Cursor live access to the API, so a model queries real Solana data instead of inventing it. `npx -y @dexploit/mcp`

## Also building

**[PoGoBot](https://github.com/1tzkaos/PoGoBot)** — screen-reading game automation in three separately testable layers: perception, decision, actuation. The state machine refuses to start if any state is missing a handler or a timeout.

**solbot** *(private)* — a paper-trading simulator that runs several strategy configurations in parallel lanes off one shared market feed, so parameter sets are compared against identical ticks. Built against the Dexploit API.

## Recently

<!-- ACTIVITY:START -->
- opened a PR in [`1tzkaos/docs`](https://github.com/1tzkaos/docs)
- opened a PR in [`DexploitV1/Dexploit-MCP`](https://github.com/DexploitV1/Dexploit-MCP)

<sub>updated 2026-08-18</sub>
<!-- ACTIVITY:END -->

---

[LinkedIn](https://www.linkedin.com/in/nbstanki/) · [nbstanki@mtu.edu](mailto:nbstanki@mtu.edu)
