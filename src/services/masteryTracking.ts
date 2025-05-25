export type LetterForm = 'isolated' | 'initial' | 'medial' | 'final';
export type MasteryLevel = 0 | 1 | 2 | 3; // Learning → Familiar → Proficient → Mastered

export interface LetterFormMastery {
  form: LetterForm;
  exposures: number;
  correctAnswers: number;
  recentAccuracy: number[]; // Last 5 attempts for this form
  lastSeen: Date;
}

export interface ConfusionPair {
  letterId: string;
  form?: LetterForm;
  count: number;
}

export interface LetterMastery {
  letterId: string;
  forms: {
    isolated: LetterFormMastery;
    initial: LetterFormMastery;
    medial: LetterFormMastery;
    final: LetterFormMastery;
  };
  overallMastery: number; // 0-1, weighted average of all forms
  masteryLevel: MasteryLevel;
  confusedWith: ConfusionPair[];
  contextualMastery: {
    inWords: number; // How well recognized within words (0-1)
    standalone: number; // How well recognized in isolation (0-1)
  };
}

export class MasteryTracker {
  private masteryData: Map<string, LetterMastery>;
  private readonly MAX_RECENT_ATTEMPTS = 5;
  private readonly MASTERY_THRESHOLDS = {
    LEARNING: 0,
    FAMILIAR: 0.6,
    PROFICIENT: 0.8,
    MASTERED: 0.95
  };

  constructor(initialData?: Map<string, LetterMastery>) {
    this.masteryData = initialData || new Map();
  }

  private createFormMastery(form: LetterForm): LetterFormMastery {
    return {
      form,
      exposures: 0,
      correctAnswers: 0,
      recentAccuracy: [],
      lastSeen: new Date()
    };
  }

  private createLetterMastery(letterId: string): LetterMastery {
    return {
      letterId,
      forms: {
        isolated: this.createFormMastery('isolated'),
        initial: this.createFormMastery('initial'),
        medial: this.createFormMastery('medial'),
        final: this.createFormMastery('final')
      },
      overallMastery: 0,
      masteryLevel: 0,
      confusedWith: [],
      contextualMastery: {
        inWords: 0,
        standalone: 0
      }
    };
  }

  recordAttempt(
    letterId: string, 
    form: LetterForm, 
    isCorrect: boolean,
    context: 'standalone' | 'inWord' = 'standalone',
    confusedWithLetterId?: string,
    confusedWithForm?: LetterForm
  ): void {
    let mastery = this.masteryData.get(letterId);
    if (!mastery) {
      mastery = this.createLetterMastery(letterId);
      this.masteryData.set(letterId, mastery);
    }

    // Update form-specific data
    const formMastery = mastery.forms[form];
    formMastery.exposures++;
    if (isCorrect) {
      formMastery.correctAnswers++;
    }
    formMastery.lastSeen = new Date();

    // Update recent accuracy
    formMastery.recentAccuracy.push(isCorrect ? 1 : 0);
    if (formMastery.recentAccuracy.length > this.MAX_RECENT_ATTEMPTS) {
      formMastery.recentAccuracy.shift();
    }

    // Update confusion pairs
    if (!isCorrect && confusedWithLetterId) {
      const confusionPair = mastery.confusedWith.find(
        cp => cp.letterId === confusedWithLetterId && cp.form === confusedWithForm
      );
      if (confusionPair) {
        confusionPair.count++;
      } else {
        mastery.confusedWith.push({
          letterId: confusedWithLetterId,
          form: confusedWithForm,
          count: 1
        });
      }
    }

    // Update contextual mastery
    const contextKey = context === 'standalone' ? 'standalone' : 'inWords';
    const contextualAttempts = this.getContextualAttempts(letterId, context);
    mastery.contextualMastery[contextKey] = contextualAttempts.correct / contextualAttempts.total;

    // Recalculate overall mastery
    this.updateOverallMastery(mastery);
  }

  private getContextualAttempts(letterId: string, _context: 'standalone' | 'inWord'): { correct: number; total: number } {
    // This is a simplified version - in a full implementation, 
    // we'd track context-specific attempts separately
    const mastery = this.masteryData.get(letterId);
    if (!mastery) return { correct: 0, total: 0 };

    let correct = 0;
    let total = 0;
    Object.values(mastery.forms).forEach(form => {
      correct += form.correctAnswers;
      total += form.exposures;
    });

    return { correct, total };
  }

