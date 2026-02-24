import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Connection & Status Tests', () => {

  test('Extension contributes runbook.connect command', async () => {
    const commands = await vscode.commands.getCommands(true);
    assert.ok(commands.includes('runbook.connect'), 'runbook.connect command should be registered');
  });

  test('Extension contributes runbook.disconnect command', async () => {
    const commands = await vscode.commands.getCommands(true);
    assert.ok(commands.includes('runbook.disconnect'), 'runbook.disconnect command should be registered');
  });

  test('Extension contributes runbook.dispatchTest command', async () => {
    const commands = await vscode.commands.getCommands(true);
    assert.ok(commands.includes('runbook.dispatchTest'), 'runbook.dispatchTest command should be registered');
  });

  test('Configuration runbook.daemonUrl has a default value', () => {
    const config = vscode.workspace.getConfiguration('runbook');
    const url = config.get<string>('daemonUrl');
    assert.strictEqual(url, 'ws://127.0.0.1:29381/ws');
  });

  test('Status bar item should be visible after activation', async () => {
    // The extension activates on startup, so the status bar should exist.
    // We can't directly query the status bar items, but we can verify
    // the extension is active.
    const ext = vscode.extensions.getExtension('runbook-rs.runbook-vscode');
    assert.ok(ext, 'Extension should be present');
    if (ext && !ext.isActive) {
      await ext.activate();
    }
    assert.ok(ext!.isActive, 'Extension should be active');
  });
});
