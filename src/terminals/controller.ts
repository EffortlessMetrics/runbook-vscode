import * as vscode from 'vscode';
import * as crypto from 'crypto';
import { DaemonClient } from '../transport/daemon';
import { cycleSelectedTerminalIndex, isTerminalIndexInRange, resolveSelectedTerminalIndex } from './selection';
import { TerminalSequence, toSequenceDispatch } from './sequences';

export class TerminalController {
  private selectedTerminalIndex: number = -1;
  private sessionTags = new Map<vscode.Terminal, string>();

  constructor(private readonly client: DaemonClient) {
    // Listen for terminal selection updates from user to sync selected index
    vscode.window.onDidChangeActiveTerminal((term) => {
      if (term) {
        const terminals = vscode.window.terminals;
        const idx = terminals.indexOf(term);
        if (idx !== -1) {
          this.selectedTerminalIndex = idx;
          this.reportTelemetry();
        }
      }
    });

    // Listen for terminal opens/closes
    vscode.window.onDidOpenTerminal(() => this.reportTelemetry());
    vscode.window.onDidCloseTerminal((term) => {
      this.sessionTags.delete(term);
      this.reportTelemetry();
    });

    // Initialize telemetry
    this.reportTelemetry();
  }

  public getSelectedTerminal(): vscode.Terminal | undefined {
    const terminals = vscode.window.terminals;
    const activeIndex = vscode.window.activeTerminal ? terminals.indexOf(vscode.window.activeTerminal) : undefined;

    this.selectedTerminalIndex = resolveSelectedTerminalIndex(
      this.selectedTerminalIndex,
      terminals.length,
      activeIndex
    );

    return this.selectedTerminalIndex === -1 ? undefined : terminals[this.selectedTerminalIndex];
  }

  public cycleTerminal(delta: number) {
    const terminals = vscode.window.terminals;
    this.selectedTerminalIndex = cycleSelectedTerminalIndex(this.selectedTerminalIndex, terminals.length, delta);

    const target = this.selectedTerminalIndex === -1 ? undefined : terminals[this.selectedTerminalIndex];
    if (target) {
      target.show(false);
      this.reportTelemetry();
    }
  }

  public focusTerminal(index: number) {
    const terminals = vscode.window.terminals;

    if (isTerminalIndexInRange(index, terminals.length)) {
      this.selectedTerminalIndex = index;
      terminals[index].show(false);
      this.reportTelemetry();
    }
  }

  public sendText(text: string, execute: boolean = true) {
    const term = this.getSelectedTerminal();
    if (term) {
      term.show(false); // Make sure it's visible
      term.sendText(text, execute);
    } else {
      vscode.window.showWarningMessage('Runbook: No terminal available to send text.');
    }
  }

  public async sendSequence(sequence: TerminalSequence) {
    const term = this.getSelectedTerminal();
    if (!term) {
      vscode.window.showWarningMessage('Runbook: No terminal available for sequence.');
      return;
    }

    term.show(false);

    const dispatch = toSequenceDispatch(sequence);
    term.sendText(dispatch.text, dispatch.execute);
  }

  public reportTelemetry() {
    const terminalsData = vscode.window.terminals.map(t => ({
      name: t.name,
      session_tag: this.sessionTags.get(t) || undefined
    }));

    this.client.send({
      protocol: 1,
      type: 'vscode_telemetry',
      active_terminal_index: this.selectedTerminalIndex,
      selected_terminal_index: this.selectedTerminalIndex,
      terminals_count: terminalsData.length,
      terminals: terminalsData
    });
  }

  public startClaudeSession() {
    const uuid = crypto.randomUUID();
    const term = vscode.window.createTerminal({
      name: 'Claude',
      env: { RUNBOOK_SESSION_TAG: uuid }
    });
    this.sessionTags.set(term, uuid);
    term.show();
    term.sendText('claude', true);
    this.reportTelemetry();
  }
}
