<template>
  <div class="word-quiz-container">
    <div class="quiz-header">
      <div class="quiz-stats">
        <div class="stat-item">
          <span class="stat-label">Score</span>
          <span class="stat-value">{{ score }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Streak</span>
          <span class="stat-value streak" :class="{ 'on-fire': streak >= 5 }">
            {{ streak }} {{ streak >= 5 ? '🔥' : '' }}
          </span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Words</span>
          <span class="stat-value">{{ activeWordIds.length }}</span>
        </div>
      </div>
      <div class="header-actions">
        <button @click="showSettings = !showSettings" class="mode-toggle" :class="{ active: showSettings }">
          ⚙️
        </button>
        <button @click="$emit('close')" class="close-button">✕</button>
      </div>
    </div>

    <!-- Settings Panel -->
    <div v-if="showSettings" class="settings-panel">
      <div class="setting-item">
        <label>Delay (ms)</label>
        <input type="number" v-model.number="progressDelay" @change="saveSettings" min="0" max="2000" step="50" />
      </div>
    </div>

    <div class="quiz-content">
      <div v-if="currentWord" class="question-card">
        <!-- Progress indicator -->
        <div class="progress-info">
          <span class="group-info">Group {{ currentGroupIndex + 1 }} of {{ wordProgressionGroups.length }}</span>
          <span class="mastery-info">{{ Math.round(averageMastery * 100) }}% mastery</span>
        </div>

        <!-- Word display -->
        <div class="word-display">
          <p class="word-persian" dir="rtl">{{ currentWord.persian }}</p>
          <p class="word-meaning">"{{ currentWord.meaning }}"</p>
        </div>

        <!-- Typing input -->
        <div class="typing-container">
          <input
            ref="typingInput"
            v-model="typedAnswer"
            @keydown.enter="handleEnter"
            type="text"
            class="typing-input"
            :class="{
              'correct': answered && isCorrect,
              'incorrect': answered && !isCorrect
            }"
            :disabled="answered && isCorrect"
            autocomplete="off"
            autocapitalize="off"
            placeholder="Type transliteration..."
          />

          <div v-if="answered" class="feedback">
            <p v-if="isCorrect" class="feedback-correct">Correct! ✓</p>
            <p v-else class="feedback-incorrect">
              {{ currentWord.transliteration }}
              <span class="hint">Press Enter to continue</span>
            </p>
          </div>
        </div>

        <!-- Word info after correct answer -->
        <transition name="fade">
          <div v-if="answered && isCorrect" class="word-info">
            <p class="transliteration">{{ currentWord.transliteration }}</p>
            <p v-if="currentWord.persianWithDiacritics && currentWord.persianWithDiacritics !== currentWord.persian"
               class="diacritics" dir="rtl">
              {{ currentWord.persianWithDiacritics }}
            </p>
          </div>
        </transition>
      </div>
    </div>

    <!-- Stats footer -->
    <div class="quiz-footer">
      <div class="session-stats">
        <span>Correct: {{ correctCount }}</span>
        <span>Total: {{ totalCount }}</span>
        <span>Accuracy: {{ totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0 }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { progressiveWords, wordProgressionGroups, getWordById, type ProgressiveWord } from '../data/progressiveWords';
import { WordMasteryTracker } from '../services/wordMasteryTracking';

defineEmits<{
  close: []
}>();

// State
const masteryTracker = ref(WordMasteryTracker.load());
const currentWord = ref<ProgressiveWord | null>(null);
const typedAnswer = ref('');
const answered = ref(false);
const isCorrect = ref(false);
const score = ref(0);
const streak = ref(0);
const correctCount = ref(0);
const totalCount = ref(0);
const typingInput = ref<HTMLInputElement | null>(null);
const questionStartTime = ref(0);
const autoProgressTimeout = ref<number | null>(null);

// Settings
const showSettings = ref(false);
const progressDelay = ref(parseInt(localStorage.getItem('wordQuizDelay') || '500'));

// Active words based on progression
const currentGroupIndex = ref(0);

const activeWordIds = computed(() => {
  const ids: string[] = [];
  for (let i = 0; i <= currentGroupIndex.value; i++) {
    if (wordProgressionGroups[i]) {
      ids.push(...wordProgressionGroups[i]);
    }
  }
  return ids;
});

const averageMastery = computed(() => {
  return masteryTracker.value.getAverageMastery(activeWordIds.value);
});

// Check if ready to unlock next group
function checkProgression() {
  if (currentGroupIndex.value >= wordProgressionGroups.length - 1) return;

  const currentGroupIds = wordProgressionGroups[currentGroupIndex.value];
  const stats = masteryTracker.value.getStats(currentGroupIds);

  // Require 70% of current group practiced with 60% avg mastery
  const practicedRatio = stats.practiced / stats.total;
  if (practicedRatio >= 0.7 && stats.avgMastery >= 0.6) {
    currentGroupIndex.value++;
    saveProgress();
  }
}

function selectNextWord() {
  // Get words needing practice from active words
  const candidates = masteryTracker.value.getWordsNeedingPractice(activeWordIds.value, 5);

  // Weight selection toward words needing more practice
  const weights = candidates.map((_, i) => Math.max(1, 5 - i));
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let random = Math.random() * totalWeight;

  for (let i = 0; i < candidates.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      const word = getWordById(candidates[i].wordId);
      if (word) {
        currentWord.value = word;
        return;
      }
    }
  }

  // Fallback to random word from active words
  const randomId = activeWordIds.value[Math.floor(Math.random() * activeWordIds.value.length)];
  currentWord.value = getWordById(randomId) || progressiveWords[0];
}

