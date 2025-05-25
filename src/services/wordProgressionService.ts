import type { ProgressiveWord } from '../data/progressiveWords';
import { getAvailableWords } from '../data/progressiveWords';
import { MasteryTracker } from './masteryTracking';

export interface WordMastery {
  wordId: string;
  lastSeen: Date;
  timesPresented: number;
  timesCorrect: number;
  averageResponseTime: number;
  confusedWith: string[]; // Other word IDs
}

export interface WordSelectionStrategy {
  // Weights for different factors (should sum to 1.0)
  noveltyWeight: number;      // Prefer new words
  difficultyWeight: number;   // Match difficulty to user level
  frequencyWeight: number;    // Prefer common words
  spacingWeight: number;      // Space out repetitions
  categoryWeight: number;     // Variety in categories
}

export class WordProgressionService {
  private wordMastery: Map<string, WordMastery> = new Map();
  private recentCategories: string[] = [];
  private readonly MAX_RECENT_CATEGORIES = 3;
  private masteryTracker: MasteryTracker;
  private strategy: WordSelectionStrategy;
  
  constructor(masteryTracker: MasteryTracker, strategy?: WordSelectionStrategy) {
    this.masteryTracker = masteryTracker;
    this.strategy = strategy || {
      noveltyWeight: 0.3,
      difficultyWeight: 0.2,
      frequencyWeight: 0.2,
      spacingWeight: 0.2,
      categoryWeight: 0.1
    };
  }

  /**
   * Select the next word for the user to practice
   */
  selectNextWord(recentWordIds: string[] = []): ProgressiveWord | null {
    // Get letters the user knows well enough
    const knownLetterIds = this.getKnownLetterIds();
    
    // Get available words based on known letters
    const availableWords = getAvailableWords(knownLetterIds);
    
    if (availableWords.length === 0) {
      return null;
    }

    // Filter out recently shown words (last 3-5 words)
    const candidateWords = availableWords.filter(
      word => !recentWordIds.slice(-5).includes(word.id)
    );

    // If all words were recently shown, use all available words
    const wordsToScore = candidateWords.length > 0 ? candidateWords : availableWords;

    // Score each word
    const scoredWords = wordsToScore.map(word => ({
      word,
      score: this.scoreWord(word, knownLetterIds)
    }));

    // Sort by score (highest first) and select
    scoredWords.sort((a, b) => b.score - a.score);
    
    // Add some randomness to avoid being too predictable
    const topWords = scoredWords.slice(0, Math.min(3, scoredWords.length));
    const selectedWord = topWords[Math.floor(Math.random() * topWords.length)].word;

    // Update recent categories
    this.updateRecentCategories(selectedWord.category);

    return selectedWord;
  }

  /**
   * Score a word based on multiple factors
   */
  private scoreWord(word: ProgressiveWord, knownLetterIds: string[]): number {
    let score = 0;
    
    // 1. Novelty score (new words get higher scores)
    const mastery = this.wordMastery.get(word.id);
    const noveltyScore = mastery ? 
      Math.max(0, 1 - (mastery.timesPresented / 10)) : 1;
    score += noveltyScore * this.strategy.noveltyWeight;

    // 2. Difficulty score (match to user's level)
    const userLevel = this.calculateUserLevel(knownLetterIds);
    const difficultyMatch = 1 - Math.abs(word.difficulty - userLevel) / 3;
    score += difficultyMatch * this.strategy.difficultyWeight;

    // 3. Frequency score (common words are prioritized)
    const frequencyScore = word.frequency / 5;
    score += frequencyScore * this.strategy.frequencyWeight;

    // 4. Spacing score (based on time since last seen)
    const spacingScore = this.calculateSpacingScore(word.id);
    score += spacingScore * this.strategy.spacingWeight;

    // 5. Category variety score
    const categoryScore = this.recentCategories.includes(word.category) ? 0 : 1;
    score += categoryScore * this.strategy.categoryWeight;

    return score;
  }

  /**
   * Calculate user's overall level based on letter mastery
   */
  private calculateUserLevel(knownLetterIds: string[]): number {
    const totalMastery = knownLetterIds.reduce((sum, letterId) => {
      const mastery = this.masteryTracker.getLetterMastery(letterId);
      return sum + (mastery?.overallMastery || 0);
    }, 0);
    
    const averageMastery = totalMastery / Math.max(1, knownLetterIds.length);
    
    // Convert to 1-3 scale
    if (averageMastery < 0.6) return 1;
    if (averageMastery < 0.85) return 2;
    return 3;
  }

