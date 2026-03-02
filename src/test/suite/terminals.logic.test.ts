import * as assert from 'assert';
import {
  cycleSelectedTerminalIndex,
  isTerminalIndexInRange,
  resolveSelectedTerminalIndex
} from '../../terminals/selection';
import { toSequenceDispatch } from '../../terminals/sequences';

suite('Terminal Logic Tests', () => {
  test('resolveSelectedTerminalIndex uses current when in range', () => {
    assert.strictEqual(resolveSelectedTerminalIndex(2, 4, 1), 2);
  });

  test('resolveSelectedTerminalIndex falls back to active terminal index', () => {
    assert.strictEqual(resolveSelectedTerminalIndex(-1, 3, 1), 1);
  });

  test('resolveSelectedTerminalIndex falls back to first terminal', () => {
    assert.strictEqual(resolveSelectedTerminalIndex(-1, 3, undefined), 0);
  });

  test('resolveSelectedTerminalIndex returns -1 when no terminals exist', () => {
    assert.strictEqual(resolveSelectedTerminalIndex(0, 0, 0), -1);
  });

  test('cycleSelectedTerminalIndex wraps forward and backward', () => {
    assert.strictEqual(cycleSelectedTerminalIndex(2, 3, 1), 0);
    assert.strictEqual(cycleSelectedTerminalIndex(0, 3, -1), 2);
  });

  test('cycleSelectedTerminalIndex returns -1 when no terminals exist', () => {
    assert.strictEqual(cycleSelectedTerminalIndex(0, 0, 1), -1);
  });

  test('isTerminalIndexInRange validates bounds', () => {
    assert.strictEqual(isTerminalIndexInRange(0, 2), true);
    assert.strictEqual(isTerminalIndexInRange(2, 2), false);
    assert.strictEqual(isTerminalIndexInRange(-1, 2), false);
  });

  test('toSequenceDispatch maps supported control sequences', () => {
    assert.deepStrictEqual(toSequenceDispatch('Enter'), { text: '', execute: true });
    assert.deepStrictEqual(toSequenceDispatch('Esc'), { text: '\u001b', execute: false });
    assert.deepStrictEqual(toSequenceDispatch('Ctrl+C'), { text: '\u0003', execute: false });
  });

  test('toSequenceDispatch passes through custom sequence text', () => {
    assert.deepStrictEqual(toSequenceDispatch('custom'), { text: 'custom', execute: false });
  });
});
