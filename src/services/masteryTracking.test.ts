import { describe, it, expect, beforeEach } from 'vitest';
import { MasteryTracker } from './masteryTracking';

describe('MasteryTracker', () => {
  let tracker: MasteryTracker;

  beforeEach(() => {
    tracker = new MasteryTracker();
  });

  describe('Basic functionality', () => {
    it('should create letter mastery on first attempt', () => {
      tracker.recordAttempt('alef', 'isolated', true);
      const mastery = tracker.getLetterMastery('alef');
      
      expect(mastery).toBeDefined();
      expect(mastery?.letterId).toBe('alef');
      expect(mastery?.forms.isolated.exposures).toBe(1);
      expect(mastery?.forms.isolated.correctAnswers).toBe(1);
    });

    it('should track correct and incorrect attempts', () => {
      tracker.recordAttempt('beh', 'initial', true);
      tracker.recordAttempt('beh', 'initial', false);
      tracker.recordAttempt('beh', 'initial', true);

      const formMastery = tracker.getFormMastery('beh', 'initial');
      expect(formMastery?.exposures).toBe(3);
      expect(formMastery?.correctAnswers).toBe(2);
      expect(formMastery?.recentAccuracy).toEqual([1, 0, 1]);
    });

    it('should maintain only last 5 attempts in recent accuracy', () => {
      // First 10 attempts: 0=true, 1=false, 2=true, 3=false, 4=true, 5=false, 6=true, 7=false, 8=true, 9=false
      for (let i = 0; i < 10; i++) {
        tracker.recordAttempt('teh', 'medial', i % 2 === 0);
      }

      const formMastery = tracker.getFormMastery('teh', 'medial');
      expect(formMastery?.recentAccuracy).toHaveLength(5);
      // Last 5 attempts would be indices 5-9: false, true, false, true, false
      expect(formMastery?.recentAccuracy).toEqual([0, 1, 0, 1, 0]);
    });
  });

  describe('Confusion tracking', () => {
    it('should track confusion pairs', () => {
      tracker.recordAttempt('beh', 'isolated', false, 'standalone', 'peh', 'isolated');
      tracker.recordAttempt('beh', 'isolated', false, 'standalone', 'peh', 'isolated');
      tracker.recordAttempt('beh', 'isolated', false, 'standalone', 'teh', 'isolated');

      const confusions = tracker.getConfusionPairs('beh');
      expect(confusions).toHaveLength(2);
      
      const pehConfusion = confusions.find(c => c.letterId === 'peh');
      expect(pehConfusion?.count).toBe(2);
      expect(pehConfusion?.form).toBe('isolated');
    });

    it('should track form-specific confusions', () => {
      tracker.recordAttempt('heh', 'initial', false, 'standalone', 'mim', 'initial');
      tracker.recordAttempt('heh', 'isolated', false, 'standalone', 'mim', 'isolated');

      const confusions = tracker.getConfusionPairs('heh');
      expect(confusions).toHaveLength(2);
      expect(confusions.some(c => c.form === 'initial')).toBe(true);
      expect(confusions.some(c => c.form === 'isolated')).toBe(true);
    });
  });

  describe('Mastery calculations', () => {
    it('should calculate overall mastery from all forms', () => {
      // Perfect isolated form
      tracker.recordAttempt('dal', 'isolated', true);
      tracker.recordAttempt('dal', 'isolated', true);
      tracker.recordAttempt('dal', 'isolated', true);

      // Mixed performance on initial form
      tracker.recordAttempt('dal', 'initial', true);
      tracker.recordAttempt('dal', 'initial', false);

      const mastery = tracker.getLetterMastery('dal');
      expect(mastery?.overallMastery).toBeGreaterThan(0);
      expect(mastery?.overallMastery).toBeLessThan(1);
    });

    it('should assign correct mastery levels', () => {
      const letter = 'reh';
      
      // Build up to mastered level
      for (let i = 0; i < 20; i++) {
        tracker.recordAttempt(letter, 'isolated', true);
        tracker.recordAttempt(letter, 'initial', true);
        tracker.recordAttempt(letter, 'medial', true);
        tracker.recordAttempt(letter, 'final', true);
      }

      const mastery = tracker.getLetterMastery(letter);
      expect(mastery?.masteryLevel).toBe(3); // Mastered
      expect(mastery?.overallMastery).toBeGreaterThan(0.95);
    });

    it('should weight recent accuracy higher than overall', () => {
      const letter = 'zeh';
      
      // Many incorrect attempts
      for (let i = 0; i < 10; i++) {
        tracker.recordAttempt(letter, 'isolated', false);
      }
      
      // Recent correct attempts
      for (let i = 0; i < 5; i++) {
        tracker.recordAttempt(letter, 'isolated', true);
      }

      const formMastery = tracker.getFormMastery(letter, 'isolated');
      const mastery = tracker.getLetterMastery(letter);
      
      // Recent accuracy is 100% (last 5), overall is 5/15 = 33%
      // Form accuracy = 0.7 * 1.0 + 0.3 * 0.33 = 0.7 + 0.1 = 0.8
      // But since only isolated form is attempted, overall should equal form accuracy
      expect(formMastery?.recentAccuracy).toEqual([1, 1, 1, 1, 1]);
      expect(mastery?.overallMastery).toBeGreaterThan(0.7);
    });
  });

  describe('Finding weak areas', () => {
    it('should identify weakest form', () => {
      tracker.recordAttempt('sin', 'isolated', true);
      tracker.recordAttempt('sin', 'isolated', true);
      tracker.recordAttempt('sin', 'initial', false);
      tracker.recordAttempt('sin', 'initial', false);
      tracker.recordAttempt('sin', 'medial', true);
      tracker.recordAttempt('sin', 'final', true);

      const weakestForm = tracker.getWeakestForm('sin');
      expect(weakestForm).toBe('initial');
    });

    it('should get letters needing practice', () => {
      // Letter with poor performance
      tracker.recordAttempt('kheh', 'isolated', false);
      tracker.recordAttempt('kheh', 'initial', false);
      
      // Letter with good performance
      tracker.recordAttempt('mim', 'isolated', true);
      tracker.recordAttempt('mim', 'isolated', true);
      tracker.recordAttempt('mim', 'initial', true);

      const needsPractice = tracker.getLettersNeedingPractice(10);
      
      // Should return entries for all forms that have been attempted
      expect(needsPractice.length).toBeGreaterThan(0);
      
      // Find entries for poor performing letter
      const khehIsolated = needsPractice.find(np => np.letterId === 'kheh' && np.form === 'isolated');
      // Find entries for good performing letter  
      const mimIsolated = needsPractice.find(np => np.letterId === 'mim' && np.form === 'isolated');
      
      expect(khehIsolated).toBeDefined();
      expect(mimIsolated).toBeDefined();
      
      // kheh (0% accuracy) should have lower score than mim (100% accuracy)
      if (khehIsolated && mimIsolated) {
        expect(khehIsolated.score).toBeLessThan(mimIsolated.score);
      }
    });

    it('should prioritize forms not seen recently', () => {
      // Create old data by manipulating dates
      const oldDate = new Date();
      oldDate.setHours(oldDate.getHours() - 48);

      tracker.recordAttempt('nun', 'isolated', true);
      const mastery = tracker.getLetterMastery('nun')!;
      mastery.forms.isolated.lastSeen = oldDate;

      tracker.recordAttempt('yeh', 'isolated', true);

      const needsPractice = tracker.getLettersNeedingPractice(2);
      // Even though both have 100% accuracy, nun should come first due to recency
      expect(needsPractice[0].letterId).toBe('nun');
    });
  });

  describe('Contextual mastery', () => {
    it('should track standalone vs in-word performance separately', () => {
      tracker.recordAttempt('lam', 'medial', true, 'standalone');
      tracker.recordAttempt('lam', 'medial', true, 'standalone');
      tracker.recordAttempt('lam', 'medial', false, 'inWord');
      tracker.recordAttempt('lam', 'medial', false, 'inWord');

      const mastery = tracker.getLetterMastery('lam');
      expect(mastery).toBeDefined();
      if (mastery) {
        expect(mastery.contextualMastery.standalone).toBeGreaterThan(
          mastery.contextualMastery.inWords
        );
      }
    });
  });

  describe('Serialization', () => {
    it('should serialize and deserialize correctly', () => {
      // Create some data
      tracker.recordAttempt('alef', 'isolated', true);
      tracker.recordAttempt('beh', 'initial', false, 'standalone', 'peh');
      tracker.recordAttempt('teh', 'medial', true);

      // Serialize
      const json = tracker.serializeToJSON();
      
      // Create new tracker from serialized data
      const newTracker = MasteryTracker.deserializeFromJSON(json);
      
      // Verify data integrity
      const alefMastery = newTracker.getLetterMastery('alef');
      expect(alefMastery?.forms.isolated.correctAnswers).toBe(1);
      
      const behConfusions = newTracker.getConfusionPairs('beh');
      expect(behConfusions).toHaveLength(1);
      if (behConfusions.length > 0) {
        expect(behConfusions[0].letterId).toBe('peh');
      }
    });

    it('should handle empty tracker serialization', () => {
      const json = tracker.serializeToJSON();
      const newTracker = MasteryTracker.deserializeFromJSON(json);
      expect(newTracker.getAllMasteryData().size).toBe(0);
    });
  });

  describe('Edge cases', () => {
    it('should handle getting mastery for non-existent letter', () => {
      const mastery = tracker.getLetterMastery('nonexistent');
      expect(mastery).toBeUndefined();
    });

    it('should handle getting weakest form for non-existent letter', () => {
      const form = tracker.getWeakestForm('nonexistent');
      expect(form).toBeUndefined();
    });

    it('should handle division by zero in accuracy calculations', () => {
      // Create mastery without any attempts
      tracker.recordAttempt('test', 'isolated', true);
      const mastery = tracker.getLetterMastery('test')!;
      
      // Reset the form data to simulate no attempts
      mastery.forms.initial = {
        form: 'initial',
        exposures: 0,
        correctAnswers: 0,
        recentAccuracy: [],
        lastSeen: new Date()
      };

      // This should not throw
      const weakest = tracker.getWeakestForm('test');
      expect(weakest).toBeDefined();
    });
  });
});