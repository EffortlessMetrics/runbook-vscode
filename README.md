# runbook-vscode

VS Code extension that bridges the Runbook daemon (`runbookd`) to the VS Code UI.

This extension is intentionally narrow:

- Receives **commands** from `runbookd` (dispatch prompt, cycle terminals, scroll terminal)
- Executes them using VS Code APIs and command IDs

## Why this exists

Logitech hardware lives in Logi Options+.
Claude Code lifecycle telemetry lives inside Claude Code.

VS Code is the place where:

- Claude Code runs (integrated terminal)
- The operator navigates evidence (terminal output, files)

This extension is the clean bridge.

## Development

```bash
npm install
npm run compile
```

Then run the extension via VS Code's Extension Development Host.

## Protocol

Connects to `ws://127.0.0.1:29381/ws` by default.

See the protocol docs in the Rust repo (`runbookd/docs/protocol.md`).