function handleEnter() {
  if (answered.value) {
    if (!isCorrect.value) {
      nextQuestion();
    }
    return;
  }
  submitAnswer();
}

function submitAnswer() {
  if (answered.value || !currentWord.value || !typedAnswer.value.trim()) return;

  const typed = normalizeTransliteration(typedAnswer.value.trim());
  const correct = normalizeTransliteration(currentWord.value.transliteration);

  answered.value = true;
  isCorrect.value = typed === correct;
  totalCount.value++;

  const responseTime = Date.now() - questionStartTime.value;
  masteryTracker.value.recordAttempt(currentWord.value.id, isCorrect.value, responseTime);
  masteryTracker.value.save();

  if (isCorrect.value) {
    score.value += 10 + Math.max(0, 5 - Math.floor(responseTime / 1000));
    streak.value++;
    correctCount.value++;
    checkProgression();

    // Auto-progress after delay
    autoProgressTimeout.value = window.setTimeout(() => {
      nextQuestion();
    }, progressDelay.value);
  } else {
    streak.value = 0;
  }
}

function normalizeTransliteration(text: string): string {
  return text
    .toLowerCase()
    .replace(/[āâ]/g, 'a')
    .replace(/[īî]/g, 'i')
    .replace(/[ūû]/g, 'u')
    .replace(/[ē]/g, 'e')
    .replace(/[ō]/g, 'o')
    .replace(/['ʿʾ`']/g, '')
    .replace(/[-\s]/g, '')
    // Handle doubled vowels as long vowels
    .replace(/aa/g, 'a')
    .replace(/ii/g, 'i')
    .replace(/uu/g, 'u')
    .replace(/ee/g, 'e')
    .replace(/oo/g, 'o')
    .trim();
}

function nextQuestion() {
  if (autoProgressTimeout.value) {
    clearTimeout(autoProgressTimeout.value);
    autoProgressTimeout.value = null;
  }

  typedAnswer.value = '';
  answered.value = false;
  isCorrect.value = false;
  questionStartTime.value = Date.now();

  selectNextWord();

  nextTick(() => {
    setTimeout(() => typingInput.value?.focus(), 100);
  });
}

function saveSettings() {
  localStorage.setItem('wordQuizDelay', progressDelay.value.toString());
}

function saveProgress() {
  localStorage.setItem('wordProgressionGroup', currentGroupIndex.value.toString());
}

function loadProgress() {
  const saved = localStorage.getItem('wordProgressionGroup');
  if (saved) {
    currentGroupIndex.value = parseInt(saved) || 0;
  }
}

onMounted(() => {
  loadProgress();
  nextQuestion();
});

onUnmounted(() => {
  if (autoProgressTimeout.value) {
    clearTimeout(autoProgressTimeout.value);
  }
});
</script>

<style scoped>
.word-quiz-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
}

.dark .word-quiz-container {
  background-color: #374151;
}

.quiz-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background-color: #f3f4f6;
  border-bottom: 1px solid #e5e7eb;
}

.dark .quiz-header {
  background-color: #1f2937;
  border-bottom-color: #4b5563;
}

