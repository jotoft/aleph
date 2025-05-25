import { MasteryTracker, type LetterForm } from './masteryTracking';
import { persianLetters, type PersianLetter } from '../data/persianLetters';
import { WordProgressionService } from './wordProgressionService';

export type QuizType = 'letterRecognition' | 'nameToLetter' | 'formRecognition' | 'wordContext' | 'wordReading';

export interface Question {
  type: QuizType;
  letter?: PersianLetter; // Optional for word reading
  form?: LetterForm;
  options: string[];
  correctAnswer: string;
  word?: { persian: string; transliteration: string; meaning: string };
  targetLetterIndex?: number; // For word context questions
  wordId?: string; // For word reading questions
  currentLetterIndex?: number; // For word reading - which letter we're asking about
}

export interface GeneratorConfig {
  enabledLetterIds: string[]; // Which letters to include
  minMasteryForNewLetter: number; // 0-1, when to introduce new letters
  confusionPairBoost: number; // How much to boost confusion pairs (1-3)
  formProgressionEnabled: boolean; // Whether to follow form progression
  adaptiveDifficulty: boolean; // Whether to adjust difficulty based on performance
}

export class AdaptiveQuestionGenerator {
  private tracker: MasteryTracker;
  private config: GeneratorConfig;
  private recentQuestions: Question[] = [];
  private readonly MAX_RECENT_QUESTIONS = 10;
  private letterProgressionGroups: string[][];
  public wordProgressionService: WordProgressionService;
  private recentWordIds: string[] = [];
  
  // Quiz type weights based on mastery level
  private readonly QUIZ_TYPE_WEIGHTS = {
    learning: {
      letterRecognition: 0.45,
      nameToLetter: 0.25,
      formRecognition: 0.15,
      wordContext: 0.05,
      wordReading: 0.1
    },
    familiar: {
      letterRecognition: 0.25,
      nameToLetter: 0.25,
      formRecognition: 0.2,
      wordContext: 0.15,
      wordReading: 0.15
    },
    proficient: {
      letterRecognition: 0.15,
      nameToLetter: 0.15,
      formRecognition: 0.25,
      wordContext: 0.25,
      wordReading: 0.2
    },
    mastered: {
      letterRecognition: 0.1,
      nameToLetter: 0.1,
      formRecognition: 0.2,
      wordContext: 0.3,
      wordReading: 0.3
    }
  };

  constructor(tracker: MasteryTracker, config: Partial<GeneratorConfig> = {}) {
    this.tracker = tracker;
    this.config = {
      enabledLetterIds: persianLetters.map(l => l.id),
      minMasteryForNewLetter: 0.7,
      confusionPairBoost: 2,
      formProgressionEnabled: true,
      adaptiveDifficulty: true,
      ...config
    };
    
    // Initialize word progression service
    this.wordProgressionService = new WordProgressionService(tracker);
    
    // Define letter progression groups (from easiest/most distinct to harder/similar)
    this.letterProgressionGroups = [
      // Group 1: Most distinct, common letters
      ['alef', 'beh', 'sin', 'mim', 'dal'],
      // Group 2: More common letters
      ['nun', 'lam', 'reh', 'yeh', 'vav'],
      // Group 3: Letters with dots
      ['teh', 'peh', 'jim', 'cheh'],
      // Group 4: More complex shapes
      ['kaf', 'heh', 'ain', 'ghain'],
      // Group 5: Similar looking pairs
      ['zeh', 'zheh', 'sad', 'zad'],
      // Group 6: Less common
      ['kheh', 'shin', 'feh', 'qaf'],
      // Group 7: Remaining letters
      ['theh', 'heh-jimi', 'tah', 'zah', 'gaf', 'hamzeh']
    ];
  }

  generateQuestion(): Question {
    // First, decide if we should do word reading based on overall mastery
    const shouldDoWordReading = this.shouldSelectWordReading();
    
    if (shouldDoWordReading) {
      const question = this.createWordReadingQuestion();
      
      // Track recent questions to avoid repetition
      this.recentQuestions.push(question);
      if (this.recentQuestions.length > this.MAX_RECENT_QUESTIONS) {
        this.recentQuestions.shift();
      }
      
      return question;
    }
    
    // Otherwise, use the traditional flow
    const letterAndForm = this.selectLetterAndForm();
    const quizType = this.selectQuizType(letterAndForm.letter, letterAndForm.form);
    const question = this.createQuestion(letterAndForm.letter, letterAndForm.form, quizType);
    
    // Track recent questions to avoid repetition
    this.recentQuestions.push(question);
    if (this.recentQuestions.length > this.MAX_RECENT_QUESTIONS) {
      this.recentQuestions.shift();
    }
    
    return question;
  }

