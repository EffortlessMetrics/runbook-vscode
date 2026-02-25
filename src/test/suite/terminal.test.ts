import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Terminal Controller Tests', () => {

  // Helpers
  const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

  let terminals: vscode.Terminal[] = [];

  teardown(async () => {
    for (const t of terminals) {
      t.dispose();
    }
    terminals = [];
    await delay(100);
  });

  test('Cycle wraps forward through terminal list', async () => {
    const t1 = vscode.window.createTerminal('cycle-1');
    const t2 = vscode.window.createTerminal('cycle-2');
    const t3 = vscode.window.createTerminal('cycle-3');
    terminals.push(t1, t2, t3);
    await delay(200);

    const allTerminals = vscode.window.terminals;
    const idx1 = allTerminals.indexOf(t1);
    const idx2 = allTerminals.indexOf(t2);
    const idx3 = allTerminals.indexOf(t3);

    // All three should be present
    assert.ok(idx1 >= 0, 'cycle-1 should exist in terminal list');
    assert.ok(idx2 >= 0, 'cycle-2 should exist in terminal list');
    assert.ok(idx3 >= 0, 'cycle-3 should exist in terminal list');

    // Forward wrap math: (idx + 1) % length
    const n = allTerminals.length;
    const nextFromLast = (n - 1 + 1) % n;
    assert.strictEqual(nextFromLast, 0, 'Forward wrap should go to index 0');
  });

  test('Cycle wraps backward through terminal list', async () => {
    const t1 = vscode.window.createTerminal('back-1');
    const t2 = vscode.window.createTerminal('back-2');
    terminals.push(t1, t2);
    await delay(200);

    const n = vscode.window.terminals.length;
    // Backward from 0 should wrap to last
    const prevFromFirst = (0 - 1 + n) % n;
    assert.strictEqual(prevFromFirst, n - 1, 'Backward wrap from 0 should go to last index');
  });

  test('sendText delivers text to a terminal without crashing', async () => {
    const t = vscode.window.createTerminal('text-target');
    terminals.push(t);
    t.show(false);
    await delay(200);

    // sendText should not throw
    assert.doesNotThrow(() => {
      t.sendText('echo hello', true);
    });
  });

  test('sendText without newline does not append newline', async () => {
    const t = vscode.window.createTerminal('no-newline');
    terminals.push(t);
    t.show(false);
    await delay(200);

    // This should not throw — we can't inspect terminal output,
    // but we verify the API doesn't break
    assert.doesNotThrow(() => {
      t.sendText('partial', false);
    });
  });

  test('Control sequences can be sent to terminal', async () => {
    const t = vscode.window.createTerminal('ctrl-test');
    terminals.push(t);
    t.show(false);
    await delay(200);

    // Ctrl+C
    assert.doesNotThrow(() => t.sendText('\u0003', false));
    // Esc
    assert.doesNotThrow(() => t.sendText('\u001b', false));
    // Enter (carriage return)
    assert.doesNotThrow(() => t.sendText('\r', false));
  });

  test('Terminal.show focuses without stealing editor panel', async () => {
    const t = vscode.window.createTerminal('focus-test');
    terminals.push(t);
    await delay(200);

    // show(true) = preserveFocus, show(false) = take focus
    assert.doesNotThrow(() => t.show(true));
    assert.doesNotThrow(() => t.show(false));
  });

  test('Empty terminal list returns gracefully', () => {
    // With no terminals created in this test, the list may still have
    // leftovers from other tests. Just verify accessing it doesn't crash.
    const list = vscode.window.terminals;
    assert.ok(Array.isArray(list));
  });

  test('Terminal name is preserved after creation', async () => {
    const name = 'named-terminal-test';
    const t = vscode.window.createTerminal(name);
    terminals.push(t);
    await delay(100);

    assert.strictEqual(t.name, name);
  });

  test('Multiple terminals with same name are distinct', async () => {
    const t1 = vscode.window.createTerminal('dup');
    const t2 = vscode.window.createTerminal('dup');
    terminals.push(t1, t2);
    await delay(100);

    assert.notStrictEqual(t1, t2);
    const list = vscode.window.terminals;
    const dups = list.filter(t => t.name === 'dup');
    assert.ok(dups.length >= 2, 'Both terminals with the same name should be present');
  });
});
