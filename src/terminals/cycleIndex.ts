/**
 * Computes the next index in a circular list.
 * Returns 0 when the current index is invalid.
 */
export function getCycledTerminalIndex(currentIndex: number, delta: number, length: number): number {
  if (length <= 0) return -1;

  const normalizedCurrent = currentIndex >= 0 && currentIndex < length ? currentIndex : 0;
  return (normalizedCurrent + delta + length) % length;
}
