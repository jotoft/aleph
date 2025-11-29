<template>
  <div class="quiz-container">
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
          <span class="stat-label">Question</span>
          <span class="stat-value">{{ currentQuestionIndex + 1 }}{{ isInfiniteMode ? '' : '/' + totalQuestions }}</span>
        </div>
      </div>
      <button @click="$emit('close')" class="close-button">✕</button>
    </div>

    <div v-if="!quizComplete" class="quiz-content">
      <transition name="fade" mode="out-in">
        <div v-if="currentQuestion" :key="currentQuestionIndex" class="question-card">
          <h3 class="question-type">{{ getQuestionTypeLabel(currentQuestion.type) }}</h3>
          
          <!-- Letter Recognition Quiz -->
          <div v-if="currentQuestion.type === 'letterRecognition' && currentQuestion.letter" class="question">
            <div class="letter-display-large">{{ getLetterForm(currentQuestion.letter, currentQuestion.form || 'isolated') }}</div>
            <p class="question-text">What letter is this?</p>
          </div>

          <!-- Name to Letter Quiz -->
          <div v-else-if="currentQuestion.type === 'nameToLetter' && currentQuestion.letter" class="question">
            <p class="question-text-large">Find the letter "{{ currentQuestion.letter.nameEn }}"</p>
          </div>

          <!-- Word Reading Quiz -->
          <div v-else-if="currentQuestion.type === 'wordReading'" class="question">
            <div class="word-display" v-if="currentQuestion.word">
              <p class="word-persian" dir="rtl" v-html="highlightedWordForReading"></p>
              <div class="word-progress" v-if="wordReadingLetters.length > 0">
                <span v-for="(_, index) in wordReadingLetters" :key="index"
                      :class="{ 'completed': index < currentWordProgress, 'current': index === currentWordProgress }"
                      class="progress-dot">●</span>
              </div>
              <transition name="fade">
                <div v-if="currentQuestion.isLastLetterInWord && answered && isCorrect" class="word-info">
                  <p class="word-transliteration">{{ currentQuestion.word.transliteration }}</p>
                  <p class="word-meaning">"{{ currentQuestion.word.meaning }}"</p>
                </div>
              </transition>
            </div>
            <p class="question-text">What is the highlighted letter?</p>
            <p class="hint" v-if="!answered">Letter {{ currentWordProgress + 1 }} of {{ wordReadingLetters.length }}</p>
          </div>

          <!-- Answer Options -->
          <div class="answers-grid" :class="{ 'letters-grid': currentQuestion.type === 'nameToLetter' }">
            <button 
              v-for="(option, index) in currentQuestion.options" 
              :key="index"
              @click="selectAnswer(option, index)"
              :disabled="answered"
              class="answer-button"
              :data-hotkey="index + 1"
              :class="{ 
                'correct': answered && option === currentQuestion.correctAnswer,
                'incorrect': answered && option === selectedAnswer && option !== currentQuestion.correctAnswer,
                'letter-option': currentQuestion.type === 'nameToLetter'
              }"
            >
              <div class="answer-content">
                <span class="hotkey-hint">{{ index + 1 }}</span>
                <span v-if="currentQuestion.type === 'nameToLetter'" class="letter-option-text">
                  {{ option }}
                </span>
                <span v-else>{{ option }}</span>
              </div>
            </button>
          </div>

          <!-- Feedback -->
          <transition name="slide-up">
            <div v-if="answered" class="feedback" :class="{ 'correct': isCorrect, 'incorrect': !isCorrect }">
              <p class="feedback-text">
                {{ isCorrect ? getSuccessMessage() : 'Not quite! The answer is ' + currentQuestion.correctAnswer }}
              </p>
              <button @click="nextQuestion" class="next-button">
                {{ currentQuestionIndex < totalQuestions - 1 ? 'Next Question' : 'See Results' }}
              </button>
            </div>
          </transition>
        </div>
      </transition>
    </div>

    <!-- Quiz Complete -->
    <div v-else class="quiz-complete">
      <h2>Quiz Complete! 🎉</h2>
      <div class="final-stats">
        <div class="stat-card">
          <h3>Final Score</h3>
          <p class="big-number">{{ score }}</p>
        </div>
        <div class="stat-card">
          <h3>Accuracy</h3>
          <p class="big-number">{{ Math.round((correctAnswers / totalQuestions) * 100) }}%</p>
        </div>
        <div class="stat-card">
          <h3>Best Streak</h3>
          <p class="big-number">{{ maxStreak }}</p>
        </div>
      </div>
      <div class="action-buttons">
        <button @click="startNewQuiz(false)" class="primary-button">New Quiz (10 Questions)</button>
        <button @click="startNewQuiz(true)" class="primary-button">Infinite Mode</button>
        <button @click="$emit('close')" class="secondary-button">Back to Study</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { persianLetters, type PersianLetter } from '../data/persianLetters';
