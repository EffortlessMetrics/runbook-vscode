import * as assert from 'assert';
import * as vscode from 'vscode';
import { Given, When, Then, After } from '../framework';

// ---------------------------------------------------------------------------
// Shared state for terminal steps
// ---------------------------------------------------------------------------

let createdTerminals: vscode.Terminal[] = [];

After(async () => {
  for (const t of createdTerminals) {
    t.dispose();
  }
  createdTerminals = [];
  // Small delay so VS Code processes the dispose
  await new Promise(r => setTimeout(r, 100));
});

// ---------------------------------------------------------------------------
// Given steps
// ---------------------------------------------------------------------------

Given('I have no terminals open', async () => {
  // We can't force-close all terminals, but we start from a known state.
  // The After hook cleans up terminals we created.
});

// ---------------------------------------------------------------------------
// When steps
// ---------------------------------------------------------------------------

When('I create a terminal named {string}', async (name: string) => {
  const term = vscode.window.createTerminal(name);
  createdTerminals.push(term);
  term.show(false);
  await new Promise(r => setTimeout(r, 150));
});

When('I send the text {string} to terminal {string}', async (text: string, name: string) => {
  const term = vscode.window.terminals.find(t => t.name === name);
  assert.ok(term, `Terminal "${name}" must exist before sending text`);
  term!.show(false);
  term!.sendText(text, true);
});

When('I send the sequence {string} to terminal {string}', async (sequence: string, name: string) => {
  const term = vscode.window.terminals.find(t => t.name === name);
  assert.ok(term, `Terminal "${name}" must exist before sending sequence`);
  term!.show(false);

  let rawSeq = sequence;
  switch (sequence) {
    case 'Enter': rawSeq = '\r'; break;
    case 'Esc': rawSeq = '\u001b'; break;
    case 'Ctrl+C': rawSeq = '\u0003'; break;
  }
  term!.sendText(rawSeq, false);
});

When('I focus terminal {string}', async (name: string) => {
  const term = vscode.window.terminals.find(t => t.name === name);
  assert.ok(term, `Terminal "${name}" must exist to focus it`);
  term!.show(false);
  await new Promise(r => setTimeout(r, 100));
});

// ---------------------------------------------------------------------------
// Then steps
// ---------------------------------------------------------------------------

Then('the terminal list should contain at least {int} terminal', async (count: number) => {
  assert.ok(
    vscode.window.terminals.length >= count,
    `Expected at least ${count} terminals, got ${vscode.window.terminals.length}`
  );
});

Then('the terminal {string} should exist', async (name: string) => {
  const exists = vscode.window.terminals.some(t => t.name === name);
  assert.strictEqual(exists, true, `Terminal "${name}" should exist`);
});

Then('the terminal {string} should not exist', async (name: string) => {
  const exists = vscode.window.terminals.some(t => t.name === name);
  assert.strictEqual(exists, false, `Terminal "${name}" should not exist`);
});

Then('the active terminal should be {string}', async (name: string) => {
  const active = vscode.window.activeTerminal;
  assert.ok(active, 'There should be an active terminal');
  assert.strictEqual(active!.name, name, `Active terminal should be "${name}"`);
});

Then('the extension command {string} should be registered', async (cmd: string) => {
  const commands = await vscode.commands.getCommands(true);
  assert.ok(commands.includes(cmd), `Command "${cmd}" should be registered`);
});

Then('the configuration {string} should equal {string}', async (key: string, expected: string) => {
  const parts = key.split('.');
  const section = parts.slice(0, -1).join('.');
  const prop = parts[parts.length - 1];
  const config = vscode.workspace.getConfiguration(section);
  const value = config.get<string>(prop);
  assert.strictEqual(value, expected, `Config "${key}" should be "${expected}"`);
});
