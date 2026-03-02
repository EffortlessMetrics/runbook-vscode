export type TerminalSequenceAction =
  | { kind: 'sendText'; text: string; execute: boolean }
  | { kind: 'raw'; value: string };

const CONTROL_SEQUENCE_MAP: Record<string, string> = {
  Esc: '\u001b',
  'Ctrl+C': '\u0003'
};

export function translateSequenceAction(sequence: string): TerminalSequenceAction {
  if (sequence === 'Enter') {
    return { kind: 'sendText', text: '', execute: true };
  }

  const mapped = CONTROL_SEQUENCE_MAP[sequence];
  if (mapped) {
    return { kind: 'raw', value: mapped };
  }

  return { kind: 'raw', value: sequence };
}