  private getActiveLetters(): string[] {
    const activeLetters: string[] = [];
    let shouldAddNewGroup = true;
    
    // Go through each progression group
    for (let groupIndex = 0; groupIndex < this.letterProgressionGroups.length; groupIndex++) {
      const group = this.letterProgressionGroups[groupIndex];
      
      // Always include the first group (starter letters)
      if (groupIndex === 0) {
        activeLetters.push(...group);
        continue;
      }
      
      // For other groups, check if we should add them
      if (!shouldAddNewGroup) break;
      
      // Calculate average mastery of all active letters
      let totalMastery = 0;
      let letterCount = 0;
      
      for (const letterId of activeLetters) {
        const mastery = this.tracker.getLetterMastery(letterId);
        if (mastery) {
          // Get overall accuracy across all forms
          let totalExposures = 0;
          let totalCorrect = 0;
          
          Object.values(mastery.forms).forEach(form => {
            totalExposures += form.exposures;
            totalCorrect += form.correctAnswers;
          });
          
          if (totalExposures > 0) {
            const accuracy = totalCorrect / totalExposures;
            // Only count letters with at least 5 exposures
            if (totalExposures >= 5) {
              totalMastery += accuracy;
              letterCount++;
            }
          }
        }
      }
      
      // Calculate average mastery
      const avgMastery = letterCount > 0 ? totalMastery / letterCount : 0;
      
      // Need at least 70% average mastery and minimum practice before adding new letters
      if (avgMastery >= this.config.minMasteryForNewLetter && letterCount >= activeLetters.length * 0.8) {
        activeLetters.push(...group);
      } else {
        shouldAddNewGroup = false;
      }
    }
    
    return activeLetters;
  }
  
  private selectLetterAndForm(): { letter: PersianLetter; form: LetterForm } {
    // Get dynamically calculated active letters based on mastery
    const lettersToUse = this.getActiveLetters();
    
    // Get enabled letters from our progression
    const enabledLetters = persianLetters.filter(l => 
      lettersToUse.includes(l.id)
    );
    
    // Build weighted selection pool
    const selectionPool: Array<{ letter: PersianLetter; form: LetterForm; weight: number }> = [];
    const forms: LetterForm[] = ['isolated', 'initial', 'medial', 'final'];
    
    for (const letter of enabledLetters) {
      const mastery = this.tracker.getLetterMastery(letter.id);
      
      for (const form of forms) {
        let weight = 1.0;
        
        if (mastery) {
          const formData = mastery.forms[form];
          const accuracy = formData.exposures > 0 
            ? formData.correctAnswers / formData.exposures 
            : 0;
          
          // Base weight: prioritize low accuracy and low exposure
          if (formData.exposures === 0) {
            weight = 2.0; // Unasked forms get high priority
          } else if (formData.exposures < 3) {
            weight = 1.5; // New forms get moderate priority
          } else {
            // Weight based on accuracy (lower accuracy = higher weight)
            weight = Math.max(0.1, 1 - accuracy);
          }
          
          // Boost weight for confusion pairs
          const confusions = this.tracker.getConfusionPairs(letter.id);
          if (confusions.length > 0) {
            weight *= this.config.confusionPairBoost;
          }
          
          // Apply form progression rules
          if (this.config.formProgressionEnabled) {
            // Reduce weight for advanced forms if basic forms aren't mastered
            if (form === 'medial' && mastery.forms.isolated.exposures < 5) {
              weight *= 0.3;
            } else if (form === 'initial' && mastery.forms.isolated.exposures < 3) {
              weight *= 0.5;
            } else if (form === 'final' && mastery.forms.isolated.exposures < 3) {
              weight *= 0.5;
            }
          }
        } else {
          // No mastery data = high priority for isolated form, lower for others
          weight = form === 'isolated' ? 3.0 : 1.0;
        }
        
        // Avoid recently asked questions - but less strict in the beginning
        const recentCount = this.recentQuestions.filter(
          q => q.letter && q.letter.id === letter.id && q.form === form
        ).length;
        if (recentCount > 0) {
          // Less penalty when we have fewer letters to work with
          const recentPenalty = lettersToUse.length <= 4 ? 0.5 : 0.3;
          weight *= Math.pow(recentPenalty, recentCount);
        }
        
        // Only add if weight is significant
        if (weight > 0.01) {
          selectionPool.push({ letter, form, weight });
        }
      }
    }

    // If pool is empty, select randomly from enabled letters
    if (selectionPool.length === 0) {
      const enabledLetters = persianLetters.filter(l => 
        this.config.enabledLetterIds.includes(l.id)
      );
      
      if (enabledLetters.length === 0) {
        // Fallback to first available letter if no enabled letters
        const forms: LetterForm[] = ['isolated', 'initial', 'medial', 'final'];
        return {
          letter: persianLetters[0],
          form: forms[Math.floor(Math.random() * forms.length)]
        };
      }
      
      const letter = enabledLetters[Math.floor(Math.random() * enabledLetters.length)];
      const forms: LetterForm[] = ['isolated', 'initial', 'medial', 'final'];
      return { 
        letter, 
        form: forms[Math.floor(Math.random() * forms.length)]
      };
    }

    // Weighted random selection
    const totalWeight = selectionPool.reduce((sum, item) => sum + item.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const item of selectionPool) {
      random -= item.weight;
      if (random <= 0) {
        return { letter: item.letter, form: item.form };
      }
    }

    // Fallback
    const fallback = selectionPool[0];
    return { letter: fallback.letter, form: fallback.form };
  }

