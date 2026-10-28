/** XP granted the first time an item enters the collection. */
export const XP_PER_NEW_ITEM = 40;

export interface Achievement {
  readonly id: string;
  readonly name: string;
  /** Short mark shown inside the badge, e.g. "100" or "×2". */
  readonly mark: string;
  readonly unlocked: boolean;
  /** 0–1 towards unlocking; 1 when unlocked. */
  readonly progress: number;
}

/** The user's level, XP and achievements. */
export interface Progression {
  readonly level: number;
  /** XP earned inside the current level. */
  readonly xpInLevel: number;
  /** XP the current level spans. */
  readonly xpLevelSize: number;
  readonly achievements: readonly Achievement[];
}
