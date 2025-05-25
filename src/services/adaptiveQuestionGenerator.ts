import { MasteryTracker, type LetterForm } from './masteryTracking';
import { persianLetters, type PersianLetter } from '../data/persianLetters';

export type QuizType = 'letterRecognition' | 'nameToLetter' | 'formRecognition' | 'wordContext';

export interface Question {
  type: QuizType;
  letter: PersianLetter;
  form?: LetterForm;
  options: string[];
  correctAnswer: string;
  word?: { persian: string; transliteration: string; meaning: string };
  targetLetterIndex?: number; // For word context questions
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
  
  // Quiz type weights based on mastery level
  private readonly QUIZ_TYPE_WEIGHTS = {
    learning: {
      letterRecognition: 0.5,
      nameToLetter: 0.3,
      formRecognition: 0.15,
      wordContext: 0.05
    },
    familiar: {
      letterRecognition: 0.3,
      nameToLetter: 0.3,
      formRecognition: 0.25,
      wordContext: 0.15
    },
    proficient: {
      letterRecognition: 0.2,
      nameToLetter: 0.2,
      formRecognition: 0.3,
      wordContext: 0.3
    },
    mastered: {
      letterRecognition: 0.1,
      nameToLetter: 0.1,
      formRecognition: 0.3,
      wordContext: 0.5
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
  }

  generateQuestion(): Question {
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

  private selectLetterAndForm(): { letter: PersianLetter; form: LetterForm } {
    // Get letters needing practice
    const needsPractice = this.tracker.getLettersNeedingPractice(20);
    
    // Filter to only enabled letters
    const enabledNeedsPractice = needsPractice.filter(np => 
      this.config.enabledLetterIds.includes(np.letterId)
    );

    // Build weighted selection pool
    const selectionPool: Array<{ letter: PersianLetter; form: LetterForm; weight: number }> = [];
    
    for (const { letterId, form, score } of enabledNeedsPractice) {
      const letter = persianLetters.find(l => l.id === letterId);
      if (!letter) continue;

      // Base weight inversely proportional to score (lower score = higher weight)
      let weight = 1 - score;

      // Boost weight for confusion pairs
      const confusions = this.tracker.getConfusionPairs(letterId);
      if (confusions.length > 0) {
        weight *= this.config.confusionPairBoost;
      }

      // Apply form progression rules
      if (this.config.formProgressionEnabled) {
        const mastery = this.tracker.getLetterMastery(letterId);
        if (mastery) {
          // Reduce weight for advanced forms if basic forms aren't mastered
          if (form === 'medial' && mastery.forms.isolated.exposures < 5) {
            weight *= 0.3;
          } else if (form === 'initial' && mastery.forms.isolated.exposures < 3) {
            weight *= 0.5;
          }
        }
      }

      // Avoid recently asked questions
      const recentCount = this.recentQuestions.filter(
        q => q.letter.id === letterId && q.form === form
      ).length;
      weight *= Math.pow(0.7, recentCount);

      selectionPool.push({ letter, form, weight });
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
    const suggestions: string[] = [];
    const allMastery = this.tracker.getAllMasteryData();
    
    // Calculate average mastery of enabled letters
    let totalMastery = 0;
    let enabledCount = 0;
    
    for (const [letterId, mastery] of allMastery) {
      if (this.config.enabledLetterIds.includes(letterId)) {
        totalMastery += mastery.overallMastery;
        enabledCount++;
      }
    }
    
    const avgMastery = enabledCount > 0 ? totalMastery / enabledCount : 0;
    
    // Suggest new letters if average mastery is high enough
    if (avgMastery >= this.config.minMasteryForNewLetter) {
      const availableLetters = persianLetters.filter(l => 
        !this.config.enabledLetterIds.includes(l.id)
      );
      
      // Suggest up to 2 new letters
      for (let i = 0; i < Math.min(2, availableLetters.length); i++) {
        suggestions.push(availableLetters[i].id);
      }
    }
    
    return suggestions;
  }
}