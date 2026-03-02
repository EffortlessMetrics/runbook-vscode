export interface SelectionContext {
  terminalCount: number;
  selectedTerminalIndex: number;
  activeTerminalIndex: number;
}

/**
 * Chooses the best terminal index to target.
 * Priority order: selected index -> active index -> first terminal.
 */
export function resolveSelectedTerminalIndex(ctx: SelectionContext): number {
  if (ctx.terminalCount <= 0) {
    return -1;
  }

  if (isInBounds(ctx.selectedTerminalIndex, ctx.terminalCount)) {
    return ctx.selectedTerminalIndex;
  }

  if (isInBounds(ctx.activeTerminalIndex, ctx.terminalCount)) {
    return ctx.activeTerminalIndex;
  }

  return 0;
}

/**
 * Wraps terminal selection forward/backward by delta.
 */
export function cycleTerminalIndex(currentIndex: number, terminalCount: number, delta: number): number {
  if (terminalCount <= 0) {
    return -1;
  }

  const safeIndex = isInBounds(currentIndex, terminalCount) ? currentIndex : 0;
  return (safeIndex + delta + terminalCount) % terminalCount;
}

function isInBounds(index: number, count: number): boolean {
  return index >= 0 && index < count;
}
