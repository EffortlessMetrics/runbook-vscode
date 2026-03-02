export interface EncodedTerminalSequence {
  text: string;
  execute: boolean;
}

const NAMED_SEQUENCES: Record<string, EncodedTerminalSequence> = {
  Enter: { text: '', execute: true },
  Esc: { text: '\u001b', execute: false },
  'Ctrl+C': { text: '\u0003', execute: false }
};

export function encodeTerminalSequence(sequence: string): EncodedTerminalSequence {
  return NAMED_SEQUENCES[sequence] ?? { text: sequence, execute: false };
}

