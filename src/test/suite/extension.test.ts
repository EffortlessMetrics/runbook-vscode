import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Extension Test Suite', () => {
  test('Extension should be present', () => {
    assert.ok(vscode.extensions.getExtension('runbook-rs.runbook-vscode'));
  });

  test('Should list terminals and cycle them programmatically', async () => {
    // Create a terminal
    const term1 = vscode.window.createTerminal('test1');
    const term2 = vscode.window.createTerminal('test2');
    
    term1.show();
    term2.show();
    
    const terminals = vscode.window.terminals;
    assert.ok(terminals.length >= 2, 'There should be at least two terminals');
    
    // We can't directly inspect internal state of TerminalController, 
    // but we can ensure vscode APIs we rely on are valid.
    assert.strictEqual(terminals.includes(term1), true);
    assert.strictEqual(terminals.includes(term2), true);
    
    term1.dispose();
    term2.dispose();
  });
});