import { MasteryTracker } from '../services/masteryTracking';
import { AdaptiveQuestionGenerator } from '../services/adaptiveQuestionGenerator';
import type { Question } from '../services/adaptiveQuestionGenerator';

const props = defineProps<{
  startInfinite?: boolean
}>();

defineEmits<{
  close: []
}>();

// Initialize mastery tracking
const masteryTracker = new MasteryTracker();
const questionGenerator = ref(new AdaptiveQuestionGenerator(masteryTracker));

// Load saved mastery data
const loadMasteryData = () => {
  const saved = localStorage.getItem('masteryData');
  if (saved) {
    try {
      const loadedTracker = MasteryTracker.deserializeFromJSON(saved);
      // Copy the data to our existing tracker
      Object.assign(masteryTracker, loadedTracker);
      questionGenerator.value = new AdaptiveQuestionGenerator(masteryTracker);
    } catch (e) {
      console.error('Failed to load mastery data:', e);
    }
  }
  
  // Also load word progression data
  const wordData = localStorage.getItem('wordProgressionData');
  if (wordData && questionGenerator.value) {
    try {
      questionGenerator.value.wordProgressionService.deserialize(wordData);
    } catch (e) {
      console.error('Failed to load word progression data:', e);
    }
  }
};

// Save mastery data
const saveMasteryData = () => {
  localStorage.setItem('masteryData', masteryTracker.serializeToJSON());
  
  // Also save word progression data
  if (questionGenerator.value) {
    localStorage.setItem('wordProgressionData', 
      questionGenerator.value.wordProgressionService.serialize());
  }
};

const isInfiniteMode = ref(false);
const totalQuestions = computed(() => isInfiniteMode.value ? Infinity : 10);
const currentQuestionIndex = ref(0);
const currentQuestion = ref<Question | null>(null);
const selectedAnswer = ref<string | null>(null);
const answered = ref(false);
const isCorrect = ref(false);
const score = ref(0);
const streak = ref(0);
const maxStreak = ref(0);
const correctAnswers = ref(0);
const quizComplete = ref(false);
const autoProgressTimeout = ref<number | null>(null);
const confusedWith = ref<{ letterId: string; form?: string } | null>(null);

// Word reading state
const currentWordId = ref<string | null>(null);
const currentWordProgress = ref<number>(0); // Which letter we're on
const wordReadingLetters = ref<PersianLetter[]>([]);

const successMessages = [
  'Excellent! 🌟',
  'Great job! 👏',
  'Perfect! ✨',
  'Awesome! 🎯',
  'Brilliant! 💫',
  'Fantastic! 🌈',
  'Outstanding! 🏆',
  'Superb! ⭐'
];


