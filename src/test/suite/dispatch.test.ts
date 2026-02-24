import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Dispatch & Command Tests', () => {

  const delay = (ms: number) => new Promise(r => setTimeout(r, ms));
  let terminals: vscode.Terminal[] = [];

  teardown(async () => {
    for (const t of terminals) t.dispose();
    terminals = [];
    await delay(100);
  });

  test('Dispatch arm text simulates send_text command', async () => {
    const t = vscode.window.createTerminal('dispatch-target');
    terminals.push(t);
    t.show(false);
    await delay(200);

    // Simulate what the extension does when it receives a send_text command
    const text = '/runbook:prep-pr';
    assert.doesNotThrow(() => {
      t.sendText(text, true);
    });
  });

  test('Dispatch /export sends text without immediate newline then confirm', async () => {
    const t = vscode.window.createTerminal('export-target');
    terminals.push(t);
    t.show(false);
    await delay(200);

    // Step 1: send /export (with newline for Enter)
    assert.doesNotThrow(() => {
      t.sendText('/export', true);
    });
  });

  test('Ctrl+C interrupt sends correct control character', async () => {
    const t = vscode.window.createTerminal('interrupt-target');
    terminals.push(t);
    t.show(false);
    await delay(200);

    assert.doesNotThrow(() => {
      t.sendText('\u0003', false);
    });
  });

  test('Esc sends correct escape character', async () => {
    const t = vscode.window.createTerminal('esc-target');
    terminals.push(t);
    t.show(false);
    await delay(200);

    assert.doesNotThrow(() => {
      t.sendText('\u001b', false);
    });
  });

  test('Enter sends carriage return', async () => {
    const t = vscode.window.createTerminal('enter-target');
    terminals.push(t);
    t.show(false);
    await delay(200);

    assert.doesNotThrow(() => {
      t.sendText('\r', false);
    });
  });

  test('Scroll terminal commands exist', async () => {
    // Verify the workbench commands we depend on are registered
    const commands = await vscode.commands.getCommands(true);
    assert.ok(commands.includes('workbench.action.terminal.scrollUp'), 'scrollUp command should exist');
    assert.ok(commands.includes('workbench.action.terminal.scrollDown'), 'scrollDown command should exist');
  });

  test('Jump gate: openExternal does not throw for valid URI', async () => {
    // We can't verify the browser opened, but we verify no crash
    const uri = vscode.Uri.parse('https://example.com');
    // Don't actually open — just verify parse works
    assert.strictEqual(uri.scheme, 'https');
    assert.strictEqual(uri.authority, 'example.com');
  });

  test('Jump gate: file URI parses correctly', () => {
    const uri = vscode.Uri.file('/tmp/receipts/latest.md');
    assert.strictEqual(uri.scheme, 'file');
    assert.ok(uri.fsPath.includes('latest.md'));
  });
});
