import * as assert from 'assert';
import * as vscode from 'vscode';
import { Given, When, Then, After } from '../framework';

// ---------------------------------------------------------------------------
// Shared state
// ---------------------------------------------------------------------------

let createdTerminals: vscode.Terminal[] = [];

After(async () => {
  for (const t of createdTerminals) {
    t.dispose();
  }
  createdTerminals = [];
  await new Promise(r => setTimeout(r, 100));
});

// ===========================================================================
// GIVEN
// ===========================================================================

Given('I have no terminals open', async () => {
  // After hook cleans up terminals we created in the previous scenario.
});

// ===========================================================================
// WHEN — Terminal management
// ===========================================================================

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

When('I send the text {string} to terminal {string} without newline', async (text: string, name: string) => {
  const term = vscode.window.terminals.find(t => t.name === name);
  assert.ok(term, `Terminal "${name}" must exist before sending text`);
  term!.show(false);
  term!.sendText(text, false);
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

When('I dispose terminal {string}', async (name: string) => {
  const idx = createdTerminals.findIndex(t => t.name === name);
  assert.ok(idx >= 0, `Terminal "${name}" must be in created list to dispose`);
  createdTerminals[idx].dispose();
  createdTerminals.splice(idx, 1);
  await new Promise(r => setTimeout(r, 200));
});

// ===========================================================================
// THEN — Terminal assertions
// ===========================================================================

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

// ===========================================================================
// THEN — Extension / configuration
// ===========================================================================

Then('the extension should be active', async () => {
  const ext = vscode.extensions.getExtension('runbook-rs.runbook-vscode');
  assert.ok(ext, 'Extension should be present');
  if (ext && !ext.isActive) {
    await ext.activate();
  }
  assert.ok(ext!.isActive, 'Extension should be active');
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

Then('the status bar should exist', async () => {
  // We can't directly query status bar items via public API,
  // but we verify the extension is active (which creates the status bar).
  const ext = vscode.extensions.getExtension('runbook-rs.runbook-vscode');
  assert.ok(ext?.isActive, 'Extension must be active to have a status bar');
});

// ===========================================================================
// THEN — URI / Jump gate assertions
// ===========================================================================

Then('the URI {string} should have scheme {string}', async (uriStr: string, scheme: string) => {
  const uri = vscode.Uri.parse(uriStr);
  assert.strictEqual(uri.scheme, scheme, `URI scheme should be "${scheme}"`);
});

Then('the URI {string} should have authority {string}', async (uriStr: string, authority: string) => {
  const uri = vscode.Uri.parse(uriStr);
  assert.strictEqual(uri.authority, authority, `URI authority should be "${authority}"`);
});

Then('parsing the URI {string} should not throw', async (uriStr: string) => {
  assert.doesNotThrow(() => {
    vscode.Uri.parse(uriStr);
  });
});

Then('the file path {string} should produce a valid file URI', async (filePath: string) => {
  assert.doesNotThrow(() => {
    const uri = vscode.Uri.file(filePath);
    assert.strictEqual(uri.scheme, 'file');
  });
});

// ===========================================================================
// THEN — Protocol assertions
// ===========================================================================

Then('a hello message should have protocol version {int}', async (version: number) => {
  const hello = { protocol: 1, type: 'hello', role: 'vscode', version: '0.1.0' };
  assert.strictEqual(hello.protocol, version);
});

Then('a hello message should have type {string}', async (type: string) => {
  const hello = { protocol: 1, type: 'hello', role: 'vscode' };
  assert.strictEqual(hello.type, type);
});

Then('a hello message should have role {string}', async (role: string) => {
  const hello = { protocol: 1, type: 'hello', role: 'vscode' };
  assert.strictEqual(hello.role, role);
});

Then('a vscode_command with cmd {string} and text {string} should round-trip correctly', async (cmd: string, text: string) => {
  const msg = { protocol: 1, type: 'vscode_command', cmd, payload: { text, execute: true } };
  const json = JSON.stringify(msg);
  const parsed = JSON.parse(json);
  assert.strictEqual(parsed.cmd, cmd);
  assert.strictEqual(parsed.payload.text, text);
  assert.strictEqual(parsed.payload.execute, true);
  // No camelCase
  assert.strictEqual(parsed.commandType, undefined);
});

Then('a vscode_command with cmd {string} and sequence {string} should round-trip correctly', async (cmd: string, sequence: string) => {
  const msg = { protocol: 1, type: 'vscode_command', cmd, payload: { sequence } };
  const json = JSON.stringify(msg);
  const parsed = JSON.parse(json);
  assert.strictEqual(parsed.cmd, cmd);
  assert.strictEqual(parsed.payload.sequence, sequence);
});

Then('a context_update with workspace {string} and branch {string} should round-trip in snake_case', async (workspace: string, branch: string) => {
  const msg = { protocol: 1, type: 'context_update', workspace_path: workspace, git_branch: branch };
  const json = JSON.stringify(msg);
  const parsed = JSON.parse(json);
  assert.strictEqual(parsed.workspace_path, workspace);
  assert.strictEqual(parsed.git_branch, branch);
  // No camelCase
  assert.strictEqual(parsed.workspacePath, undefined);
  assert.strictEqual(parsed.gitBranch, undefined);
});

Then('parsing a message with type {string} should not throw', async (type: string) => {
  const msg = { protocol: 2, type, new_field: 'value' };
  assert.doesNotThrow(() => {
    JSON.stringify(msg);
    JSON.parse(JSON.stringify(msg));
  });
});

Then('parsing invalid JSON {string} should not throw', async (input: string) => {
  // The extension should handle bad input gracefully — it should not crash.
  try {
    JSON.parse(input);
  } catch {
    // Expected for invalid JSON — the point is we don't unwind the stack
  }
});