  private selectQuizType(letter: PersianLetter, form: LetterForm): QuizType {
    const mastery = this.tracker.getLetterMastery(letter.id);
    const masteryLevel = mastery?.masteryLevel ?? 0;
    
    // Get weights based on mastery level
    const weights = this.QUIZ_TYPE_WEIGHTS[
      masteryLevel === 0 ? 'learning' :
      masteryLevel === 1 ? 'familiar' :
      masteryLevel === 2 ? 'proficient' : 'mastered'
    ];

    // Adjust weights based on specific conditions
    const adjustedWeights = { ...weights };
    
    // If form recognition is weak, boost its weight
    if (mastery && form !== 'isolated') {
      const formAccuracy = mastery.forms[form].exposures > 0 
        ? mastery.forms[form].correctAnswers / mastery.forms[form].exposures
        : 0;
      if (formAccuracy < 0.7) {
        adjustedWeights.formRecognition *= 1.5;
      }
    }

    // If no example words available, zero out word context
    if (!letter.exampleWords || letter.exampleWords.length === 0) {
      adjustedWeights.wordContext = 0;
    }

    // Weighted random selection
    const totalWeight = Object.values(adjustedWeights).reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;
    
    for (const [type, weight] of Object.entries(adjustedWeights)) {
      random -= weight;
      if (random <= 0) {
        return type as QuizType;
      }
    }

    return 'letterRecognition'; // Fallback
  }

  private createQuestion(
    letter: PersianLetter, 
    form: LetterForm, 
    type: QuizType
  ): Question {
    switch (type) {
      case 'letterRecognition':
        return this.createLetterRecognitionQuestion(letter, form);
      
      case 'nameToLetter':
        return this.createNameToLetterQuestion(letter, form);
      
      case 'formRecognition':
        return this.createFormRecognitionQuestion(letter, form);
      
      case 'wordContext':
        return this.createWordContextQuestion(letter, form);
      
      case 'wordReading':
        return this.createWordReadingQuestion();
    }
  }

  private createLetterRecognitionQuestion(letter: PersianLetter, form: LetterForm): Question {
    const options = [letter.nameEn];
    const distractors = this.getSmartDistracters(letter.id, 'nameEn', 3);
    options.push(...distractors);

    return {
      type: 'letterRecognition',
      letter,
      form,
      options: this.shuffleArray(options),
      correctAnswer: letter.nameEn
    };
  }

  private createNameToLetterQuestion(letter: PersianLetter, form: LetterForm): Question {
    const letterForm = letter[form];
    const options = [letterForm];
    
    // Get similar looking letters as distractors
    const distractors = this.getSmartDistracters(letter.id, form, 3);
    options.push(...distractors);

    return {
      type: 'nameToLetter',
      letter,
      form,
      options: this.shuffleArray(options),
      correctAnswer: letterForm
    };
  }

  private createFormRecognitionQuestion(letter: PersianLetter, form: LetterForm): Question {
    return {
      type: 'formRecognition',
      letter,
      form,
      options: ['Isolated', 'Initial', 'Medial', 'Final'],
      correctAnswer: form.charAt(0).toUpperCase() + form.slice(1)
    };
  }

