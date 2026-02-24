import * as vscode from 'vscode';
import { DaemonClient } from '../transport/daemon';

export class TerminalController {
  private selectedTerminalIndex: number = -1;

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
    vscode.window.onDidCloseTerminal(() => this.reportTelemetry());

    // Initialize telemetry
    this.reportTelemetry();
  }

  public getSelectedTerminal(): vscode.Terminal | undefined {
    const terminals = vscode.window.terminals;
    if (terminals.length === 0) return undefined;

    if (this.selectedTerminalIndex >= 0 && this.selectedTerminalIndex < terminals.length) {
      return terminals[this.selectedTerminalIndex];
    }
    
    // Fallback to active terminal or the first one
    const active = vscode.window.activeTerminal;
    if (active) {
      this.selectedTerminalIndex = terminals.indexOf(active);
      return active;
    }

    this.selectedTerminalIndex = 0;
    return terminals[0];
  }

  public cycleTerminal(delta: number) {
    const terminals = vscode.window.terminals;
    if (terminals.length === 0) return;

    if (this.selectedTerminalIndex < 0 || this.selectedTerminalIndex >= terminals.length) {
      this.selectedTerminalIndex = 0;
    }

    this.selectedTerminalIndex = (this.selectedTerminalIndex + delta + terminals.length) % terminals.length;
    
    const target = terminals[this.selectedTerminalIndex];
    if (target) {
      target.show(false);
      this.reportTelemetry();
    }
  }

  public focusTerminal(index: number) {
    const terminals = vscode.window.terminals;
    if (terminals.length === 0) return;

    if (index >= 0 && index < terminals.length) {
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

  public async sendSequence(sequence: 'Enter' | 'Esc' | 'Ctrl+C' | string) {
    const term = this.getSelectedTerminal();
    if (!term) {
      vscode.window.showWarningMessage('Runbook: No terminal available for sequence.');
      return;
    }

    term.show(false);

    let rawSeq = sequence;
    switch (sequence) {
      case 'Enter': rawSeq = '\r'; break;
      case 'Esc': rawSeq = '\u001b'; break;
      case 'Ctrl+C': rawSeq = '\u0003'; break;
    }

    // Try sending sequence via sendText.
    term.sendText(rawSeq, false);
  }

  public reportTelemetry() {
    this.client.send({
      protocol: 1,
      type: 'context_update',
      active_terminal_index: this.selectedTerminalIndex,
      terminals_count: vscode.window.terminals.length
    });
  }
}