const highlightedWordForReading = computed(() => {
  if (!currentQuestion.value ||
      currentQuestion.value.type !== 'wordReading' ||
      !currentQuestion.value.word ||
      currentQuestion.value.currentLetterIndex === undefined ||
      currentQuestion.value.currentLetterIndex < 0) {
    return currentQuestion.value?.word?.persian || '';
  }

  const plainWord = currentQuestion.value.word.persian;
  const displayWord = currentQuestion.value.word.persianWithDiacritics || currentQuestion.value.word.persian;
  const letterIndex = currentQuestion.value.currentLetterIndex;

  if (letterIndex >= plainWord.length) return displayWord;

  // If no diacritics, use simple highlighting
  if (!currentQuestion.value.word.persianWithDiacritics) {
    const before = displayWord.substring(0, letterIndex);
    const letter = displayWord.substring(letterIndex, letterIndex + 1);
    const after = displayWord.substring(letterIndex + 1);
    return `${before}<mark class="highlighted-letter">${letter}</mark>${after}`;
  }

  // Map plain text position to diacritics position
  let plainPos = 0;
  let diacriticsPos = 0;

  // Arabic diacritical marks Unicode ranges
  const isDiacritic = (char: string) => {
    const code = char.charCodeAt(0);
    return (code >= 0x064B && code <= 0x065F) || // Arabic diacritics
           (code >= 0x0670 && code <= 0x0670) || // Arabic letter superscript alef
           (code >= 0x06D6 && code <= 0x06DC) || // Arabic small high ligatures
           (code >= 0x06DF && code <= 0x06E4) || // Arabic small high letters
           (code >= 0x06E7 && code <= 0x06E8) || // Arabic small high yeh/noon
           (code >= 0x06EA && code <= 0x06ED);   // Arabic small low letters
  };

  // Find the position in the diacritics string that corresponds to our letter index
  while (plainPos < letterIndex && diacriticsPos < displayWord.length) {
    if (!isDiacritic(displayWord[diacriticsPos])) {
      plainPos++;
    }
    diacriticsPos++;
  }

  // Skip any diacritics at current position - they belong to the previous letter
  while (diacriticsPos < displayWord.length && isDiacritic(displayWord[diacriticsPos])) {
    diacriticsPos++;
  }

  // Find the end of the current letter (including any diacritics)
  let endPos = diacriticsPos + 1;
  while (endPos < displayWord.length && isDiacritic(displayWord[endPos])) {
    endPos++;
  }

  const before = displayWord.substring(0, diacriticsPos);
  const letter = displayWord.substring(diacriticsPos, endPos);
  const after = displayWord.substring(endPos);

  return `${before}<mark class="highlighted-letter">${letter}</mark>${after}`;
});

function getSuccessMessage() {
  return successMessages[Math.floor(Math.random() * successMessages.length)];
}

function getQuestionTypeLabel(type: string): string {
  switch (type) {
    case 'letterRecognition': return 'Letter Recognition';
    case 'nameToLetter': return 'Find the Letter';
    case 'wordReading': return 'Word Reading';
    default: return 'Question';
  }
}

function getLetterForm(letter: PersianLetter, form: string): string {
  return letter[form as keyof PersianLetter] as string;
}

function generateNextQuestion() {
  const question = questionGenerator.value.generateQuestion();
  currentQuestion.value = question;
  
  // If it's a new word reading question, initialize the word state
  if (question.type === 'wordReading' && question.wordId && question.wordLetters) {
    currentWordId.value = question.wordId;
    currentWordProgress.value = 0;
    wordReadingLetters.value = question.wordLetters;
  }
}

