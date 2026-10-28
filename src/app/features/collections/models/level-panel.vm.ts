/** Everything `<app-level-panel>` needs to render — no domain logic. */
export interface LevelPanelVm {
  readonly greeting: string;
  readonly ownedLabel: string;
  readonly valueLabel: string;
  readonly level: number;
  /** 0–1 through the current level. */
  readonly xpRatio: number;
  readonly xpLabel: string;
  readonly xpSizeLabel: string;
  readonly toNextLabel: string;
  readonly setCount: number;
  readonly wishCount: number;
  readonly achievementCount: number;
}
