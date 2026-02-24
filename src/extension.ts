import * as vscode from 'vscode';
import { DaemonClient } from './transport/daemon';
import { TerminalController } from './terminals/controller';
import { openUri, revealReceipt } from './jumpgates';
import { ContextCollector } from './context';
import { VscodeCommand, RenderMessage, PendingPrompt } from './protocol';

let client: DaemonClient | null = null;
let terminals: TerminalController | null = null;
let contextCollector: ContextCollector | null = null;

/**
 * The pending prompt — a "loaded round in the chamber."
 * Set by daemon render messages when a keypad key is pressed.
 * Cleared by:
 *   - Enter dispatch (commits it)
 *   - Esc cancel   (discards it, default: no terminal side-effect)
 *   - New render message with pending_prompt = null
 */
let pendingPrompt: PendingPrompt | null = null;

export function activate(context: vscode.ExtensionContext) {
  client = new DaemonClient(context);
  terminals = new TerminalController(client);
  contextCollector = new ContextCollector(client);

  const config = vscode.workspace.getConfiguration('runbook');

  // Handle incoming daemon messages
  client.on('message', async (msg: any) => {
    // --- Render state updates ---
    if (msg.type === 'render') {
      const render = msg as RenderMessage;
      pendingPrompt = render.pending_prompt ?? null;
      return;
    }

    // --- VS Code commands from daemon ---
    if (msg.type === 'vscode_command') {
      const command = msg as VscodeCommand;
      const payload = command.payload || {};

      switch (command.cmd) {
        case 'send_text':
          terminals?.sendText(payload.text || '', payload.execute !== false);
          break;

        case 'send_sequence':
          await handleSequence(payload.sequence, config);
          break;

        case 'focus_terminal':
          terminals?.focusTerminal(payload.index || 0);
          break;

        case 'cycle_terminal':
          terminals?.cycleTerminal(payload.direction || 1);
          break;

        case 'open_uri':
          await openUri(payload.uri);
          break;

        case 'reveal_receipt':
          await revealReceipt(payload.path);
          break;
      }
    }
  });

  context.subscriptions.push(
    client,
    vscode.commands.registerCommand('runbook.connect', () => client?.connect()),
    vscode.commands.registerCommand('runbook.disconnect', () => client?.disconnect()),
    vscode.commands.registerCommand('runbook.dispatchTest', () => {
      terminals?.sendText('echo "Test dispatch"', true);
    })
  );

  // Auto-connect on startup
  client.connect();
}

// ---------------------------------------------------------------------------
// Sequence handling — the core of the pending_prompt contract
// ---------------------------------------------------------------------------

async function handleSequence(
  sequence: string,
  config: vscode.WorkspaceConfiguration
) {
  switch (sequence) {
    // -----------------------------------------------------------------
    // ENTER
    //   pending_prompt exists → send prompt text + newline (commit)
    //   no pending_prompt    → send bare Enter (passthrough)
    // -----------------------------------------------------------------
    case 'Enter': {
      if (pendingPrompt) {
        const text = pendingPrompt.text;
        pendingPrompt = null; // consume the round
        terminals?.sendText(text, true);

        // Notify daemon that we dispatched
        client?.send({
          protocol: 1,
          type: 'pending_prompt_dispatched',
          prompt_id: pendingPrompt
        });
      } else {
        await terminals?.sendSequence('Enter');
      }
      break;
    }

    // -----------------------------------------------------------------
    // ESC   (configurable: cancel_only vs cancel_and_passthrough)
    //   pending_prompt exists →
    //     cancel_only:           clear pending, do NOT send Esc to terminal
    //     cancel_and_passthrough: clear pending AND send Esc to terminal
    //   no pending_prompt    → send Esc to terminal (always)
    // -----------------------------------------------------------------
    case 'Esc': {
      const escPolicy = config.get<string>('escWhenPending', 'cancel_only');

      if (pendingPrompt) {
        pendingPrompt = null; // discard the round

        // Notify daemon that pending was cancelled
        client?.send({
          protocol: 1,
          type: 'pending_prompt_cancelled'
        });

        if (escPolicy === 'cancel_and_passthrough') {
          await terminals?.sendSequence('Esc');
        }
        // cancel_only: swallow — no terminal side-effect
      } else {
        await terminals?.sendSequence('Esc');
      }
      break;
    }

    // -----------------------------------------------------------------
    // CTRL+C — always interrupts. No pending_prompt logic.
    // The concave key is the "always reaches Claude" escape hatch.
    // -----------------------------------------------------------------
    case 'Ctrl+C': {
      await terminals?.sendSequence('Ctrl+C');
      break;
    }

    // Passthrough for anything else
    default: {
      await terminals?.sendSequence(sequence);
      break;
    }
  }
}

export function deactivate() {
  client?.dispose();
}
