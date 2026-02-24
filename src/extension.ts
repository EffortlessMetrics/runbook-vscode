import * as vscode from 'vscode';
import { DaemonClient } from './transport/daemon';
import { TerminalController } from './terminals/controller';
import { openUri, revealReceipt } from './jumpgates';
import { ContextCollector } from './context';
import { VscodeCommand } from './protocol';

let client: DaemonClient | null = null;
let terminals: TerminalController | null = null;
let contextCollector: ContextCollector | null = null;

export function activate(context: vscode.ExtensionContext) {
  client = new DaemonClient(context);
  terminals = new TerminalController(client);
  contextCollector = new ContextCollector(client);

  // Handle incoming daemon messages
  client.on('message', async (msg: any) => {
    if (msg.type === 'vscode_command') {
      const command = msg as VscodeCommand;
      const payload = command.payload || {};

      switch (command.cmd) {
        case 'send_text':
          terminals?.sendText(payload.text || '', payload.execute !== false);
          break;
        case 'send_sequence':
          await terminals?.sendSequence(payload.sequence);
          break;
        case 'focus_terminal':
          terminals?.focusTerminal(payload.index || 0);
          break;
        case 'cycle_terminal':
          terminals?.cycleTerminal(payload.direction || 1);
          break;
        case 'open_uri':
          await openUri(payload.uri);
          break;
        case 'reveal_receipt':
          await revealReceipt(payload.path);
          break;
      }
    }
  });

  context.subscriptions.push(
    client,
    vscode.commands.registerCommand('runbook.connect', () => client?.connect()),
    vscode.commands.registerCommand('runbook.disconnect', () => client?.disconnect()),
    vscode.commands.registerCommand('runbook.dispatchTest', () => {
      // Useful for testing without the device
      terminals?.sendText('echo "Test dispatch"', true);
    })
  );

  // Auto-connect on startup
  client.connect();
}

export function deactivate() {
  client?.dispose();
}
