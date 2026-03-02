export class ReconnectPolicy {
  private currentBackoffMs: number;

  constructor(
    private readonly initialBackoffMs = 1000,
    private readonly maxBackoffMs = 30000,
    private readonly growthFactor = 1.5
  ) {
    this.currentBackoffMs = initialBackoffMs;
  }

  public currentDelayMs() {
    return this.currentBackoffMs;
  }

  public consumeDelayMs() {
    const delay = this.currentBackoffMs;
    this.currentBackoffMs = Math.min(
      Math.floor(this.currentBackoffMs * this.growthFactor),
      this.maxBackoffMs
    );
    return delay;
  }

  public reset() {
    this.currentBackoffMs = this.initialBackoffMs;
  }
}
