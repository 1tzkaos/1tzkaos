<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/header-dark.svg">
  <img alt="Nick Stankiewicz, Solana market-data infrastructure" src="assets/header-light.svg" width="100%">
</picture>

<p align="center">
  <a href="#dexploit"><b>Dexploit</b></a>
  &nbsp;&nbsp;·&nbsp;&nbsp;
  <a href="#also-building"><b>Projects</b></a>
  &nbsp;&nbsp;·&nbsp;&nbsp;
  <a href="https://1tzkaos.github.io/"><b>1tzkaos.github.io</b></a>
  &nbsp;&nbsp;·&nbsp;&nbsp;
  <a href="https://dexploit.dev"><b>Dexploit.dev</b></a>
  &nbsp;&nbsp;·&nbsp;&nbsp;
  <a href="https://www.linkedin.com/in/nbstanki/"><b>Contact</b></a>
</p>

<h2 id="dexploit">
  <img src="assets/dexploit-logo.png" alt="" width="26" height="26">
  &nbsp;Dexploit
</h2>

> **Skip the data pipeline. Ship your Solana app.**

Pre-parsed OHLCV candles, swap events, and price streams across Solana DEXs, served over REST, WebSocket, gRPC, and GraphQL, with a free tier instead of an enterprise contract.

[**dexploit.dev**](https://dexploit.dev) &nbsp;·&nbsp; [docs](https://docs.dexploit.dev) &nbsp;·&nbsp; [npm](https://www.npmjs.com/package/@dexploit/mcp) &nbsp;·&nbsp; [github.com/DexploitV1](https://github.com/DexploitV1)

<!-- STATS:START -->
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/stats-dark.svg">
  <img alt="Dexploit live stats: candles stored 1.3B, trading pairs 4.6M, token mints 4.2M, dex protocols 10. Updated 2026-09-04" src="assets/stats-light.svg" width="100%">
</picture>
<!-- STATS:END -->

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/stack-dark.svg">
  <img alt="Stack: rust, clickhouse, nats, grpc, typescript, solana" src="assets/stack-light.svg" width="582">
</picture>

<details>
<summary><b>How it fits together</b></summary>
<br>

Rust services parse swaps out of on-chain program data, normalize them through a shared pipeline, and aggregate candles into ClickHouse. NATS moves events between the protocol workers and the gateway. Prometheus covers metrics.

REST terminates behind Cloudflare. WebSocket and gRPC run direct to the edge, which keeps proxy buffering out of the streaming path.

| Surface | Endpoint |
|---|---|
| REST | `api.dexploit.dev` |
| WebSocket | `ws.dexploit.dev` |
| gRPC | `grpc.dexploit.dev:443` |
| GraphQL | `api.dexploit.dev/graphql` |

</details>

> [!NOTE]
> **[Dexploit-MCP](https://github.com/DexploitV1/Dexploit-MCP)** wires the API into Claude Code, Claude Desktop, and Cursor, so a model queries real Solana data instead of inventing it.
> ```
> npx -y @dexploit/mcp
> ```

## Also building

<table>
<tr>
<td width="50%" valign="top">

**[PoGoBot](https://github.com/1tzkaos/PoGoBot)**<br>
`python` &nbsp;`computer-vision`

Screen-reading game automation in three separately testable layers: perception, decision, actuation. The state machine refuses to start if any state is missing a handler or a timeout.

</td>
<td width="50%" valign="top">

**solbot**<br>
`private` &nbsp;`typescript`

A paper-trading simulator running several strategy configurations in parallel lanes off one shared market feed, so parameter sets are compared against identical ticks. Built against the Dexploit API.

</td>
</tr>
</table>

## Recently

<!-- ACTIVITY:START -->
- pushed to [`1tzkaos/PoGoBot`](https://github.com/1tzkaos/PoGoBot)
- pushed to [`1tzkaos/1tzkaos`](https://github.com/1tzkaos/1tzkaos)
- pushed to [`1tzkaos/docs`](https://github.com/1tzkaos/docs)

<sub>updated 2026-09-04</sub>
<!-- ACTIVITY:END -->

---

<sub><a href="https://www.linkedin.com/in/nbstanki/">LinkedIn</a> &nbsp;·&nbsp; <a href="mailto:nbstanki@mtu.edu">nbstanki@mtu.edu</a></sub>
