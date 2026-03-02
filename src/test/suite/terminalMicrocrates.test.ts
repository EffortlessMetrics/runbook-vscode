import * as assert from 'assert';
import { encodeTerminalSequence } from '../../terminals/sequenceCodec';
import { buildTerminalTelemetry } from '../../terminals/telemetryBuilder';

suite('Terminal microcrates', () => {
  test('encodeTerminalSequence maps named control inputs', () => {
    assert.deepStrictEqual(encodeTerminalSequence('Enter'), { text: '', execute: true });
    assert.deepStrictEqual(encodeTerminalSequence('Esc'), { text: '\u001b', execute: false });
    assert.deepStrictEqual(encodeTerminalSequence('Ctrl+C'), { text: '\u0003', execute: false });
  });

  test('encodeTerminalSequence passes through unknown sequences', () => {
    assert.deepStrictEqual(encodeTerminalSequence('raw'), { text: 'raw', execute: false });
  });

  test('buildTerminalTelemetry produces expected payload shape', () => {
    const t1 = { name: 'one' } as any;
    const t2 = { name: 'two' } as any;
    const tags = new Map<any, string>([[t2, 'session-2']]);

    const telemetry = buildTerminalTelemetry([t1, t2], tags, 1);

    assert.strictEqual(telemetry.type, 'vscode_telemetry');
    assert.strictEqual(telemetry.terminals_count, 2);
    assert.strictEqual(telemetry.active_terminal_index, 1);
    assert.deepStrictEqual(telemetry.terminals, [
      { name: 'one', session_tag: undefined },
      { name: 'two', session_tag: 'session-2' }
    ]);
  });
});