function generateNextLetterInWord() {
  if (!currentQuestion.value || !currentWordId.value) return;
  
  // Create a new question for the next letter in the word
  const word = currentQuestion.value.word;
  const wordId = currentWordId.value;
  const wordLetters = wordReadingLetters.value;
  
  if (!word || currentWordProgress.value >= wordLetters.length) {
    // Fallback to regular next question
    nextQuestion();
    return;
  }
  
  // Find the letter at current position
  const currentLetter = wordLetters[currentWordProgress.value];
  if (!currentLetter) {
    nextQuestion();
    return;
  }
  
  // Create distractors
  const options = [currentLetter.nameEn];
  const enabledLetters = persianLetters.filter(l => 
    questionGenerator.value.getActiveLetters().includes(l.id) && l.id !== currentLetter.id
  );
  
  // Get random distractors
  const shuffled = [...enabledLetters].sort(() => Math.random() - 0.5);
  const distractors = shuffled.slice(0, 3).map(l => l.nameEn);
  options.push(...distractors);
  
  // Create the question for the current letter
  currentQuestion.value = {
    type: 'wordReading',
    letter: currentLetter,
    options: options.sort(() => Math.random() - 0.5),
    correctAnswer: currentLetter.nameEn,
    word: word,
    wordId: wordId,
    currentLetterIndex: currentWordProgress.value,
    wordLetters: wordLetters,
    isLastLetterInWord: currentWordProgress.value === wordLetters.length - 1
  };
}

function selectAnswer(answer: string, _index?: number) {
  if (answered.value || !currentQuestion.value) return;
  
  selectedAnswer.value = answer;
  answered.value = true;
  isCorrect.value = answer === currentQuestion.value.correctAnswer;
  
  // Remove focus from the button to prevent it staying highlighted
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
  
  // Find which letter was confused with (for incorrect answers)
  if (!isCorrect.value && currentQuestion.value.type === 'nameToLetter') {
    const confusedLetter = persianLetters.find(l => 
      l[currentQuestion.value!.form || 'isolated'] === answer
    );
    if (confusedLetter) {
      confusedWith.value = { letterId: confusedLetter.id, form: currentQuestion.value.form };
    }
  } else if (!isCorrect.value && currentQuestion.value.type === 'letterRecognition') {
    const confusedLetter = persianLetters.find(l => l.nameEn === answer);
    if (confusedLetter) {
      confusedWith.value = { letterId: confusedLetter.id };
    }
  }
  
  if (isCorrect.value) {
    score.value += 10;
    streak.value++;
    correctAnswers.value++;
    if (streak.value > maxStreak.value) {
      maxStreak.value = streak.value;
    }
    // Auto-progress after shorter delay for correct answers
    autoProgressTimeout.value = window.setTimeout(() => {
      nextQuestion();
    }, 1500);
  } else {
    streak.value = 0;
  }
  
  // Record attempt in mastery tracker
  if (currentQuestion.value.type === 'wordReading' && currentQuestion.value.wordId) {
    // Track word mastery
    const responseTime = Date.now() - (answered.value ? Date.now() - 1000 : Date.now()); // Simple approximation
    questionGenerator.value.wordProgressionService.updateWordMastery(
      currentQuestion.value.wordId,
      isCorrect.value,
      responseTime,
      confusedWith.value?.letterId
    );
  }
  
  // Always track letter mastery if we have a letter
  if (currentQuestion.value.letter) {
    const context = currentQuestion.value.word ? 'inWord' : 'standalone';
    masteryTracker.recordAttempt(
      currentQuestion.value.letter.id,
      currentQuestion.value.form || 'isolated',
      isCorrect.value,
      context,
      confusedWith.value?.letterId,
      confusedWith.value?.form as any
    );
  }
  
  // Save mastery data
  saveMasteryData();
  
  // Check for new letter suggestions
  if ((currentQuestionIndex.value + 1) % 10 === 0) {
    const suggestions = questionGenerator.value.suggestNewLetters();
    if (suggestions.length > 0) {
      // TODO: Show notification about new letters available
      console.log('New letters suggested:', suggestions);
    }
  }
}

