export type WordMasteryLevel = 0 | 1 | 2 | 3; // Learning → Familiar → Proficient → Mastered

export interface WordMastery {
  wordId: string;
  exposures: number;
  correctAnswers: number;
  recentAccuracy: number[]; // Last 5 attempts
  lastSeen: Date;
  averageResponseTime: number; // ms
  overallMastery: number; // 0-1
  masteryLevel: WordMasteryLevel;
}

export class WordMasteryTracker {
  private masteryData: Map<string, WordMastery>;
  private readonly MAX_RECENT_ATTEMPTS = 5;
  private readonly MASTERY_THRESHOLDS = {
    LEARNING: 0,
    FAMILIAR: 0.6,
    PROFICIENT: 0.8,
    MASTERED: 0.95
  };
  private readonly STORAGE_KEY = 'wordMasteryData';

  constructor(initialData?: Map<string, WordMastery>) {
    this.masteryData = initialData || new Map();
  }

  private createWordMastery(wordId: string): WordMastery {
    return {
      wordId,
      exposures: 0,
      correctAnswers: 0,
      recentAccuracy: [],
      lastSeen: new Date(),
      averageResponseTime: 0,
      overallMastery: 0,
      masteryLevel: 0
    };
  }

  recordAttempt(wordId: string, isCorrect: boolean, responseTimeMs?: number): void {
    let mastery = this.masteryData.get(wordId);
    if (!mastery) {
      mastery = this.createWordMastery(wordId);
      this.masteryData.set(wordId, mastery);
    }

    mastery.exposures++;
    if (isCorrect) {
      mastery.correctAnswers++;
    }
    mastery.lastSeen = new Date();

    // Update recent accuracy
    mastery.recentAccuracy.push(isCorrect ? 1 : 0);
    if (mastery.recentAccuracy.length > this.MAX_RECENT_ATTEMPTS) {
      mastery.recentAccuracy.shift();
    }

    // Update average response time
    if (responseTimeMs !== undefined) {
      const oldTotal = mastery.averageResponseTime * (mastery.exposures - 1);
      mastery.averageResponseTime = (oldTotal + responseTimeMs) / mastery.exposures;
    }

    // Recalculate mastery
    this.updateMastery(mastery);
  }

  private updateMastery(mastery: WordMastery): void {
    if (mastery.exposures === 0) {
      mastery.overallMastery = 0;
      mastery.masteryLevel = 0;
      return;
    }

    // Weighted average: recent accuracy (70%) + overall accuracy (30%)
    const overallAccuracy = mastery.correctAnswers / mastery.exposures;
    const recentAccuracy = mastery.recentAccuracy.length > 0
      ? mastery.recentAccuracy.reduce((a, b) => a + b, 0) / mastery.recentAccuracy.length
      : 0;

    // Apply recency bonus
    const recencyBonus = this.getRecencyBonus(mastery.lastSeen);

    mastery.overallMastery = (recentAccuracy * 0.7 + overallAccuracy * 0.3) * recencyBonus;
    mastery.masteryLevel = this.calculateMasteryLevel(mastery.overallMastery);
  }

  private getRecencyBonus(lastSeen: Date): number {
    const hoursSince = (new Date().getTime() - lastSeen.getTime()) / (1000 * 60 * 60);
    return Math.max(0.5, 1 - (hoursSince / 48));
  }

  private calculateMasteryLevel(overallMastery: number): WordMasteryLevel {
    if (overallMastery >= this.MASTERY_THRESHOLDS.MASTERED) return 3;
    if (overallMastery >= this.MASTERY_THRESHOLDS.PROFICIENT) return 2;
    if (overallMastery >= this.MASTERY_THRESHOLDS.FAMILIAR) return 1;
    return 0;
  }

  getWordMastery(wordId: string): WordMastery | undefined {
    return this.masteryData.get(wordId);
  }

  getWordsNeedingPractice(wordIds: string[], limit: number = 10): Array<{ wordId: string; score: number }> {
    const candidates: Array<{ wordId: string; score: number }> = [];

    for (const wordId of wordIds) {
      const mastery = this.masteryData.get(wordId);
      if (!mastery) {
        // Never seen - high priority
        candidates.push({ wordId, score: 0 });
      } else {
        const recency = this.getRecencyBonus(mastery.lastSeen);
        // Lower score = needs more practice
        const score = mastery.overallMastery * recency;
        candidates.push({ wordId, score });
      }
    }

    return candidates
      .sort((a, b) => a.score - b.score)
      .slice(0, limit);
  }

  getAverageMastery(wordIds: string[]): number {
    let total = 0;
    let count = 0;

    for (const wordId of wordIds) {
      const mastery = this.masteryData.get(wordId);
      if (mastery && mastery.exposures >= 3) {
        total += mastery.overallMastery;
        count++;
      }
    }

    return count > 0 ? total / count : 0;
  }

  getStats(wordIds: string[]): { practiced: number; mastered: number; total: number; avgMastery: number } {
    let practiced = 0;
    let mastered = 0;
    let totalMastery = 0;

    for (const wordId of wordIds) {
      const mastery = this.masteryData.get(wordId);
      if (mastery && mastery.exposures > 0) {
        practiced++;
        totalMastery += mastery.overallMastery;
        if (mastery.masteryLevel >= 2) {
          mastered++;
        }
      }
    }

    return {
      practiced,
      mastered,
      total: wordIds.length,
      avgMastery: practiced > 0 ? totalMastery / practiced : 0
    };
  }

  save(): void {
    const data: Record<string, WordMastery> = {};
    this.masteryData.forEach((value, key) => {
      data[key] = value;
    });
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  }

  static load(): WordMasteryTracker {
    const saved = localStorage.getItem('wordMasteryData');
    if (!saved) {
      return new WordMasteryTracker();
    }

    try {
      const data = JSON.parse(saved);
      const map = new Map<string, WordMastery>();

      Object.entries(data).forEach(([key, value]) => {
        const mastery = value as WordMastery;
        mastery.lastSeen = new Date(mastery.lastSeen);
        map.set(key, mastery);
      });

      return new WordMasteryTracker(map);
    } catch {
      return new WordMasteryTracker();
    }
  }

  getAllMasteryData(): Map<string, WordMastery> {
    return new Map(this.masteryData);
  }
}
