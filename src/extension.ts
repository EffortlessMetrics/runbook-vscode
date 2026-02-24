import * as vscode from 'vscode';
import WebSocket from 'ws';

// Keep protocol extremely small in v1. Treat unknown fields as forward-compatible.

type DaemonToClient = {
  type: string;
  [k: string]: any;
};

type ClientToDaemon = {
  type: string;
  [k: string]: any;
};

const DEFAULT_DAEMON_WS = 'ws://127.0.0.1:29381/ws';

class RunbookClient {
  private ws: WebSocket | null = null;
  private status: vscode.StatusBarItem;

  // Terminal selection policy:
  // - Prefer a terminal named 'claude' if present
  // - Else fallback to vscode.window.activeTerminal
  private readonly preferredTerminalNameSubstrings = ['claude'];

  constructor(private readonly ctx: vscode.ExtensionContext) {
    this.status = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);
    this.status.text = 'Runbook: disconnected';
    this.status.show();
  }

  connect(url: string = DEFAULT_DAEMON_WS) {
    if (this.ws) {
      return;
    }

    this.status.text = 'Runbook: connecting…';

    const ws = new WebSocket(url);
    this.ws = ws;

    ws.on('open', () => {
      this.status.text = 'Runbook: connected';
      const hello: ClientToDaemon = {
        type: 'hello',
        client: 'vscode',
        protocol: 1,
        version: this.ctx.extension.packageJSON.version
      };
      ws.send(JSON.stringify(hello));
    });

    ws.on('message', async (data) => {
      const text = data.toString();
      let msg: DaemonToClient;
      try {
        msg = JSON.parse(text);
      } catch {
        return;
      }

      if (msg.type === 'notice') {
        // Optional: surface daemon notices as status updates.
        return;
      }

      if (msg.type === 'vscode_command') {
        await this.handleVscodeCommand(msg);
      }
    });

    ws.on('close', () => {
      this.status.text = 'Runbook: disconnected';
      this.ws = null;
    });

    ws.on('error', (err) => {
      this.status.text = 'Runbook: error';
      console.error('Runbook websocket error', err);
    });
  }

  disconnect() {
    if (!this.ws) {
      return;
    }
    this.ws.close();
    this.ws = null;
    this.status.text = 'Runbook: disconnected';
  }

  async dispatchTest() {
    // Useful for validating end-to-end wiring without hardware.
    await this.sendTextToClaudeTerminal('/help', true);
  }

  private async handleVscodeCommand(msg: any) {
    // Protocol (v1):
    // { type: "vscode_command", kind: "send_text" | "focus_terminal" | "scroll_terminal", target: "active_claude" | "active", payload: {...} }
    const kind = msg.kind;
    const payload = msg.payload || {};

    if (kind === 'send_text') {
      await this.sendTextToClaudeTerminal(payload.text ?? '', Boolean(payload.add_newline));
      return;
    }

    if (kind === 'focus_terminal') {
      const direction: number = payload.direction ?? 1;
      await this.focusTerminalByDirection(direction);
      return;
    }

    if (kind === 'scroll_terminal') {
      const delta: number = payload.delta ?? 0;
      await this.scrollTerminal(delta);
      return;
    }
  }

  private pickClaudeTerminal(): vscode.Terminal | undefined {
    const terminals = vscode.window.terminals;
    for (const t of terminals) {
      const name = (t.name || '').toLowerCase();
      if (this.preferredTerminalNameSubstrings.some((s) => name.includes(s))) {
        return t;
      }
    }
    return vscode.window.activeTerminal;
  }

  private async sendTextToClaudeTerminal(text: string, addNewLine: boolean) {
    const term = this.pickClaudeTerminal();
    if (!term) {
      vscode.window.showWarningMessage('Runbook: no terminal found to send text to');
      return;
    }

    // Bring it into view so the operator can see what happened.
    term.show(false);

    // VS Code API supports sending text to terminals.
    // Note: sendText is not a keypress; it writes to the pseudo-terminal.
    term.sendText(text, addNewLine);
  }

  private async focusTerminalByDirection(direction: number) {
    const terminals = vscode.window.terminals;
    if (terminals.length === 0) {
      return;
    }

    const active = vscode.window.activeTerminal;
    let idx = active ? terminals.indexOf(active) : 0;
    if (idx < 0) idx = 0;

    const next = (idx + direction + terminals.length) % terminals.length;
    terminals[next].show(false);
  }

  private async scrollTerminal(delta: number) {
    if (delta === 0) return;

    // Terminal scroll commands are command IDs (not part of the typed API).
    // We call them conservatively.
    const cmd = delta > 0 ? 'workbench.action.terminal.scrollDown' : 'workbench.action.terminal.scrollUp';
    const steps = Math.min(Math.abs(delta), 25);
    for (let i = 0; i < steps; i++) {
      await vscode.commands.executeCommand(cmd);
    }
  }
}

let client: RunbookClient | null = null;

export function activate(context: vscode.ExtensionContext) {
  client = new RunbookClient(context);

  context.subscriptions.push(
    vscode.commands.registerCommand('runbook.connect', () => client?.connect()),
    vscode.commands.registerCommand('runbook.disconnect', () => client?.disconnect()),
    vscode.commands.registerCommand('runbook.dispatchTest', () => client?.dispatchTest())
  );

  // Auto-connect on startup.
  client.connect();
}

export function deactivate() {
  client?.disconnect();
}
