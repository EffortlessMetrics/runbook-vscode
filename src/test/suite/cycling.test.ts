import * as assert from 'assert';
import * as fc from 'fast-check';
import { calculateCycleIndex } from '../../terminals/controller';

suite('Terminal Cycling Math Properties', () => {
  test('calculateCycleIndex always returns a valid index within bounds', () => {
    fc.assert(
      fc.property(
        fc.integer(), // currentIndex could be uninitialized (-1) or wildly out of bounds
        fc.integer(), // delta can be extreme negative or positive numbers
        fc.integer({ min: 1, max: 1000 }), // length must be positive
        (currentIndex, delta, length) => {
          const nextIndex = calculateCycleIndex(currentIndex, delta, length);
          // Property: index must be strictly between 0 and length - 1
          return nextIndex >= 0 && nextIndex < length;
        }
      )
    );
  });

  test('calculateCycleIndex with +1 delta wraps correctly forward', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100 }),
        (length) => {
          let idx = 0;
          for (let i = 0; i < length + 5; i++) {
            const nextIdx = calculateCycleIndex(idx, 1, length);
            assert.strictEqual(nextIdx, (idx + 1) % length);
            idx = nextIdx;
          }
          return true;
        }
      )
    );
  });
});
