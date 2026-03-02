import { VscodeCommand } from '../protocol';

export interface CommandHandlers {
  sendText(text: string, execute: boolean): void;
  sendSequence(sequence: string): Promise<void>;
  focusTerminal(index: number): void;
  cycleTerminal(direction: number): void;
  openUri(uri?: string): Promise<void>;
  revealReceipt(path?: string): Promise<void>;
  startClaudeSession(): void;
}

export async function dispatchVscodeCommand(command: VscodeCommand, handlers: CommandHandlers): Promise<void> {
  const payload = command.payload ?? {};

  switch (command.cmd) {
    case 'send_text':
      handlers.sendText(payload.text ?? '', payload.execute !== false);
      return;

    case 'send_sequence':
      await handlers.sendSequence(payload.sequence ?? 'Enter');
      return;

    case 'focus_terminal':
      handlers.focusTerminal(payload.index ?? 0);
      return;

    case 'cycle_terminal':
      handlers.cycleTerminal(payload.direction ?? 1);
      return;

    case 'open_uri':
      await handlers.openUri(payload.uri);
      return;

    case 'reveal_receipt':
      await handlers.revealReceipt(payload.path);
      return;

    case 'start_claude_session':
      handlers.startClaudeSession();
      return;
  }
}