  /**
   * Calculate spacing score based on time since last seen
   */
  private calculateSpacingScore(wordId: string): number {
    const mastery = this.wordMastery.get(wordId);
    if (!mastery) return 1; // Never seen before
    
    const hoursSinceLastSeen = 
      (Date.now() - mastery.lastSeen.getTime()) / (1000 * 60 * 60);
    
    // Optimal spacing based on performance
    const accuracy = mastery.timesCorrect / Math.max(1, mastery.timesPresented);
    const optimalHours = accuracy > 0.8 ? 24 : accuracy > 0.6 ? 12 : 6;
    
    // Score peaks at optimal spacing and decreases on either side
    const spacingRatio = hoursSinceLastSeen / optimalHours;
    if (spacingRatio < 1) {
      return spacingRatio; // Too soon
    } else if (spacingRatio < 2) {
      return 1; // Optimal range
    } else {
      return Math.max(0.5, 1 - (spacingRatio - 2) / 10); // Getting too late
    }
  }

  /**
   * Get letter IDs that the user knows well enough
   */
  private getKnownLetterIds(): string[] {
    // Get all letters from the persianLetters data
    const allLetterIds = ['alef', 'beh', 'sin', 'mim', 'dal', 'nun', 'lam', 'reh', 'yeh', 'vav',
                          'teh', 'peh', 'jim', 'cheh', 'kaf', 'heh', 'ain', 'ghain', 'zeh', 'zheh',
                          'sad', 'zad', 'kheh', 'shin', 'feh', 'qaf'];
    
    // Include letters with at least 40% mastery
    return allLetterIds.filter(letterId => {
      const mastery = this.masteryTracker.getLetterMastery(letterId);
      return mastery && mastery.overallMastery >= 0.4;
    });
  }

  /**
   * Update word mastery after user response
   */
  updateWordMastery(
    wordId: string, 
    correct: boolean, 
    responseTime: number,
    confusedWithId?: string
  ): void {
    const existing = this.wordMastery.get(wordId);
    
    if (existing) {
      // Update existing mastery
      const newAvgTime = 
        (existing.averageResponseTime * existing.timesPresented + responseTime) /
        (existing.timesPresented + 1);
      
      existing.timesPresented++;
      if (correct) existing.timesCorrect++;
      existing.averageResponseTime = newAvgTime;
      existing.lastSeen = new Date();
      
      if (confusedWithId && !existing.confusedWith.includes(confusedWithId)) {
        existing.confusedWith.push(confusedWithId);
      }
    } else {
      // Create new mastery entry
      this.wordMastery.set(wordId, {
        wordId,
        lastSeen: new Date(),
        timesPresented: 1,
        timesCorrect: correct ? 1 : 0,
        averageResponseTime: responseTime,
        confusedWith: confusedWithId ? [confusedWithId] : []
      });
    }
  }

  /**
   * Update recent categories to ensure variety
   */
  private updateRecentCategories(category: string): void {
    this.recentCategories = [category, ...this.recentCategories]
      .slice(0, this.MAX_RECENT_CATEGORIES);
  }

  /**
   * Get words that should be reviewed soon
   */
  getWordsForReview(limit: number = 5): ProgressiveWord[] {
    const knownLetterIds = this.getKnownLetterIds();
    const availableWords = getAvailableWords(knownLetterIds);
    
    // Filter to words that have been seen and need review
    const reviewCandidates = availableWords.filter(word => {
      const mastery = this.wordMastery.get(word.id);
      if (!mastery) return false;
      
      const accuracy = mastery.timesCorrect / mastery.timesPresented;
      const hoursSinceLastSeen = 
        (Date.now() - mastery.lastSeen.getTime()) / (1000 * 60 * 60);
      
      // Need review if accuracy is low or enough time has passed
      return accuracy < 0.8 || hoursSinceLastSeen > 12;
    });
    
    // Sort by urgency
    reviewCandidates.sort((a, b) => {
      const masteryA = this.wordMastery.get(a.id)!;
      const masteryB = this.wordMastery.get(b.id)!;
      
      const accuracyA = masteryA.timesCorrect / masteryA.timesPresented;
      const accuracyB = masteryB.timesCorrect / masteryB.timesPresented;
      
      // Lower accuracy = higher priority
      return accuracyA - accuracyB;
    });
    
    return reviewCandidates.slice(0, limit);
  }

  /**
   * Serialize word mastery data
   */
  serialize(): string {
    return JSON.stringify({
      wordMastery: Array.from(this.wordMastery.entries()).map(([, mastery]) => ({
        ...mastery,
        lastSeen: mastery.lastSeen.toISOString()
      })),
      recentCategories: this.recentCategories
    });
  }

  /**
   * Deserialize word mastery data
   */
  deserialize(data: string): void {
    try {
      const parsed = JSON.parse(data);
      
      this.wordMastery.clear();
      parsed.wordMastery.forEach((item: any) => {
        this.wordMastery.set(item.wordId, {
          ...item,
          lastSeen: new Date(item.lastSeen)
        });
      });
      
      this.recentCategories = parsed.recentCategories || [];
    } catch (error) {
      console.error('Failed to deserialize word mastery data:', error);
    }
  }
}