function nextQuestion() {
  // Clear any existing timeout
  if (autoProgressTimeout.value) {
    clearTimeout(autoProgressTimeout.value);
    autoProgressTimeout.value = null;
  }
  
  confusedWith.value = null;
  
  // For word reading, check if we need to continue with the same word
  if (currentQuestion.value?.type === 'wordReading' && 
      isCorrect.value && 
      !currentQuestion.value.isLastLetterInWord &&
      currentQuestion.value.wordId) {
    // Continue with the next letter in the same word
    currentWordProgress.value++;
    selectedAnswer.value = null;
    answered.value = false;
    isCorrect.value = false;
    
    // Generate next letter question for the same word
    generateNextLetterInWord();
    return;
  }
  
  // If word reading failed, skip to next question
  if (currentQuestion.value?.type === 'wordReading' && !isCorrect.value) {
    // User got a letter wrong, move to next question
    currentWordId.value = null;
    currentWordProgress.value = 0;
    wordReadingLetters.value = [];
  }
  
  // Reset word reading state when moving to a new question
  currentWordId.value = null;
  currentWordProgress.value = 0;
  wordReadingLetters.value = [];
  
  if (!isInfiniteMode.value && currentQuestionIndex.value >= totalQuestions.value - 1) {
    quizComplete.value = true;
  } else {
    currentQuestionIndex.value++;
    selectedAnswer.value = null;
    answered.value = false;
    isCorrect.value = false;
    generateNextQuestion();
  }
}

function startNewQuiz(infinite = false) {
  isInfiniteMode.value = infinite;
  currentQuestionIndex.value = 0;
  score.value = 0;
  streak.value = 0;
  maxStreak.value = 0;
  correctAnswers.value = 0;
  selectedAnswer.value = null;
  answered.value = false;
  isCorrect.value = false;
  quizComplete.value = false;
  confusedWith.value = null;
  generateNextQuestion();
}

function handleKeyPress(event: KeyboardEvent) {
  if (!currentQuestion.value) return;
  
  const key = event.key;
  const numKey = parseInt(key);
  
  // Handle Enter or Space for next question when answered
  if ((key === 'Enter' || key === ' ') && answered.value) {
    event.preventDefault();
    nextQuestion();
  }
  // Handle number keys 1-4 when not answered
  else if (!answered.value && numKey >= 1 && numKey <= currentQuestion.value.options.length) {
    const optionIndex = numKey - 1;
    selectAnswer(currentQuestion.value.options[optionIndex], optionIndex);
  }
}

onMounted(() => {
  loadMasteryData();
  if (props.startInfinite) {
    startNewQuiz(true);
  } else {
    generateNextQuestion();
  }
  window.addEventListener('keydown', handleKeyPress);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyPress);
  if (autoProgressTimeout.value) {
    clearTimeout(autoProgressTimeout.value);
  }
});
</script>

<style scoped>
.quiz-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
}

.dark .quiz-container {
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
  letter-spacing: 0.05em;
}

.dark .stat-label {
  color: #9ca3af;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #1f2937;
}

.dark .stat-value {
  color: #f3f4f6;
}

.stat-value.streak.on-fire {
  color: #ef4444;
}

.close-button {
  padding: 0.5rem;
  font-size: 1.25rem;
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}

.close-button:hover {
  background-color: #e5e7eb;
  color: #1f2937;
}

.dark .close-button:hover {
  background-color: #4b5563;
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
  max-width: 600px;
  width: 100%;
  text-align: center;
}

.question-type {
  font-size: 0.875rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 1.5rem;
}

.dark .question-type {
  color: #9ca3af;
}

.question {
  margin-bottom: 2rem;
}

.letter-display-large {
  font-size: 6rem;
  font-family: 'Vazir', 'Arial', sans-serif;
  color: #1f2937;
  margin-bottom: 1rem;
  line-height: 1;
}

.dark .letter-display-large {
  color: #f3f4f6;
}

.question-text {
  font-size: 1.25rem;
  color: #4b5563;
  margin: 0;
}

.question-text-large {
  font-size: 1.5rem;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
  font-weight: 500;
}

.dark .question-text,
.dark .question-text-large {
  color: #e5e7eb;
}

.hint {
  font-size: 0.875rem;
  color: #9ca3af;
  margin: 0;
}

.word-display {
  margin: 1.5rem 0;
  padding: 1.5rem;
  background-color: #f3f4f6;
  border-radius: 8px;
}

