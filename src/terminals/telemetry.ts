import * as vscode from 'vscode';

export interface TerminalTelemetryEntry {
  name: string;
  session_tag?: string;
}

export interface TerminalTelemetryPayload {
  protocol: 1;
  type: 'vscode_telemetry';
  active_terminal_index: number;
  selected_terminal_index: number;
  terminals_count: number;
  terminals: TerminalTelemetryEntry[];
}

export function buildTerminalTelemetryPayload(
  terminals: readonly vscode.Terminal[],
  selectedTerminalIndex: number,
  sessionTags: ReadonlyMap<vscode.Terminal, string>
): TerminalTelemetryPayload {
  const terminalsData = terminals.map((t) => ({
    name: t.name,
    session_tag: sessionTags.get(t) || undefined
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
