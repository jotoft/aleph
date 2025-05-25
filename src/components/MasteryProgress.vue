<template>
  <div class="mastery-progress">
    <h3>Your Progress</h3>
    <div class="letter-grid">
      <div 
        v-for="letterData in letterProgress" 
        :key="letterData.letter.id"
        class="letter-card"
        :class="{ 
          'mastered': letterData.masteryLevel === 3,
          'proficient': letterData.masteryLevel === 2,
          'familiar': letterData.masteryLevel === 1,
          'learning': letterData.masteryLevel === 0
        }"
      >
        <div class="letter-display">{{ letterData.letter.isolated }}</div>
        <div class="letter-name">{{ letterData.letter.nameEn }}</div>
        <div class="mastery-bar">
          <div 
            class="mastery-fill" 
            :style="{ width: `${letterData.overallMastery * 100}%` }"
          ></div>
        </div>
        <div class="form-indicators">
          <div 
            v-for="form in forms" 
            :key="form"
            class="form-dot"
            :class="{ 
              'high': getFormAccuracy(letterData.forms[form]) > 0.8,
              'medium': getFormAccuracy(letterData.forms[form]) > 0.5,
              'low': getFormAccuracy(letterData.forms[form]) <= 0.5,
              'untested': letterData.forms[form].exposures === 0
            }"
            :title="`${form}: ${Math.round(getFormAccuracy(letterData.forms[form]) * 100)}%`"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { persianLetters } from '../data/persianLetters';
import type { LetterMastery } from '../services/masteryTracking';

const props = defineProps<{
  masteryData: Map<string, LetterMastery>;
}>();

const forms = ['isolated', 'initial', 'medial', 'final'] as const;

const letterProgress = computed(() => {
  return persianLetters.map(letter => {
    const mastery = props.masteryData.get(letter.id);
    if (mastery) {
      return {
        letter,
        ...mastery
      };
    } else {
      // Create empty mastery data for display
      return {
        letter,
        masteryLevel: 0,
        overallMastery: 0,
        forms: {
          isolated: { exposures: 0, correctAnswers: 0, recentAccuracy: [] },
          initial: { exposures: 0, correctAnswers: 0, recentAccuracy: [] },
          medial: { exposures: 0, correctAnswers: 0, recentAccuracy: [] },
          final: { exposures: 0, correctAnswers: 0, recentAccuracy: [] }
        }
      };
    }
  });
});

function getFormAccuracy(form: any): number {
  if (!form || form.exposures === 0) return 0;
  return form.correctAnswers / form.exposures;
}
</script>

<style scoped>
.mastery-progress {
  padding: 1.5rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.dark .mastery-progress {
  background-color: #374151;
}

.mastery-progress h3 {
  margin: 0 0 1.5rem 0;
  text-align: center;
  color: #1f2937;
}

.dark .mastery-progress h3 {
  color: #f3f4f6;
}

.letter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 1rem;
}

.letter-card {
  padding: 0.75rem;
  background-color: #f3f4f6;
  border-radius: 8px;
  text-align: center;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.dark .letter-card {
  background-color: #1f2937;
}

.letter-card.mastered {
  border-color: #10b981;
  background-color: #d1fae5;
}

.dark .letter-card.mastered {
  background-color: #064e3b;
  border-color: #10b981;
}

.letter-card.proficient {
  border-color: #3b82f6;
  background-color: #dbeafe;
}

.dark .letter-card.proficient {
  background-color: #1e3a8a;
  border-color: #3b82f6;
}

.letter-card.familiar {
  border-color: #f59e0b;
  background-color: #fef3c7;
}

.dark .letter-card.familiar {
  background-color: #78350f;
  border-color: #f59e0b;
}

.letter-display {
  font-size: 2rem;
  font-family: 'Vazir', 'Arial', sans-serif;
  margin-bottom: 0.25rem;
  color: #1f2937;
}

.dark .letter-display {
  color: #f3f4f6;
}

.letter-name {
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.dark .letter-name {
  color: #9ca3af;
}

.mastery-bar {
  height: 4px;
  background-color: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.dark .mastery-bar {
  background-color: #4b5563;
}

.mastery-fill {
  height: 100%;
  background-color: #3b82f6;
  transition: width 0.3s;
}

.form-indicators {
  display: flex;
  justify-content: center;
  gap: 0.25rem;
}

.form-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #e5e7eb;
}

.form-dot.high {
  background-color: #10b981;
}

.form-dot.medium {
  background-color: #f59e0b;
}

.form-dot.low {
  background-color: #ef4444;
}

.form-dot.untested {
  background-color: #e5e7eb;
}

.dark .form-dot.untested {
  background-color: #4b5563;
}
</style>