.dark .word-display {
  background-color: #1f2937;
}

.word-display .word-persian {
  font-size: 2.5rem;
  font-family: 'Vazir', 'Arial', sans-serif;
  margin: 0 0 0.5rem 0;
  direction: rtl;
}

/* Mark highlighting styles moved to global style block below */

.word-info {
  margin-top: 0.5rem;
}

.word-display .word-transliteration {
  font-size: 1rem;
  color: #6b7280;
  margin: 0 0 0.25rem 0;
}

.dark .word-display .word-transliteration {
  color: #9ca3af;
}

.word-display .word-meaning {
  font-size: 1rem;
  color: #3b82f6;
  margin: 0;
  font-style: italic;
}

.dark .word-display .word-meaning {
  color: #60a5fa;
}

.answers-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.answers-grid.letters-grid {
  grid-template-columns: repeat(4, 1fr);
}

.answer-button {
  padding: 1rem;
  border: 2px solid #e5e7eb;
  background-color: white;
  border-radius: 8px;
  font-size: 1.125rem;
  cursor: pointer;
  transition: all 0.2s;
  color: #1f2937;
  position: relative;
}

.dark .answer-button {
  border-color: #4b5563;
  background-color: #374151;
  color: #f3f4f6;
}

.answer-button:hover:not(:disabled) {
  border-color: #3b82f6;
  background-color: #eff6ff;
}

.answer-button:focus {
  outline: none;
}

.answer-button:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

.dark .answer-button:hover:not(:disabled) {
  border-color: #3b82f6;
  background-color: #1e293b;
}

.answer-button:disabled {
  cursor: not-allowed;
}

.answer-button.correct {
  background-color: #10b981;
  border-color: #10b981;
  color: white;
}

.answer-button.incorrect {
  background-color: #ef4444;
  border-color: #ef4444;
  color: white;
}

.answer-button.letter-option {
  padding: 0.5rem;
}

.answer-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.hotkey-hint {
  position: absolute;
  top: 0.25rem;
  left: 0.25rem;
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #e5e7eb;
  color: #6b7280;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: bold;
}

.dark .hotkey-hint {
  background-color: #4b5563;
  color: #d1d5db;
}

.answer-button:hover .hotkey-hint {
  background-color: #3b82f6;
  color: white;
}

.letter-option-text {
  font-size: 2.5rem;
  font-family: 'Vazir', 'Arial', sans-serif;
  line-height: 1;
}

.feedback {
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.feedback.correct {
  background-color: #d1fae5;
  border: 1px solid #10b981;
}

.feedback.incorrect {
  background-color: #fee2e2;
  border: 1px solid #ef4444;
}

.dark .feedback.correct {
  background-color: #064e3b;
  border-color: #10b981;
}

.dark .feedback.incorrect {
  background-color: #7f1d1d;
  border-color: #ef4444;
}

.feedback-text {
  margin: 0 0 0.75rem 0;
  font-weight: 500;
  color: #1f2937;
}

.dark .feedback-text {
  color: #f3f4f6;
}

.next-button {
  padding: 0.5rem 1.5rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;
}

.next-button:hover {
  background-color: #2563eb;
}

.quiz-complete {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
}

.quiz-complete h2 {
  font-size: 2rem;
  margin-bottom: 2rem;
  color: #1f2937;
}

.dark .quiz-complete h2 {
  color: #f3f4f6;
}

.final-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  padding: 1.5rem;
  background-color: #f3f4f6;
  border-radius: 8px;
}

.dark .stat-card {
  background-color: #1f2937;
}

