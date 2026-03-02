import * as assert from 'assert';
import { ReconnectBackoff } from '../../transport/reconnectBackoff';

suite('ReconnectBackoff Tests', () => {
  test('starts at initial backoff and multiplies by 1.5', () => {
    const backoff = new ReconnectBackoff(1000, 30000, 1.5);

    const first = backoff.next();
    const second = backoff.next();
    const third = backoff.next();

    assert.strictEqual(first.delayMs, 1000);
    assert.strictEqual(first.nextBackoffMs, 1500);

    assert.strictEqual(second.delayMs, 1500);
    assert.strictEqual(second.nextBackoffMs, 2250);

    assert.strictEqual(third.delayMs, 2250);
    assert.strictEqual(third.nextBackoffMs, 3375);
  });

  test('caps at max backoff', () => {
    const backoff = new ReconnectBackoff(1000, 2000, 3);

    const first = backoff.next();
    const second = backoff.next();
    const third = backoff.next();

    assert.strictEqual(first.delayMs, 1000);
    assert.strictEqual(second.delayMs, 2000);
    assert.strictEqual(third.delayMs, 2000);
  });

  test('reset returns to initial backoff', () => {
    const backoff = new ReconnectBackoff(500, 5000, 2);

    backoff.next();
    backoff.next();
    backoff.reset();

    assert.strictEqual(backoff.getCurrentBackoffMs(), 500);

    const next = backoff.next();
    assert.strictEqual(next.delayMs, 500);
    assert.strictEqual(next.nextBackoffMs, 1000);
  });
});
