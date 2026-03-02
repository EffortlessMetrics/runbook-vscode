import * as assert from 'assert';
import { getCycledTerminalIndex } from '../../terminals/cycleIndex';
import { resolveTerminalSequence } from '../../terminals/sequences';

suite('Terminal Microcrate Tests', () => {
  test('getCycledTerminalIndex wraps forward and backward', () => {
    assert.strictEqual(getCycledTerminalIndex(2, 1, 3), 0);
    assert.strictEqual(getCycledTerminalIndex(0, -1, 3), 2);
  });

  test('getCycledTerminalIndex normalizes invalid current index', () => {
    assert.strictEqual(getCycledTerminalIndex(-1, 1, 4), 1);
    assert.strictEqual(getCycledTerminalIndex(99, 2, 4), 2);
  });

  test('getCycledTerminalIndex returns -1 for empty lists', () => {
    assert.strictEqual(getCycledTerminalIndex(0, 1, 0), -1);
  });

  test('resolveTerminalSequence maps named control sequences', () => {
    assert.deepStrictEqual(resolveTerminalSequence('Enter'), { mode: 'newline', value: '' });
    assert.deepStrictEqual(resolveTerminalSequence('Esc'), { mode: 'raw', value: '\u001b' });
    assert.deepStrictEqual(resolveTerminalSequence('Ctrl+C'), { mode: 'raw', value: '\u0003' });
  });

  test('resolveTerminalSequence passes unknown sequences through as raw', () => {
    assert.deepStrictEqual(resolveTerminalSequence('custom'), { mode: 'raw', value: 'custom' });
  });
});
