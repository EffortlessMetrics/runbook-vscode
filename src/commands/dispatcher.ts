import * as vscode from 'vscode';
import { openUri, revealReceipt } from '../jumpgates';
import { VscodeCommand } from '../protocol';
import { TerminalController } from '../terminals/controller';

export async function dispatchVscodeCommand(command: VscodeCommand, terminals: TerminalController): Promise<void> {
  const payload = command.payload || {};

  switch (command.cmd) {
    case 'send_text':
      terminals.sendText(payload.text || '', payload.execute !== false);
      break;

    case 'send_sequence': {
      const { sequence } = payload;
      const term = vscode.window.activeTerminal;
      if (term) {
        term.show(false);
        await terminals.sendSequence(sequence);
      }
      break;
    }

    case 'focus_terminal':
      terminals.focusTerminal(payload.index || 0);
      break;

    case 'cycle_terminal':
      terminals.cycleTerminal(payload.direction || 1);
      break;

    case 'open_uri':
      await openUri(payload.uri);
      break;

    case 'reveal_receipt':
      await revealReceipt(payload.path);
      break;

    case 'start_claude_session':
      terminals.startClaudeSession();
      break;
  }
}
