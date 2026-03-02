export type NamedTerminalSequence = 'Enter' | 'Esc' | 'Ctrl+C';

export interface ResolvedTerminalSequence {
  text: string;
  execute: boolean;
}

/**
 * Converts a semantic sequence command into terminal API inputs.
 */
export function resolveTerminalSequence(
  sequence: NamedTerminalSequence | string
): ResolvedTerminalSequence {
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

