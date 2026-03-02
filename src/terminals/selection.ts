export function isTerminalIndexInRange(index: number, terminalCount: number): boolean {
  return index >= 0 && index < terminalCount;
}

export function resolveSelectedTerminalIndex(
  currentIndex: number,
  terminalCount: number,
  activeIndex?: number
): number {
  if (terminalCount === 0) {
    return -1;
  }

  if (isTerminalIndexInRange(currentIndex, terminalCount)) {
    return currentIndex;
  }

  if (activeIndex !== undefined && isTerminalIndexInRange(activeIndex, terminalCount)) {
    return activeIndex;
  }

  return 0;
}

export function cycleSelectedTerminalIndex(
  currentIndex: number,
  terminalCount: number,
  delta: number
): number {
  if (terminalCount === 0) {
    return -1;
  }

  const baseIndex = isTerminalIndexInRange(currentIndex, terminalCount) ? currentIndex : 0;
  return (baseIndex + delta + terminalCount) % terminalCount;
}
