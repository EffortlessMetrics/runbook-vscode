import * as assert from 'assert';
import { translateSequenceAction } from '../../terminals/sequenceTranslator';
import { buildTerminalTelemetryPayload } from '../../terminals/telemetry';

suite('Terminal Microcrates Tests', () => {
  test('translateSequenceAction maps Enter to sendText execute', () => {
    assert.deepStrictEqual(translateSequenceAction('Enter'), {
      kind: 'sendText',
      text: '',
      execute: true
    });
  });

  test('translateSequenceAction maps control aliases to raw sequences', () => {
    assert.deepStrictEqual(translateSequenceAction('Esc'), {
      kind: 'raw',
      value: '\u001b'
    });

    assert.deepStrictEqual(translateSequenceAction('Ctrl+C'), {
      kind: 'raw',
      value: '\u0003'
    });
  });

  test('translateSequenceAction passes unknown sequences through', () => {
    assert.deepStrictEqual(translateSequenceAction('abc'), {
      kind: 'raw',
      value: 'abc'
    });
  });

  test('buildTerminalTelemetryPayload computes telemetry fields', () => {
    const term1 = { name: 'term-1' };
    const term2 = { name: 'term-2' };
    const tags = new Map<any, string>([[term2, 'session-2']]);

    const payload = buildTerminalTelemetryPayload(
      [term1 as any, term2 as any],
      1,
      tags as any
    );

    assert.strictEqual(payload.protocol, 1);
    assert.strictEqual(payload.type, 'vscode_telemetry');
    assert.strictEqual(payload.terminals_count, 2);
    assert.strictEqual(payload.active_terminal_index, 1);
    assert.strictEqual(payload.selected_terminal_index, 1);
    assert.deepStrictEqual(payload.terminals, [
      { name: 'term-1', session_tag: undefined },
      { name: 'term-2', session_tag: 'session-2' }
    ]);
  });
});
