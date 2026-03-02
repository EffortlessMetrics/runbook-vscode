import * as assert from 'assert';
import { resolveTerminalSequence } from '../../terminals/sequence';

suite('Terminal Sequence Resolver Tests', () => {
  test('resolves Enter to execute an empty command', () => {
    const resolved = resolveTerminalSequence('Enter');
    assert.deepStrictEqual(resolved, { text: '', execute: true });
  });

  test('resolves Esc to escape byte without execute', () => {
    const resolved = resolveTerminalSequence('Esc');
    assert.deepStrictEqual(resolved, { text: '\u001b', execute: false });
  });

  test('resolves Ctrl+C to interrupt byte without execute', () => {
    const resolved = resolveTerminalSequence('Ctrl+C');
    assert.deepStrictEqual(resolved, { text: '\u0003', execute: false });
  });

  test('passes through unknown sequences as raw text', () => {
    const resolved = resolveTerminalSequence('\u001b[200~');
    assert.deepStrictEqual(resolved, { text: '\u001b[200~', execute: false });
  });
});
