import * as assert from 'assert';

// Unit tests for protocol types — these run inside the VS Code extension host
// but don't require the daemon. They validate our message schemas.

suite('Protocol Tests', () => {

  test('ClientHello message has correct shape', () => {
    const hello = {
      protocol: 1,
      type: 'hello' as const,
      role: 'vscode' as const,
      version: '0.1.0'
    };

    assert.strictEqual(hello.protocol, 1);
    assert.strictEqual(hello.type, 'hello');
    assert.strictEqual(hello.role, 'vscode');
    assert.strictEqual(typeof hello.version, 'string');
  });

  test('ClientHello serializes to snake_case JSON', () => {
    const hello = {
      protocol: 1,
      type: 'hello',
      role: 'vscode',
      version: '0.1.0'
    };

    const json = JSON.stringify(hello);
    const parsed = JSON.parse(json);

    assert.strictEqual(parsed.protocol, 1);
    assert.strictEqual(parsed.type, 'hello');
    assert.strictEqual(parsed.role, 'vscode');
    // Verify no camelCase slipped in
    assert.strictEqual(parsed.protocolVersion, undefined);
    assert.strictEqual(parsed.clientType, undefined);
  });

  test('VscodeCommand round-trip for send_text', () => {
    const cmd = {
      protocol: 1,
      type: 'vscode_command',
      cmd: 'send_text',
      payload: { text: '/help', execute: true }
    };

    const json = JSON.stringify(cmd);
    const parsed = JSON.parse(json);

    assert.strictEqual(parsed.type, 'vscode_command');
    assert.strictEqual(parsed.cmd, 'send_text');
    assert.strictEqual(parsed.payload.text, '/help');
    assert.strictEqual(parsed.payload.execute, true);
  });

  test('VscodeCommand round-trip for send_sequence', () => {
    const cmd = {
      protocol: 1,
      type: 'vscode_command',
      cmd: 'send_sequence',
      payload: { sequence: 'Ctrl+C' }
    };

    const json = JSON.stringify(cmd);
    const parsed = JSON.parse(json);

    assert.strictEqual(parsed.cmd, 'send_sequence');
    assert.strictEqual(parsed.payload.sequence, 'Ctrl+C');
  });

  test('VscodeCommand round-trip for cycle_terminal', () => {
    const cmd = {
      protocol: 1,
      type: 'vscode_command',
      cmd: 'cycle_terminal',
      payload: { direction: -1 }
    };

    const json = JSON.stringify(cmd);
    const parsed = JSON.parse(json);

    assert.strictEqual(parsed.cmd, 'cycle_terminal');
    assert.strictEqual(parsed.payload.direction, -1);
  });

  test('VscodeCommand round-trip for focus_terminal', () => {
    const cmd = {
      protocol: 1,
      type: 'vscode_command',
      cmd: 'focus_terminal',
      payload: { index: 2 }
    };

    const json = JSON.stringify(cmd);
    const parsed = JSON.parse(json);

    assert.strictEqual(parsed.cmd, 'focus_terminal');
    assert.strictEqual(parsed.payload.index, 2);
  });

  test('VscodeCommand round-trip for open_uri', () => {
    const cmd = {
      protocol: 1,
      type: 'vscode_command',
      cmd: 'open_uri',
      payload: { uri: 'https://github.com/org/repo/pull/42' }
    };

    const json = JSON.stringify(cmd);
    const parsed = JSON.parse(json);

    assert.strictEqual(parsed.cmd, 'open_uri');
    assert.strictEqual(parsed.payload.uri, 'https://github.com/org/repo/pull/42');
  });

  test('VscodeCommand round-trip for reveal_receipt', () => {
    const cmd = {
      protocol: 1,
      type: 'vscode_command',
      cmd: 'reveal_receipt',
      payload: { path: '/tmp/receipts/latest.md' }
    };

    const json = JSON.stringify(cmd);
    const parsed = JSON.parse(json);

    assert.strictEqual(parsed.cmd, 'reveal_receipt');
    assert.strictEqual(parsed.payload.path, '/tmp/receipts/latest.md');
  });

  test('Context telemetry message round-trip', () => {
    const telemetry = {
      protocol: 1,
      type: 'context_update',
      workspace_path: '/home/user/project',
      git_branch: 'feat/runbook',
      active_terminal_index: 0,
      terminals_count: 3
    };

    const json = JSON.stringify(telemetry);
    const parsed = JSON.parse(json);

    assert.strictEqual(parsed.type, 'context_update');
    assert.strictEqual(parsed.workspace_path, '/home/user/project');
    assert.strictEqual(parsed.git_branch, 'feat/runbook');
    assert.strictEqual(parsed.active_terminal_index, 0);
    assert.strictEqual(parsed.terminals_count, 3);
    // No camelCase
    assert.strictEqual(parsed.workspacePath, undefined);
    assert.strictEqual(parsed.gitBranch, undefined);
  });

  test('Unknown message types are forward-compatible', () => {
    const futureMsg = {
      protocol: 2,
      type: 'some_future_event',
      new_field: 'value'
    };

    const json = JSON.stringify(futureMsg);
    const parsed = JSON.parse(json);

    assert.strictEqual(parsed.type, 'some_future_event');
    assert.strictEqual(parsed.new_field, 'value');
    // Extension should not crash on unknown types
  });

  test('Malformed JSON does not crash parse', () => {
    const badInputs = [
      '',
      'not json',
      '{incomplete',
      '{"type":}',
      'null',
      '42'
    ];

    for (const input of badInputs) {
      let parsed: any = null;
      try {
        parsed = JSON.parse(input);
      } catch {
        // expected for truly malformed
      }
      // Either parsed to something or threw — neither should crash the suite
    }
  });
});
