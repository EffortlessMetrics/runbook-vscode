export interface SequenceDispatch {
  text: string;
  execute: boolean;
}

/**
 * Maps daemon-friendly sequence labels into terminal write semantics.
 *
 * We normalize Enter to an empty text send with execute=true because this is
 * more reliable in VS Code terminals than sending raw carriage return bytes.
 */
export function translateSequence(sequence: string): SequenceDispatch {
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
