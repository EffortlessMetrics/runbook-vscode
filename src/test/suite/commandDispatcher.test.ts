import * as assert from 'assert';
import { dispatchVscodeCommand, CommandDispatchContext } from '../../dispatch/commandDispatcher';
import { VscodeCommand } from '../../protocol';

suite('Command Dispatcher Tests', () => {
  function buildContext() {
    const calls: string[] = [];

    const context: CommandDispatchContext = {
      terminals: {
        sendText: (text: string, execute?: boolean) => calls.push(`sendText:${text}:${String(execute)}`),
        sendSequence: async (sequence: string) => { calls.push(`sendSequence:${sequence}`); },
        focusTerminal: (index: number) => calls.push(`focusTerminal:${index}`),
        cycleTerminal: (delta: number) => calls.push(`cycleTerminal:${delta}`),
        startClaudeSession: () => calls.push('startClaudeSession')
      },
      jumpgates: {
        openUri: async (uri: string) => { calls.push(`openUri:${uri}`); },
        revealReceipt: async (path: string) => { calls.push(`revealReceipt:${path}`); }
      }
    };

    return { context, calls };
  }

  test('send_text defaults execute to true', async () => {
    const { context, calls } = buildContext();
    const command: VscodeCommand = {
      protocol: 1,
      type: 'vscode_command',
      cmd: 'send_text',
      payload: { text: 'echo test' }
    };

    await dispatchVscodeCommand(command, context);
    assert.deepStrictEqual(calls, ['sendText:echo test:true']);
  });

  test('focus_terminal dispatches with default index', async () => {
    const { context, calls } = buildContext();
    const command: VscodeCommand = {
      protocol: 1,
      type: 'vscode_command',
      cmd: 'focus_terminal',
      payload: {}
    };

    await dispatchVscodeCommand(command, context);
    assert.deepStrictEqual(calls, ['focusTerminal:0']);
  });

  test('open_uri routes to jumpgate actuator', async () => {
    const { context, calls } = buildContext();
    const command: VscodeCommand = {
      protocol: 1,
      type: 'vscode_command',
      cmd: 'open_uri',
      payload: { uri: 'https://example.com' }
    };

    await dispatchVscodeCommand(command, context);
    assert.deepStrictEqual(calls, ['openUri:https://example.com']);
  });

  test('start_claude_session routes to terminal actuator', async () => {
    const { context, calls } = buildContext();
    const command: VscodeCommand = {
      protocol: 1,
      type: 'vscode_command',
      cmd: 'start_claude_session',
      payload: {}
    };

    await dispatchVscodeCommand(command, context);
    assert.deepStrictEqual(calls, ['startClaudeSession']);
  });
});
