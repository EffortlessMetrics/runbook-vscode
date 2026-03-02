import * as assert from 'assert';
import { translateSequence } from '../../terminals/sequenceTranslator';

suite('Sequence translator microcrate', () => {
  test('maps Enter to execute=true with empty payload', () => {
    assert.deepStrictEqual(translateSequence('Enter'), { text: '', execute: true });
  });

  test('maps Esc to terminal escape char', () => {
    assert.deepStrictEqual(translateSequence('Esc'), { text: '\u001b', execute: false });
  });

  test('maps Ctrl+C to terminal interrupt char', () => {
    assert.deepStrictEqual(translateSequence('Ctrl+C'), { text: '\u0003', execute: false });
  });

  test('passes unknown sequences through as non-executing text', () => {
    assert.deepStrictEqual(translateSequence('custom-seq'), { text: 'custom-seq', execute: false });
  });
});
