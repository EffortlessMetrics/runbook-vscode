import * as vscode from 'vscode';
import { VscodeCommand } from '../protocol';

export interface TerminalActuator {
  sendText(text: string, execute?: boolean): void;
  sendSequence(sequence: string): Promise<void>;
  focusTerminal(index: number): void;
  cycleTerminal(delta: number): void;
  startClaudeSession(): void;
}

export interface JumpgateActuator {
  openUri(uri: string): Promise<void>;
  revealReceipt(path: string): Promise<void>;
}

export interface CommandDispatchContext {
  terminals: TerminalActuator;
  jumpgates: JumpgateActuator;
}

/**
 * Handles a single daemon command. Keeps command decoding centralized so
 * extension activation remains focused on wiring.
 */
export async function dispatchVscodeCommand(
  command: VscodeCommand,
  context: CommandDispatchContext
): Promise<void> {
  const payload = command.payload || {};

  switch (command.cmd) {
    case 'send_text':
      context.terminals.sendText(payload.text || '', payload.execute !== false);
      return;

    case 'send_sequence': {
      const { sequence } = payload;
      const term = vscode.window.activeTerminal;
      if (term) {
        term.show(false);
        await context.terminals.sendSequence(sequence);
      }
      return;
    }

    case 'focus_terminal':
      context.terminals.focusTerminal(payload.index || 0);
      return;

    case 'cycle_terminal':
      context.terminals.cycleTerminal(payload.direction || 1);
      return;

    case 'open_uri':
      await context.jumpgates.openUri(payload.uri);
      return;

    case 'reveal_receipt':
      await context.jumpgates.revealReceipt(payload.path);
      return;

    case 'start_claude_session':
      context.terminals.startClaudeSession();
      return;
  }
}
