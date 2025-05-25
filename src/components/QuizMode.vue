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
          <span class="stat-value">{{ currentQuestionIndex + 1 }}/{{ totalQuestions }}</span>
        </div>
      </div>
      <button @click="$emit('close')" class="close-button">✕</button>
    </div>

    <div v-if="!quizComplete" class="quiz-content">
      <transition name="fade" mode="out-in">
        <div v-if="currentQuestion" :key="currentQuestionIndex" class="question-card">
          <h3 class="question-type">{{ getQuestionTypeLabel(currentQuestion.type) }}</h3>
          
          <!-- Letter Recognition Quiz -->
          <div v-if="currentQuestion.type === 'letterRecognition'" class="question">
            <div class="letter-display-large">{{ currentQuestion.letter.isolated }}</div>
            <p class="question-text">What letter is this?</p>
          </div>

          <!-- Name to Letter Quiz -->
          <div v-else-if="currentQuestion.type === 'nameToLetter'" class="question">
            <p class="question-text-large">Find the letter "{{ currentQuestion.letter.nameEn }}"</p>
            <p class="hint">{{ currentQuestion.letter.nameFa }}</p>
          </div>

          <!-- Form Recognition Quiz -->
          <div v-else-if="currentQuestion.type === 'formRecognition'" class="question">
            <div class="letter-display-large">{{ getLetterForm(currentQuestion.letter, currentQuestion.form!) }}</div>
            <p class="question-text">What form is this letter in?</p>
            <p class="hint">Letter: {{ currentQuestion.letter.nameEn }}</p>
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
        <button @click="startNewQuiz" class="primary-button">New Quiz</button>
        <button @click="$emit('close')" class="secondary-button">Back to Study</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { persianLetters, type PersianLetter } from '../data/persianLetters';

defineEmits<{
  close: []
}>();

type QuizType = 'letterRecognition' | 'nameToLetter' | 'formRecognition';
type LetterForm = 'isolated' | 'initial' | 'medial' | 'final';

interface Question {
  type: QuizType;
  letter: PersianLetter;
  form?: LetterForm;
  options: string[];
  correctAnswer: string;
}

const totalQuestions = 10;
const currentQuestionIndex = ref(0);
const questions = ref<Question[]>([]);
const selectedAnswer = ref<string | null>(null);
const answered = ref(false);
const isCorrect = ref(false);
const score = ref(0);
const streak = ref(0);
const maxStreak = ref(0);
const correctAnswers = ref(0);
const quizComplete = ref(false);
const autoProgressTimeout = ref<number | null>(null);

const currentQuestion = computed(() => questions.value[currentQuestionIndex.value]);

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

function getSuccessMessage() {
  return successMessages[Math.floor(Math.random() * successMessages.length)];
}

function getQuestionTypeLabel(type: QuizType): string {
  switch (type) {
    case 'letterRecognition': return 'Letter Recognition';
    case 'nameToLetter': return 'Find the Letter';
    case 'formRecognition': return 'Form Recognition';
  }
}

function getLetterForm(letter: PersianLetter, form: LetterForm): string {
  return letter[form];
}

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

function generateQuestion(): Question {
  const quizTypes: QuizType[] = ['letterRecognition', 'nameToLetter', 'formRecognition'];
  const type = quizTypes[Math.floor(Math.random() * quizTypes.length)];
  const letter = persianLetters[Math.floor(Math.random() * persianLetters.length)];

  switch (type) {
    case 'letterRecognition': {
      const options = [letter.nameEn];
      while (options.length < 4) {
        const randomLetter = persianLetters[Math.floor(Math.random() * persianLetters.length)];
        if (!options.includes(randomLetter.nameEn)) {
          options.push(randomLetter.nameEn);
        }
      }
      return {
        type,
        letter,
        options: shuffleArray(options),
        correctAnswer: letter.nameEn
      };
    }

    case 'nameToLetter': {
      const options = [letter.isolated];
      while (options.length < 4) {
        const randomLetter = persianLetters[Math.floor(Math.random() * persianLetters.length)];
        if (!options.includes(randomLetter.isolated)) {
          options.push(randomLetter.isolated);
        }
      }
      return {
        type,
        letter,
        options: shuffleArray(options),
        correctAnswer: letter.isolated
      };
    }

    case 'formRecognition': {
      const forms: LetterForm[] = ['isolated', 'initial', 'medial', 'final'];
      const form = forms[Math.floor(Math.random() * forms.length)];
      return {
        type,
        letter,
        form,
        options: ['Isolated', 'Initial', 'Medial', 'Final'],
        correctAnswer: form.charAt(0).toUpperCase() + form.slice(1)
      };
    }
  }
}

function generateQuiz() {
  questions.value = [];
  for (let i = 0; i < totalQuestions; i++) {
    questions.value.push(generateQuestion());
  }
}

function selectAnswer(answer: string, index?: number) {
  if (answered.value) return;
  
  selectedAnswer.value = answer;
  answered.value = true;
  isCorrect.value = answer === currentQuestion.value.correctAnswer;
  
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
  
  // Save progress to localStorage
  const progress = JSON.parse(localStorage.getItem('quizProgress') || '{}');
  const letterId = currentQuestion.value.letter.id;
  if (!progress[letterId]) {
    progress[letterId] = { correct: 0, total: 0 };
  }
  progress[letterId].total++;
  if (isCorrect.value) {
    progress[letterId].correct++;
  }
  localStorage.setItem('quizProgress', JSON.stringify(progress));
}

function nextQuestion() {
  // Clear any existing timeout
  if (autoProgressTimeout.value) {
    clearTimeout(autoProgressTimeout.value);
    autoProgressTimeout.value = null;
  }
  
  if (currentQuestionIndex.value < totalQuestions - 1) {
    currentQuestionIndex.value++;
    selectedAnswer.value = null;
    answered.value = false;
    isCorrect.value = false;
  } else {
    quizComplete.value = true;
  }
}

function startNewQuiz() {
  currentQuestionIndex.value = 0;
  score.value = 0;
  streak.value = 0;
  maxStreak.value = 0;
  correctAnswers.value = 0;
  selectedAnswer.value = null;
  answered.value = false;
  isCorrect.value = false;
  quizComplete.value = false;
  generateQuiz();
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
  generateQuiz();
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
</style>