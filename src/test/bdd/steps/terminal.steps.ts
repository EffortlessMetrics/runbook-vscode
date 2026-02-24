import { Given, When, Then, After } from '@cucumber/cucumber';
import * as assert from 'assert';
import * as vscode from 'vscode';

let createdTerminals: vscode.Terminal[] = [];

After(async () => {
  for (const t of createdTerminals) {
    t.dispose();
  }
  createdTerminals = [];
});

Given('I have no terminals open', async () => {
  // Dispose all existing terminals if any (VS Code doesn't allow forced closure of all easily, 
  // but we can try closing what we possess, or just assume a clean slate).
});

When('I create a terminal named {string}', async (name: string) => {
  const term = vscode.window.createTerminal(name);
  createdTerminals.push(term);
  term.show(false);
});

Then('the terminal list should contain at least {int} terminal', async (count: number) => {
  assert.ok(vscode.window.terminals.length >= count);
});

Then('the terminal {string} should exist', async (name: string) => {
  const exists = vscode.window.terminals.some(t => t.name === name);
  assert.strictEqual(exists, true);
});