  private updateOverallMastery(mastery: LetterMastery): void {
    // Calculate weighted average based on form importance and recency
    const weights = {
      isolated: 0.3,
      initial: 0.25,
      medial: 0.2,
      final: 0.25
    };

    let weightedSum = 0;
    let totalWeight = 0;

    Object.entries(mastery.forms).forEach(([form, formMastery]) => {
      // Only include forms that have been attempted
      if (formMastery.exposures > 0) {
        const accuracy = this.getFormAccuracy(formMastery);
        const recencyBonus = this.getRecencyBonus(formMastery.lastSeen);
        const weight = weights[form as LetterForm];
        
        weightedSum += accuracy * weight * recencyBonus;
        totalWeight += weight * recencyBonus;
      }
    });

    mastery.overallMastery = totalWeight > 0 ? weightedSum / totalWeight : 0;
    mastery.masteryLevel = this.calculateMasteryLevel(mastery.overallMastery);
  }

  private getFormAccuracy(formMastery: LetterFormMastery): number {
    if (formMastery.exposures === 0) return 0;
    
    // Weighted average: recent accuracy (70%) + overall accuracy (30%)
    const overallAccuracy = formMastery.correctAnswers / formMastery.exposures;
    const recentAccuracy = formMastery.recentAccuracy.length > 0
      ? formMastery.recentAccuracy.reduce((a, b) => a + b, 0) / formMastery.recentAccuracy.length
      : 0;
    
    return recentAccuracy * 0.7 + overallAccuracy * 0.3;
  }

  private getRecencyBonus(lastSeen: Date): number {
    const hoursSince = (new Date().getTime() - lastSeen.getTime()) / (1000 * 60 * 60);
    // Full bonus for < 1 hour, decreasing to 0.5 after 24 hours
    return Math.max(0.5, 1 - (hoursSince / 48));
  }

  private calculateMasteryLevel(overallMastery: number): MasteryLevel {
    if (overallMastery >= this.MASTERY_THRESHOLDS.MASTERED) return 3;
    if (overallMastery >= this.MASTERY_THRESHOLDS.PROFICIENT) return 2;
    if (overallMastery >= this.MASTERY_THRESHOLDS.FAMILIAR) return 1;
    return 0;
  }

  getLetterMastery(letterId: string): LetterMastery | undefined {
    return this.masteryData.get(letterId);
  }

  getFormMastery(letterId: string, form: LetterForm): LetterFormMastery | undefined {
    const mastery = this.masteryData.get(letterId);
    return mastery?.forms[form];
  }

  getWeakestForm(letterId: string): LetterForm | undefined {
    const mastery = this.masteryData.get(letterId);
    if (!mastery) return undefined;

    let weakestForm: LetterForm = 'isolated';
    let lowestAccuracy = 1;

    Object.entries(mastery.forms).forEach(([form, formMastery]) => {
      const accuracy = this.getFormAccuracy(formMastery);
      if (accuracy < lowestAccuracy) {
        lowestAccuracy = accuracy;
        weakestForm = form as LetterForm;
      }
    });

    return weakestForm;
  }

  getLettersNeedingPractice(limit: number = 5): Array<{letterId: string; form: LetterForm; score: number}> {
    const candidates: Array<{letterId: string; form: LetterForm; score: number}> = [];

    this.masteryData.forEach((mastery, letterId) => {
      Object.entries(mastery.forms).forEach(([form, formMastery]) => {
        const accuracy = this.getFormAccuracy(formMastery);
        const recency = this.getRecencyBonus(formMastery.lastSeen);
        // Lower score = needs more practice
        const score = accuracy * recency;
        
        candidates.push({
          letterId,
          form: form as LetterForm,
          score
        });
      });
    });

    // Sort by score (ascending) and return top candidates
    return candidates
      .sort((a, b) => a.score - b.score)
      .slice(0, limit);
  }

  getConfusionPairs(letterId: string): ConfusionPair[] {
    const mastery = this.masteryData.get(letterId);
    return mastery?.confusedWith || [];
  }

  serializeToJSON(): string {
    const data: Record<string, LetterMastery> = {};
    this.masteryData.forEach((value, key) => {
      data[key] = value;
    });
    return JSON.stringify(data);
  }

  static deserializeFromJSON(json: string): MasteryTracker {
    const data = JSON.parse(json);
    const map = new Map<string, LetterMastery>();
    
    Object.entries(data).forEach(([key, value]) => {
      // Convert date strings back to Date objects
      const mastery = value as LetterMastery;
      Object.values(mastery.forms).forEach(form => {
        form.lastSeen = new Date(form.lastSeen);
      });
      map.set(key, mastery);
    });
    
    return new MasteryTracker(map);
  }

  getAllMasteryData(): Map<string, LetterMastery> {
    return new Map(this.masteryData);
  }
}