import * as assert from 'assert';
import { buildClientHello, parseDaemonMessage } from '../../transport/clientProtocol';
import { ReconnectPolicy } from '../../transport/reconnectPolicy';

suite('Transport Microcrate Tests', () => {
  test('buildClientHello returns protocol-compliant payload', () => {
    const hello = buildClientHello('0.2.0');

    assert.strictEqual(hello.protocol, 1);
    assert.strictEqual(hello.type, 'hello');
    assert.strictEqual(hello.role, 'vscode');
    assert.strictEqual(hello.version, '0.2.0');
    assert.strictEqual(hello.capabilities?.start_session, true);
  });

  test('parseDaemonMessage returns null for invalid JSON', () => {
    assert.strictEqual(parseDaemonMessage('{broken'), null);
  });

  test('parseDaemonMessage parses valid daemon messages', () => {
    const parsed = parseDaemonMessage('{"type":"hello_ack","protocol":1}');

    assert.ok(parsed);
    assert.strictEqual(parsed?.type, 'hello_ack');
  });

  test('ReconnectPolicy consumes and caps backoff progression', () => {
    const policy = new ReconnectPolicy(1000, 3000, 2);

    assert.strictEqual(policy.consumeDelayMs(), 1000);
    assert.strictEqual(policy.consumeDelayMs(), 2000);
    assert.strictEqual(policy.consumeDelayMs(), 3000);
    assert.strictEqual(policy.consumeDelayMs(), 3000);
  });

  test('ReconnectPolicy reset returns backoff to initial value', () => {
    const policy = new ReconnectPolicy(500, 2000, 2);

    policy.consumeDelayMs();
    policy.consumeDelayMs();
    policy.reset();

    assert.strictEqual(policy.currentDelayMs(), 500);
  });
});