  private createWordContextQuestion(letter: PersianLetter, form: LetterForm): Question {
    // Find a word that contains the letter in the specific form we're testing
    const letterForm = letter[form];
    let selectedWord = null;
    let targetIndex = -1;
    
    // Try to find a word containing the specific form
    for (const wordData of letter.exampleWords) {
      for (let i = 0; i < wordData.word.length; i++) {
        if (wordData.word[i] === letterForm) {
          selectedWord = wordData;
          targetIndex = i;
          break;
        }
      }
      if (selectedWord) break;
    }
    
    // If we can't find a word with the specific form, fall back to any form
    if (!selectedWord) {
      // For isolated form, prefer words where letter appears at the end disconnected
      // For initial form, prefer words where letter is at the beginning
      // For medial form, prefer words where letter is in the middle
      // For final form, prefer words where letter is at the end connected
      
      const allForms = [letter.isolated, letter.initial, letter.medial, letter.final];
      for (const wordData of letter.exampleWords) {
        for (let i = 0; i < wordData.word.length; i++) {
          if (allForms.includes(wordData.word[i])) {
            selectedWord = wordData;
            targetIndex = i;
            // Update the form to match what's actually in the word
            if (wordData.word[i] === letter.isolated) form = 'isolated';
            else if (wordData.word[i] === letter.initial) form = 'initial';
            else if (wordData.word[i] === letter.medial) form = 'medial';
            else if (wordData.word[i] === letter.final) form = 'final';
            break;
          }
        }
        if (selectedWord) break;
      }
    }
    
    // If still no word found, use the first available word
    if (!selectedWord) {
      selectedWord = letter.exampleWords[0];
      targetIndex = 0;
    }

    const options = [letter.nameEn];
    const distractors = this.getSmartDistracters(letter.id, 'nameEn', 3);
    options.push(...distractors);

    return {
      type: 'wordContext',
      letter,
      form, // This is now the actual form found in the word
      word: {
        persian: selectedWord.word,
        transliteration: selectedWord.transliteration,
        meaning: selectedWord.meaning
      },
      options: this.shuffleArray(options),
      correctAnswer: letter.nameEn,
      targetLetterIndex: targetIndex
    };
  }

  private getSmartDistracters(
    letterId: string, 
    property: keyof PersianLetter | LetterForm, 
    count: number
  ): string[] {
    const distractors: string[] = [];
    const confusions = this.tracker.getConfusionPairs(letterId);
    
    // First, add confused letters
    for (const confusion of confusions) {
      if (distractors.length >= count) break;
      const confusedLetter = persianLetters.find(l => l.id === confusion.letterId);
      if (confusedLetter) {
        if (property in confusedLetter) {
          distractors.push(confusedLetter[property as keyof PersianLetter] as string);
        } else if (property in ['isolated', 'initial', 'medial', 'final']) {
          distractors.push(confusedLetter[property as LetterForm]);
        }
      }
    }

    // Fill remaining with random letters
    const enabledLetters = persianLetters.filter(l => 
      this.config.enabledLetterIds.includes(l.id) && l.id !== letterId
    );
    
    const maxAttempts = 50; // Prevent infinite loop
    let attempts = 0;
    
    while (distractors.length < count && enabledLetters.length > 0 && attempts < maxAttempts) {
      attempts++;
      const randomIndex = Math.floor(Math.random() * enabledLetters.length);
      const randomLetter = enabledLetters[randomIndex];
      let value: string | undefined;
      
      if (property === 'isolated' || property === 'initial' || property === 'medial' || property === 'final') {
        value = randomLetter[property];
      } else if (property in randomLetter) {
        value = randomLetter[property as keyof PersianLetter] as string;
      }
      
      if (value && !distractors.includes(value)) {
        distractors.push(value);
      }
    }

    return distractors.slice(0, count);
  }