.stat-card h3 {
  margin: 0 0 0.5rem 0;
  font-size: 0.875rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.dark .stat-card h3 {
  color: #9ca3af;
}

.big-number {
  margin: 0;
  font-size: 2.5rem;
  font-weight: bold;
  color: #1f2937;
}

.dark .big-number {
  color: #f3f4f6;
}

.action-buttons {
  display: flex;
  gap: 1rem;
}

.primary-button,
.secondary-button {
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.primary-button {
  background-color: #3b82f6;
  color: white;
}

.primary-button:hover {
  background-color: #2563eb;
}

.secondary-button {
  background-color: #e5e7eb;
  color: #4b5563;
}

.secondary-button:hover {
  background-color: #d1d5db;
}

.dark .secondary-button {
  background-color: #4b5563;
  color: #e5e7eb;
}

.dark .secondary-button:hover {
  background-color: #6b7280;
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

.slide-up-enter-active {
  transition: all 0.3s ease-out;
}

.slide-up-enter-from {
  transform: translateY(20px);
  opacity: 0;
}

.word-progress {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 12px;
}

.progress-dot {
  font-size: 12px;
  color: #9ca3af;
  transition: color 0.3s;
}

.progress-dot.completed {
  color: #10b981;
}

.progress-dot.current {
  color: #3b82f6;
  font-size: 16px;
}

.dark .progress-dot {
  color: #4b5563;
}

.dark .progress-dot.completed {
  color: #10b981;
}

.dark .progress-dot.current {
  color: #60a5fa;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .quiz-header {
    padding: 0.75rem 1rem;
  }

  .quiz-stats {
    gap: 1rem;
  }

  .stat-label {
    font-size: 0.65rem;
  }

  .stat-value {
    font-size: 1.2rem;
  }

  .quiz-content {
    padding: 1rem;
  }

  .question-type {
    font-size: 0.75rem;
    margin-bottom: 1rem;
  }

  .letter-display-large {
    font-size: 4rem;
    margin-bottom: 0.75rem;
  }

  .question-text {
    font-size: 1rem;
  }

  .question-text-large {
    font-size: 1.25rem;
  }

  .word-display {
    margin: 1rem 0;
    padding: 1rem;
  }

  .word-display .word-persian {
    font-size: 2rem;
  }

  .word-display .word-transliteration,
  .word-display .word-meaning {
    font-size: 0.9rem;
  }

  /* Change letter grid to 2x2 on mobile */
  .answers-grid.letters-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .answer-button {
    padding: 0.75rem;
    font-size: 1rem;
  }

  .answer-button.letter-option {
    padding: 0.5rem;
  }

  .letter-option-text {
    font-size: 2rem;
  }

  .hotkey-hint {
    width: 1.25rem;
    height: 1.25rem;
    font-size: 0.65rem;
  }

  .feedback {
    padding: 0.75rem;
  }

  .feedback-text {
    font-size: 0.9rem;
  }

  .next-button {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }

  /* Quiz complete screen */
  .quiz-complete h2 {
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .final-stats {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .stat-card {
    padding: 1rem;
  }

  .stat-card h3 {
    font-size: 0.75rem;
  }

  .big-number {
    font-size: 2rem;
  }

  .action-buttons {
    flex-direction: column;
    width: 100%;
    gap: 0.75rem;
  }

  .primary-button,
  .secondary-button {
    padding: 0.75rem 1.5rem;
    font-size: 0.9rem;
    width: 100%;
  }
}
</style>

<style>
/* Global styles for dynamically generated mark elements */
.word-persian mark.highlighted-letter {
  background-color: transparent;
  color: #dc2626;
  /* Reset any default mark styles */
  padding: 0;
  margin: 0;
  font-weight: inherit;
  font-style: inherit;
  border: none;
  outline: none;
  /* Mobile-specific fixes */
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
  display: inline;
  position: static;
  line-height: inherit;
}

.dark .word-persian mark.highlighted-letter {
  background-color: transparent;
  color: #fbbf24;
  /* Reset any default mark styles */
  padding: 0;
  margin: 0;
  font-weight: inherit;
  font-style: inherit;
  border: none;
  outline: none;
  /* Mobile-specific fixes */
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
  display: inline;
  position: static;
  line-height: inherit;
}
</style>