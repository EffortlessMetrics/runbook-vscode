export type TerminalSequence = 'Enter' | 'Esc' | 'Ctrl+C' | string;

export interface SequenceDispatch {
  text: string;
  execute: boolean;
}

export function toSequenceDispatch(sequence: TerminalSequence): SequenceDispatch {
  switch (sequence) {
    case 'Enter':
      return { text: '', execute: true };
    case 'Esc':
      return { text: '\u001b', execute: false };
    case 'Ctrl+C':
      return { text: '\u0003', execute: false };
    default:
      return { text: sequence, execute: false };
  }
}
