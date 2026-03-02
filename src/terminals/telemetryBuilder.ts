import * as vscode from 'vscode';
import { TerminalInfo, VscodeTelemetry } from '../protocol';

export function buildTerminalTelemetry(
  terminals: readonly vscode.Terminal[],
  sessionTags: ReadonlyMap<vscode.Terminal, string>,
  selectedTerminalIndex: number
): VscodeTelemetry {
  const terminalsData: TerminalInfo[] = terminals.map((terminal) => ({
    name: terminal.name,
    session_tag: sessionTags.get(terminal) || undefined
  }));

  return {
    protocol: 1,
    type: 'vscode_telemetry',
    active_terminal_index: selectedTerminalIndex,
    selected_terminal_index: selectedTerminalIndex,
    terminals_count: terminalsData.length,
    terminals: terminalsData
  };
}
