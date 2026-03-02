import * as vscode from 'vscode';
import { DaemonClient } from './transport/daemon';
import { TerminalController } from './terminals/controller';
import { ContextCollector } from './context';
import { VscodeCommand, DaemonMessage } from './protocol';
import { dispatchVscodeCommand } from './commands';

let client: DaemonClient | null = null;
let terminals: TerminalController | null = null;
let contextCollector: ContextCollector | null = null;

export function activate(context: vscode.ExtensionContext) {
  client = new DaemonClient(context);
  terminals = new TerminalController(client);
  contextCollector = new ContextCollector(client);

  // The VS Code extension acts as a pure, dumb actuator.
  // It does not track pending_prompt or sequence state; the daemon owns that.
  client.on('message', async (msg: DaemonMessage) => {
    switch (msg.type) {
      case 'vscode_command': {
        const command = msg as VscodeCommand;
        if (terminals) {
          await dispatchVscodeCommand(command, terminals);
        }
        break;
      }
    }
  });

  context.subscriptions.push(
    client,
    vscode.commands.registerCommand('runbook.connect', () => client?.connect()),
    vscode.commands.registerCommand('runbook.disconnect', () => client?.disconnect()),
    vscode.commands.registerCommand('runbook.dispatchTest', () => {
      terminals?.sendText('echo "Test dispatch"', true);
    }),
    vscode.commands.registerCommand('runbook.startClaudeSession', () => {
      terminals?.startClaudeSession();
    })
  );

  // Auto-connect on startup
  client.connect();
}

export function deactivate() {
  client?.dispose();
}