.quiz-stats {
  display: flex;
  gap: 2rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-label {
  font-size: 0.75rem;
  color: #6b7280;
  text-transform: uppercase;
}

.dark .stat-label {
  color: #9ca3af;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: bold;
  color: #1f2937;
}

.dark .stat-value {
  color: #f3f4f6;
}

.stat-value.streak.on-fire {
  color: #ef4444;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.mode-toggle {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  background: none;
  border: 1px solid #d1d5db;
  color: #6b7280;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}

.mode-toggle.active {
  background-color: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.dark .mode-toggle {
  border-color: #4b5563;
  color: #9ca3af;
}

.close-button {
  padding: 0.5rem;
  font-size: 1.25rem;
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  border-radius: 4px;
}

.close-button:hover {
  background-color: #e5e7eb;
}

.dark .close-button:hover {
  background-color: #4b5563;
}

.settings-panel {
  display: flex;
  gap: 1.5rem;
  padding: 0.75rem 1.5rem;
  background-color: #e5e7eb;
  border-bottom: 1px solid #d1d5db;
}

.dark .settings-panel {
  background-color: #374151;
  border-bottom-color: #4b5563;
}

.setting-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.setting-item label {
  font-size: 0.8rem;
  color: #4b5563;
}

.dark .setting-item label {
  color: #9ca3af;
}

.setting-item input {
  width: 70px;
  padding: 0.25rem 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 0.85rem;
}

.dark .setting-item input {
  background-color: #4b5563;
  border-color: #6b7280;
  color: #f3f4f6;
}

.quiz-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.question-card {
  width: 100%;
  max-width: 500px;
  text-align: center;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  font-size: 0.85rem;
  color: #6b7280;
}

.dark .progress-info {
  color: #9ca3af;
}

.word-display {
  margin-bottom: 2rem;
}

.word-persian {
  font-size: 4rem;
  font-family: 'Vazir', 'Arial', sans-serif;
  margin: 0 0 0.5rem 0;
  color: #1f2937;
}

.dark .word-persian {
  color: #f3f4f6;
}

.word-meaning {
  font-size: 1.25rem;
  color: #6b7280;
  margin: 0;
}

.dark .word-meaning {
  color: #9ca3af;
}

.typing-container {
  margin-bottom: 1.5rem;
}

.typing-input {
  width: 100%;
  max-width: 300px;
  padding: 1rem 1.25rem;
  font-size: 1.25rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  text-align: center;
  outline: none;
  transition: all 0.2s;
}

.typing-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.typing-input.correct {
  border-color: #10b981;
  background-color: #ecfdf5;
}

.typing-input.incorrect {
  border-color: #ef4444;
  background-color: #fef2f2;
}

.dark .typing-input {
  background-color: #374151;
  border-color: #4b5563;
  color: #f3f4f6;
}

.dark .typing-input.correct {
  border-color: #10b981;
  background-color: #064e3b;
}

.dark .typing-input.incorrect {
  border-color: #ef4444;
  background-color: #7f1d1d;
}

.feedback {
  margin-top: 1rem;
}

.feedback-correct {
  color: #10b981;
  font-size: 1.25rem;
  font-weight: bold;
  margin: 0;
}

.feedback-incorrect {
  color: #ef4444;
  font-size: 1.25rem;
  margin: 0;
}

.feedback-incorrect .hint {
  display: block;
  font-size: 0.85rem;
  color: #6b7280;
  margin-top: 0.5rem;
}

.dark .feedback-incorrect .hint {
  color: #9ca3af;
}

.word-info {
  margin-top: 1rem;
}

.word-info .transliteration {
  font-size: 1.5rem;
  color: #10b981;
  margin: 0 0 0.5rem 0;
}

.word-info .diacritics {
  font-size: 2rem;
  font-family: 'Vazir', 'Arial', sans-serif;
  color: #6b7280;
  margin: 0;
}

.dark .word-info .diacritics {
  color: #9ca3af;
}

.quiz-footer {
  padding: 1rem 1.5rem;
  background-color: #f3f4f6;
  border-top: 1px solid #e5e7eb;
}

.dark .quiz-footer {
  background-color: #1f2937;
  border-top-color: #4b5563;
}

.session-stats {
  display: flex;
  justify-content: center;
  gap: 2rem;
  font-size: 0.9rem;
  color: #6b7280;
}

.dark .session-stats {
  color: #9ca3af;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
