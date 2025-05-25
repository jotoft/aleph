import { describe, it, expect, beforeEach } from 'vitest';
import { AdaptiveQuestionGenerator } from './adaptiveQuestionGenerator';
import { MasteryTracker } from './masteryTracking';

describe('AdaptiveQuestionGenerator', () => {
  let tracker: MasteryTracker;
  let generator: AdaptiveQuestionGenerator;

  beforeEach(() => {
    tracker = new MasteryTracker();
    generator = new AdaptiveQuestionGenerator(tracker);
  });

  describe('Basic functionality', () => {
    it('should generate a question', () => {
      const question = generator.generateQuestion();
      
      expect(question).toBeDefined();
      expect(question.type).toBeDefined();
      expect(question.letter).toBeDefined();
      expect(question.options).toBeInstanceOf(Array);
      expect(question.correctAnswer).toBeDefined();
      expect(question.options).toContain(question.correctAnswer);
    });

    it('should generate questions with 4 options', () => {
      const question = generator.generateQuestion();
      expect(question.options).toHaveLength(4);
    });

    it('should shuffle options', () => {
      // Generate multiple questions and check that correct answer isn't always in same position
      const positions = new Set<number>();
      
      for (let i = 0; i < 20; i++) {
        const question = generator.generateQuestion();
        const position = question.options.indexOf(question.correctAnswer);
        positions.add(position);
      }
      
      // Should have multiple different positions
      expect(positions.size).toBeGreaterThan(1);
    });
  });

  describe('Adaptive selection', () => {
    it('should prioritize letters with poor performance', () => {
      // Record poor performance for 'kheh'
      for (let i = 0; i < 5; i++) {
        tracker.recordAttempt('kheh', 'isolated', false);
      }
      
      // Record good performance for other letters
      for (let i = 0; i < 5; i++) {
        tracker.recordAttempt('alef', 'isolated', true);
        tracker.recordAttempt('beh', 'isolated', true);
      }

      // Generate multiple questions and count occurrences
      const letterCounts: Record<string, number> = {};
      for (let i = 0; i < 100; i++) {
        const question = generator.generateQuestion();
        letterCounts[question.letter.id] = (letterCounts[question.letter.id] || 0) + 1;
      }

      // 'kheh' should appear significantly more frequently
      const khehCount = letterCounts['kheh'] || 0;
      const alefCount = letterCounts['alef'] || 0;
      const behCount = letterCounts['beh'] || 0;
      
      // kheh should appear at least 50% more than the well-performing letters
      expect(khehCount).toBeGreaterThan(alefCount);
      expect(khehCount).toBeGreaterThan(behCount);
    });

    it('should use different quiz types based on mastery level', () => {
      const letter = 'dal';
      
      // Build up mastery
      for (let i = 0; i < 20; i++) {
        tracker.recordAttempt(letter, 'isolated', true);
        tracker.recordAttempt(letter, 'initial', true);
        tracker.recordAttempt(letter, 'medial', true);
        tracker.recordAttempt(letter, 'final', true);
      }

      // Configure to only use this letter
      generator.updateConfig({ enabledLetterIds: [letter] });

      // Generate questions and track types
      const typeCounts: Record<string, number> = {};
      for (let i = 0; i < 50; i++) {
        const question = generator.generateQuestion();
        typeCounts[question.type] = (typeCounts[question.type] || 0) + 1;
      }

      // For mastered letter, should see more advanced question types
      expect(typeCounts['wordContext'] || 0).toBeGreaterThan(0);
      expect(typeCounts['formRecognition'] || 0).toBeGreaterThan(0);
    });
  });

  describe('Smart distractors', () => {
    it('should include confused letters as distractors', () => {
      // Record confusion between beh and teh (both are in our dataset)
      tracker.recordAttempt('beh', 'isolated', false, 'standalone', 'teh');
      tracker.recordAttempt('beh', 'isolated', false, 'standalone', 'teh');
      
      // Configure to use limited letters
      generator.updateConfig({ 
        enabledLetterIds: ['beh', 'teh', 'alef', 'dal'] 
      });

      // Generate questions for 'beh' and check distractors
      let foundTehAsDistractor = false;
      for (let i = 0; i < 20; i++) {
        const question = generator.generateQuestion();
        if (question.letter.id === 'beh' && question.type === 'letterRecognition') {
          if (question.options.includes('teh')) {
            foundTehAsDistractor = true;
            break;
          }
        }
      }

      expect(foundTehAsDistractor).toBe(true);
    });
  });

  describe('Configuration', () => {
    it('should respect enabled letters configuration', () => {
      const enabledIds = ['alef', 'beh', 'teh'];
      generator.updateConfig({ enabledLetterIds: enabledIds });

      // Generate many questions
      const seenLetterIds = new Set<string>();
      for (let i = 0; i < 50; i++) {
        const question = generator.generateQuestion();
        seenLetterIds.add(question.letter.id);
      }

      // Should only see enabled letters
      for (const id of seenLetterIds) {
        expect(enabledIds).toContain(id);
      }
    });

    it('should avoid recent questions', () => {
      // Configure to use very limited letters
      generator.updateConfig({ 
        enabledLetterIds: ['alef', 'beh'] 
      });

      // Generate questions and track consecutive repeats
      let previousQuestion: any = null;
      let consecutiveRepeats = 0;
      let maxConsecutiveRepeats = 0;

      for (let i = 0; i < 30; i++) {
        const question = generator.generateQuestion();
        
        if (previousQuestion && 
            previousQuestion.letter.id === question.letter.id && 
            previousQuestion.form === question.form) {
          consecutiveRepeats++;
          maxConsecutiveRepeats = Math.max(maxConsecutiveRepeats, consecutiveRepeats);
        } else {
          consecutiveRepeats = 0;
        }
        
        previousQuestion = question;
      }

      // Should avoid too many consecutive repeats
      expect(maxConsecutiveRepeats).toBeLessThan(5);
    });
  });

  describe('New letter suggestions', () => {
    it('should suggest new letters when mastery is high', () => {
      // Configure with limited letters
      const enabledIds = ['alef', 'beh'];
      generator.updateConfig({ 
        enabledLetterIds: enabledIds,
        minMasteryForNewLetter: 0.7
      });

      // No suggestions initially
      expect(generator.suggestNewLetters()).toHaveLength(0);

      // Build high mastery
      for (let i = 0; i < 20; i++) {
        tracker.recordAttempt('alef', 'isolated', true);
        tracker.recordAttempt('alef', 'initial', true);
        tracker.recordAttempt('beh', 'isolated', true);
        tracker.recordAttempt('beh', 'initial', true);
      }

      // Should now suggest new letters
      const suggestions = generator.suggestNewLetters();
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.length).toBeLessThanOrEqual(2);
      
      // Suggested letters should not be already enabled
      for (const suggestion of suggestions) {
        expect(enabledIds).not.toContain(suggestion);
      }
    });

    it('should not suggest letters when mastery is low', () => {
      generator.updateConfig({ 
        enabledLetterIds: ['alef', 'beh'],
        minMasteryForNewLetter: 0.7
      });

      // Record poor performance
      for (let i = 0; i < 5; i++) {
        tracker.recordAttempt('alef', 'isolated', false);
        tracker.recordAttempt('beh', 'isolated', false);
      }

      const suggestions = generator.suggestNewLetters();
      expect(suggestions).toHaveLength(0);
    });
  });

  describe('Question types', () => {
    it('should create valid letter recognition questions', () => {
      const question = generator.generateQuestion();
      
      if (question.type === 'letterRecognition') {
        expect(question.form).toBeDefined();
        expect(question.correctAnswer).toBe(question.letter.nameEn);
      }
    });

    it('should create valid name to letter questions', () => {
      // Force a nameToLetter question by recording high mastery
      const letterId = 'mim';
      for (let i = 0; i < 10; i++) {
        tracker.recordAttempt(letterId, 'isolated', true);
      }
      
      generator.updateConfig({ enabledLetterIds: [letterId] });
      
      let foundNameToLetter = false;
      for (let i = 0; i < 20; i++) {
        const question = generator.generateQuestion();
        if (question.type === 'nameToLetter') {
          foundNameToLetter = true;
          expect(question.form).toBeDefined();
          expect(question.correctAnswer).toBe(question.letter[question.form!]);
          break;
        }
      }
      
      expect(foundNameToLetter).toBe(true);
    });

    it('should create valid form recognition questions', () => {
      let foundFormRecognition = false;
      
      for (let i = 0; i < 50; i++) {
        const question = generator.generateQuestion();
        if (question.type === 'formRecognition') {
          foundFormRecognition = true;
          expect(question.form).toBeDefined();
          expect(question.options).toEqual(['Isolated', 'Initial', 'Medial', 'Final']);
          const expectedAnswer = question.form!.charAt(0).toUpperCase() + question.form!.slice(1);
          expect(question.correctAnswer).toBe(expectedAnswer);
          break;
        }
      }
      
      expect(foundFormRecognition).toBe(true);
    });
  });
});