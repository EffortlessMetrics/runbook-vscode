import * as assert from 'assert';
import { cycleTerminalIndex, resolveSelectedTerminalIndex } from '../../terminals/selection';

suite('Terminal Selection Helpers', () => {
  test('resolveSelectedTerminalIndex returns selected index when valid', () => {
    const idx = resolveSelectedTerminalIndex({
      terminalCount: 3,
      selectedTerminalIndex: 2,
      activeTerminalIndex: 1
    });

    assert.strictEqual(idx, 2);
  });

  test('resolveSelectedTerminalIndex falls back to active terminal index', () => {
    const idx = resolveSelectedTerminalIndex({
      terminalCount: 3,
      selectedTerminalIndex: 10,
      activeTerminalIndex: 1
    });

    assert.strictEqual(idx, 1);
  });

  test('resolveSelectedTerminalIndex falls back to first terminal when selected and active are invalid', () => {
    const idx = resolveSelectedTerminalIndex({
      terminalCount: 3,
      selectedTerminalIndex: -1,
      activeTerminalIndex: -1
    });

    assert.strictEqual(idx, 0);
  });

  test('resolveSelectedTerminalIndex returns -1 when there are no terminals', () => {
    const idx = resolveSelectedTerminalIndex({
      terminalCount: 0,
      selectedTerminalIndex: 0,
      activeTerminalIndex: 0
    });

    assert.strictEqual(idx, -1);
  });

  test('cycleTerminalIndex wraps forward and backward', () => {
    assert.strictEqual(cycleTerminalIndex(2, 3, 1), 0);
    assert.strictEqual(cycleTerminalIndex(0, 3, -1), 2);
  });

  test('cycleTerminalIndex starts at 0 when current index is invalid', () => {
    assert.strictEqual(cycleTerminalIndex(9, 3, 1), 1);
  });

  test('cycleTerminalIndex returns -1 when terminal count is zero', () => {
    assert.strictEqual(cycleTerminalIndex(0, 0, 1), -1);
  });
});