  private shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }

  updateConfig(config: Partial<GeneratorConfig>): void {
    this.config = { ...this.config, ...config };
  }

  getEnabledLetterCount(): number {
    return this.config.enabledLetterIds.length;
  }

  suggestNewLetters(): string[] {
    const activeLetters = this.getActiveLetters();
    
    // Find the next group that could be added
    for (const group of this.letterProgressionGroups) {
      const newLettersInGroup = group.filter(letterId => !activeLetters.includes(letterId));
      if (newLettersInGroup.length > 0) {
        // Return up to 2 letters from the next group
        return newLettersInGroup.slice(0, 2);
      }
    }
    
    return [];
  }
  
  getProgressInfo(): { 
    activeLetters: number; 
    totalLetters: number; 
    avgMastery: number;
    readyForMore: boolean;
    nextLetters: string[];
  } {
    const activeLetterIds = this.getActiveLetters();
    
    // Calculate average mastery of active letters
    let totalMastery = 0;
    let letterCount = 0;
    let minExposures = Infinity;
    
    for (const letterId of activeLetterIds) {
      const mastery = this.tracker.getLetterMastery(letterId);
      if (mastery) {
        let totalExposures = 0;
        let totalCorrect = 0;
        
        Object.values(mastery.forms).forEach(form => {
          totalExposures += form.exposures;
          totalCorrect += form.correctAnswers;
        });
        
        minExposures = Math.min(minExposures, totalExposures);
        
        if (totalExposures >= 5) {
          const accuracy = totalCorrect / totalExposures;
          totalMastery += accuracy;
          letterCount++;
        }
      }
    }
    
    const avgMastery = letterCount > 0 ? totalMastery / letterCount : 0;
    const readyForMore = avgMastery >= this.config.minMasteryForNewLetter && 
                        letterCount >= activeLetterIds.length * 0.8 &&
                        minExposures >= 5; // All active letters have been practiced
    
    return {
      activeLetters: activeLetterIds.length,
      totalLetters: persianLetters.length,
      avgMastery: Math.round(avgMastery * 100),
      readyForMore,
      nextLetters: this.suggestNewLetters()
    };
  }

  private shouldSelectWordReading(): boolean {
    // Get overall average mastery
    const activeLetters = this.getActiveLetters();
    if (activeLetters.length < 3) return false; // Need at least a few letters
    
    let totalMastery = 0;
    let letterCount = 0;
    
    for (const letterId of activeLetters) {
      const mastery = this.tracker.getLetterMastery(letterId);
      if (mastery && mastery.overallMastery > 0) {
        totalMastery += mastery.overallMastery;
        letterCount++;
      }
    }
    
    if (letterCount === 0) return false;
    
    const avgMastery = totalMastery / letterCount;
    
    // Use word reading probability based on average mastery
    // 0-40% mastery: 10% chance
    // 40-60% mastery: 15% chance  
    // 60-80% mastery: 20% chance
    // 80%+ mastery: 30% chance
    let wordReadingProbability = 0.1;
    if (avgMastery >= 0.8) wordReadingProbability = 0.3;
    else if (avgMastery >= 0.6) wordReadingProbability = 0.2;
    else if (avgMastery >= 0.4) wordReadingProbability = 0.15;
    
    return Math.random() < wordReadingProbability;
  }

  private createWordReadingQuestion(): Question {
    // Select a word based on known letters
    const word = this.wordProgressionService.selectNextWord(this.recentWordIds);
    
    if (!word) {
      // Fallback to a simple letter recognition question if no words available
      const { letter, form } = this.selectLetterAndForm();
      return this.createLetterRecognitionQuestion(letter, form);
    }
    
    // Add to recent words
    this.recentWordIds = [...this.recentWordIds.slice(-4), word.id];
    
    // Select a random letter from the word to ask about
    const letterOptions: { letter: PersianLetter; index: number }[] = [];
    
    // Find all letters in the word
    for (let i = 0; i < word.persian.length; i++) {
      const char = word.persian[i];
      
      // Find which letter this character belongs to
      for (const letter of persianLetters) {
        if ([letter.isolated, letter.initial, letter.medial, letter.final].includes(char)) {
          letterOptions.push({ letter, index: i });
          break;
        }
      }
    }
    
    if (letterOptions.length === 0) {
      // Fallback if we can't find letters
      const { letter, form } = this.selectLetterAndForm();
      return this.createLetterRecognitionQuestion(letter, form);
    }
    
    // Select a random letter from the word
    const selected = letterOptions[Math.floor(Math.random() * letterOptions.length)];
    
    // Create distractors
    const options = [selected.letter.nameEn];
    const distractors = this.getSmartDistracters(selected.letter.id, 'nameEn', 3);
    options.push(...distractors);
    
    return {
      type: 'wordReading',
      letter: selected.letter,
      options: this.shuffleArray(options),
      correctAnswer: selected.letter.nameEn,
      word: {
        persian: word.persian,
        transliteration: word.transliteration,
        meaning: word.meaning
      },
      wordId: word.id,
      currentLetterIndex: selected.index
    };
  }
}