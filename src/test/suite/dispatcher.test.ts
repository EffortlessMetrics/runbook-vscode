import * as assert from 'assert';
import * as vscode from 'vscode';
import * as jumpgates from '../../jumpgates';
import { dispatchVscodeCommand } from '../../commands';
import { VscodeCommand } from '../../protocol';

type TerminalControllerLike = {
  sendText: (text: string, execute?: boolean) => void;
  sendSequence: (sequence: string) => Promise<void>;
  focusTerminal: (index: number) => void;
  cycleTerminal: (direction: number) => void;
  startClaudeSession: () => void;
};

suite('Command Dispatcher Tests', () => {
  function makeCommand(cmd: VscodeCommand['cmd'], payload?: any): VscodeCommand {
    return { protocol: 1, type: 'vscode_command', cmd, payload };
  }

  function makeTerminalController(log: string[]): TerminalControllerLike {
    return {
      sendText: (text: string, execute = true) => log.push(`sendText:${text}:${execute}`),
      sendSequence: async (sequence: string) => {
        log.push(`sendSequence:${sequence}`);
      },
      focusTerminal: (index: number) => log.push(`focus:${index}`),
      cycleTerminal: (direction: number) => log.push(`cycle:${direction}`),
      startClaudeSession: () => log.push('startClaudeSession')
    };
  }

  test('send_text routes to terminal controller', async () => {
    const log: string[] = [];
    const terminals = makeTerminalController(log);

    await dispatchVscodeCommand(makeCommand('send_text', { text: 'echo hi', execute: false }), terminals as any);

    assert.deepStrictEqual(log, ['sendText:echo hi:false']);
  });

  test('send_sequence focuses active terminal and dispatches sequence', async () => {
    const log: string[] = [];
    const terminals = makeTerminalController(log);
    const activeTerminal = { show: (preserveFocus: boolean) => log.push(`show:${preserveFocus}`) } as any;

    const originalDescriptor = Object.getOwnPropertyDescriptor(vscode.window, 'activeTerminal');
    Object.defineProperty(vscode.window, 'activeTerminal', {
      configurable: true,
      get: () => activeTerminal
    });

    try {
      await dispatchVscodeCommand(makeCommand('send_sequence', { sequence: 'Enter' }), terminals as any);
    } finally {
      if (originalDescriptor) {
        Object.defineProperty(vscode.window, 'activeTerminal', originalDescriptor);
      }
    }

    assert.deepStrictEqual(log, ['show:false', 'sendSequence:Enter']);
  });

  test('open_uri and reveal_receipt call jumpgates', async () => {
    const log: string[] = [];
    const terminals = makeTerminalController(log);

    const originalOpenUri = jumpgates.openUri;
    const originalRevealReceipt = jumpgates.revealReceipt;
    (jumpgates as any).openUri = async (uri?: string) => log.push(`openUri:${uri}`);
    (jumpgates as any).revealReceipt = async (path?: string) => log.push(`revealReceipt:${path}`);

    try {
      await dispatchVscodeCommand(makeCommand('open_uri', { uri: 'https://example.com' }), terminals as any);
      await dispatchVscodeCommand(makeCommand('reveal_receipt', { path: '/tmp/receipt.md' }), terminals as any);
    } finally {
      (jumpgates as any).openUri = originalOpenUri;
      (jumpgates as any).revealReceipt = originalRevealReceipt;
    }

    assert.deepStrictEqual(log, ['openUri:https://example.com', 'revealReceipt:/tmp/receipt.md']);
  });
});
