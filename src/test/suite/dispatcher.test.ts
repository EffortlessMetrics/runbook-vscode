import * as assert from 'assert';
import { dispatchVscodeCommand, CommandHandlers } from '../../commands/dispatcher';
import { VscodeCommand } from '../../protocol';

suite('Command Dispatcher Tests', () => {
  const makeHandlers = () => {
    const calls: string[] = [];

    const handlers: CommandHandlers = {
      sendText: (text, execute) => calls.push(`sendText:${text}:${execute}`),
      sendSequence: async (sequence) => { calls.push(`sendSequence:${sequence}`); },
      focusTerminal: (index) => calls.push(`focusTerminal:${index}`),
      cycleTerminal: (direction) => calls.push(`cycleTerminal:${direction}`),
      openUri: async (uri) => { calls.push(`openUri:${uri ?? ''}`); },
      revealReceipt: async (path) => { calls.push(`revealReceipt:${path ?? ''}`); },
      startClaudeSession: () => calls.push('startClaudeSession')
    };

    return { handlers, calls };
  };

  test('dispatches send_text with defaults', async () => {
    const { handlers, calls } = makeHandlers();
    const command: VscodeCommand = {
      protocol: 1,
      type: 'vscode_command',
      cmd: 'send_text',
      payload: { text: 'hello' }
    };

    await dispatchVscodeCommand(command, handlers);
    assert.deepStrictEqual(calls, ['sendText:hello:true']);
  });

  test('dispatches send_sequence', async () => {
    const { handlers, calls } = makeHandlers();
    const command: VscodeCommand = {
      protocol: 1,
      type: 'vscode_command',
      cmd: 'send_sequence',
      payload: { sequence: 'Ctrl+C' }
    };

    await dispatchVscodeCommand(command, handlers);
    assert.deepStrictEqual(calls, ['sendSequence:Ctrl+C']);
  });

  test('dispatches navigation and jumpgates', async () => {
    const { handlers, calls } = makeHandlers();

    const commands: VscodeCommand[] = [
      { protocol: 1, type: 'vscode_command', cmd: 'focus_terminal', payload: { index: 2 } },
      { protocol: 1, type: 'vscode_command', cmd: 'cycle_terminal', payload: { direction: -1 } },
      { protocol: 1, type: 'vscode_command', cmd: 'open_uri', payload: { uri: 'https://example.com' } },
      { protocol: 1, type: 'vscode_command', cmd: 'reveal_receipt', payload: { path: '/tmp/receipt.md' } },
      { protocol: 1, type: 'vscode_command', cmd: 'start_claude_session', payload: {} }
    ];

    for (const command of commands) {
      await dispatchVscodeCommand(command, handlers);
    }

    assert.deepStrictEqual(calls, [
      'focusTerminal:2',
      'cycleTerminal:-1',
      'openUri:https://example.com',
      'revealReceipt:/tmp/receipt.md',
      'startClaudeSession'
    ]);
  });
});
