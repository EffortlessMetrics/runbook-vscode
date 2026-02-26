# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

A VS Code extension that acts as a **pure dumb actuator** for the Runbook daemon (`runbookd`). It receives commands over WebSocket and executes them via VS Code APIs. The extension owns no business logic — the daemon owns all state (pending prompts, sequences, agent lifecycle).

## Build & Test Commands

```bash
npm run compile          # TypeScript → dist/
npm run watch            # Compile in watch mode
npm test                 # Integration tests (downloads VS Code, runs in Extension Development Host)
npm run test:bdd         # BDD tests via Cucumber
npm run package          # Package .vsix via vsce
```

Tests use `@vscode/test-electron` and run inside a real VS Code instance. The test suite uses Mocha with TDD UI (`suite`/`test`, not `describe`/`it`). There is no way to run a single test file in isolation — all `*.test.js` files under `dist/test/` are globbed and run together.

For manual testing, `src/test/fakeDaemon.ts` provides a standalone WebSocket server that simulates the daemon on port 29381.

## Architecture

The extension has four modules, each in its own directory under `src/`:

- **`transport/daemon.ts`** — `DaemonClient` (extends `EventEmitter`). Manages the WebSocket connection to `runbookd` with exponential-backoff reconnect. Emits `'message'` events with parsed `DaemonMessage` objects and `'connected'`/`'disconnected'` lifecycle events. Shows connection state in the VS Code status bar.

- **`terminals/controller.ts`** — `TerminalController`. Manages terminal selection, cycling (wrapping modulo arithmetic via `calculateCycleIndex`), focus, text/sequence dispatch, and session creation. Reports `vscode_telemetry` messages back to the daemon whenever terminal state changes.

- **`jumpgates/index.ts`** — Two functions: `openUri` (opens external URIs) and `revealReceipt` (opens a file in the editor).

- **`context/index.ts`** — `ContextCollector`. Periodically polls workspace path and git branch, sends `vscode_telemetry` updates to the daemon.

- **`protocol/index.ts`** — TypeScript interfaces for the wire protocol. All messages use **snake_case** and carry a `protocol: 1` version field. Key message types: `ClientHello` (ext→daemon), `VscodeCommand` (daemon→ext), `RenderMessage` (daemon→ext), `VscodeTelemetry` (ext→daemon).

**`extension.ts`** wires everything together: creates `DaemonClient`, `TerminalController`, `ContextCollector`, registers commands, and routes incoming `DaemonMessage` to the appropriate handler via a switch on `msg.type` / `command.cmd`.

## Protocol Conventions

- All wire messages are JSON, **snake_case** fields, versioned with `protocol: 1`.
- The extension must be forward-compatible: unknown message types are silently ignored.
- The canonical protocol spec lives in the Rust repo at `runbookd/docs/protocol.md`.

## Key Design Constraints

- The extension must remain stateless with respect to prompt/sequence logic — the daemon is the single source of truth.
- `calculateCycleIndex` is exported as a standalone pure function for testability.
- The `DaemonClient` guards against malformed JSON, null, arrays, and non-object values from the wire.
