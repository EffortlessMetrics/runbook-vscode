export interface ReconnectPlan {
  delayMs: number;
  nextBackoffMs: number;
}

export class ReconnectBackoff {
  private currentBackoffMs: number;

  constructor(
    private readonly initialBackoffMs = 1000,
    private readonly maxBackoffMs = 30000,
    private readonly multiplier = 1.5
  ) {
    this.currentBackoffMs = initialBackoffMs;
  }

  public reset() {
    this.currentBackoffMs = this.initialBackoffMs;
  }

  public next(): ReconnectPlan {
    const delayMs = this.currentBackoffMs;
    this.currentBackoffMs = Math.min(
      Math.floor(this.currentBackoffMs * this.multiplier),
      this.maxBackoffMs
    );

    return {
      delayMs,
      nextBackoffMs: this.currentBackoffMs
    };
  }

  public getCurrentBackoffMs() {
    return this.currentBackoffMs;
  }
}
