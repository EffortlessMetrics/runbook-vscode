export type NamedSequence = 'Enter' | 'Esc' | 'Ctrl+C';

export interface ResolvedSequence {
  mode: 'newline' | 'raw';
  value: string;
}

/**
 * Converts a named sequence into terminal payload semantics.
 */
export function resolveTerminalSequence(sequence: NamedSequence | string): ResolvedSequence {
  switch (sequence) {
    case 'Enter':
      return { mode: 'newline', value: '' };
    case 'Esc':
      return { mode: 'raw', value: '\u001b' };
    case 'Ctrl+C':
      return { mode: 'raw', value: '\u0003' };
    default:
      return { mode: 'raw', value: sequence };
  }
}
