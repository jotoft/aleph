<template>
  <div class="demo-container">
    <h2>Word Reading Feature Demo</h2>
    
    <div class="demo-controls">
      <label>
        Select Word:
        <select v-model="selectedWordId" @change="resetWord">
          <option v-for="word in demoWords" :key="word.id" :value="word.id">
            {{ word.meaning }} ({{ word.transliteration }})
          </option>
        </select>
      </label>
      
      <button @click="resetWord" class="reset-button">Reset Word</button>
    </div>

    <div class="demo-quiz">
      <div class="word-display">
        <p class="word-persian" dir="rtl" v-html="highlightedWord"></p>
        <div class="word-progress">
          <span v-for="(_, index) in currentWord?.persian || ''" :key="index"
                :class="{ 'completed': index < currentLetterIndex, 'current': index === currentLetterIndex }"
                class="progress-dot">●</span>
        </div>
        
        <transition name="fade">
          <div v-if="wordComplete" class="word-info">
            <p class="word-transliteration">{{ currentWord?.transliteration }}</p>
            <p class="word-meaning">"{{ currentWord?.meaning }}"</p>
          </div>
        </transition>
      </div>
      
      <p class="question-text">What is the highlighted letter?</p>
      <p class="hint">Letter {{ currentLetterIndex + 1 }} of {{ currentWord?.persian.length || 0 }}</p>
      
      <div class="answers-grid">
        <button v-for="(option, index) in options" 
                :key="index"
                @click="selectAnswer(option)"
                :disabled="answered"
                class="answer-button"
                :class="{
                  'correct': answered && option === correctAnswer,
                  'incorrect': answered && option === selectedAnswer && option !== correctAnswer,
                  'selected': option === selectedAnswer
                }">
          {{ option }}
        </button>
      </div>
      
      <div v-if="answered" class="feedback">
        <p v-if="isCorrect" class="correct-feedback">✓ Correct!</p>
        <p v-else class="incorrect-feedback">✗ Try again - The correct answer is {{ correctAnswer }}</p>
        <button @click="nextLetter" class="next-button">
          {{ isCorrect && !wordComplete ? 'Next Letter' : 'Next Word' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { progressiveWords } from '../data/progressiveWords';
import { persianLetters } from '../data/persianLetters';

// Demo words - just a few for testing
const demoWords = progressiveWords.slice(0, 10);
const selectedWordId = ref(demoWords[0].id);
const currentWord = computed(() => demoWords.find(w => w.id === selectedWordId.value));

const currentLetterIndex = ref(0);
const answered = ref(false);
const selectedAnswer = ref<string | null>(null);
const isCorrect = ref(false);
const wordComplete = ref(false);

const options = ref<string[]>([]);
const correctAnswer = ref('');

const highlightedWord = computed(() => {
  if (!currentWord.value) return '';
  
  const plainWord = currentWord.value.persian;
  const displayWord = currentWord.value.persianWithDiacritics || currentWord.value.persian;
  const letterIndex = currentLetterIndex.value;
  
  if (letterIndex >= plainWord.length) return displayWord;
  
  // If no diacritics, use simple highlighting
  if (!currentWord.value.persianWithDiacritics) {
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

function resetWord() {
  currentLetterIndex.value = 0;
  answered.value = false;
  selectedAnswer.value = null;
  isCorrect.value = false;
  wordComplete.value = false;
  generateOptions();
}

function generateOptions() {
  if (!currentWord.value) return;
  
  // Always use the plain persian word for letter matching, not the diacritics version
  const word = currentWord.value.persian;
  const currentChar = word[currentLetterIndex.value];
  
  // Find which letter this character is
  let currentLetter = null;
  for (const letter of persianLetters) {
    if ([letter.isolated, letter.initial, letter.medial, letter.final].includes(currentChar)) {
      currentLetter = letter;
      break;
    }
  }
  
  if (!currentLetter) {
    console.error('Could not find letter for character:', currentChar);
    return;
  }
  
  correctAnswer.value = currentLetter.nameEn;
  
  // Create options with distractors
  const optionsList = [currentLetter.nameEn];
  
  // Get random distractors
  const otherLetters = persianLetters
    .filter(l => l.id !== currentLetter.id && currentWord.value!.requiredLetters.includes(l.id))
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);
  
  optionsList.push(...otherLetters.map(l => l.nameEn));
  
  // If we don't have enough options, add more random letters
  while (optionsList.length < 4) {
    const randomLetter = persianLetters[Math.floor(Math.random() * persianLetters.length)];
    if (!optionsList.includes(randomLetter.nameEn)) {
      optionsList.push(randomLetter.nameEn);
    }
  }
  
  options.value = optionsList.sort(() => Math.random() - 0.5);
}

function selectAnswer(answer: string) {
  if (answered.value) return;
  
  selectedAnswer.value = answer;
  answered.value = true;
  isCorrect.value = answer === correctAnswer.value;
}

function nextLetter() {
  if (isCorrect.value && currentWord.value && currentLetterIndex.value < currentWord.value.persian.length - 1) {
    // Move to next letter
    currentLetterIndex.value++;
    answered.value = false;
    selectedAnswer.value = null;
    isCorrect.value = false;
    generateOptions();
  } else {
    // Word complete or incorrect - check if word is complete
    if (isCorrect.value && currentWord.value && currentLetterIndex.value === currentWord.value.persian.length - 1) {
      wordComplete.value = true;
    } else {
      // Reset for next word
      const currentIndex = demoWords.findIndex(w => w.id === selectedWordId.value);
      if (currentIndex < demoWords.length - 1) {
        selectedWordId.value = demoWords[currentIndex + 1].id;
      } else {
        selectedWordId.value = demoWords[0].id;
      }
      resetWord();
    }
  }
}

onMounted(() => {
  generateOptions();
});
</script>

<style scoped>
.demo-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

h2 {
  text-align: center;
  margin-bottom: 2rem;
  color: #1f2937;
}

.dark h2 {
  color: #f3f4f6;
}

.demo-controls {
  margin-bottom: 2rem;
  padding: 1rem;
  background: #f3f4f6;
  border-radius: 8px;
  display: flex;
  gap: 1rem;
  align-items: center;
  justify-content: center;
}

.dark .demo-controls {
  background: #374151;
}

.demo-controls label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #4b5563;
}

.dark .demo-controls label {
  color: #d1d5db;
}

.demo-controls select {
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #d1d5db;
  background: white;
}

.dark .demo-controls select {
  background: #1f2937;
  border-color: #4b5563;
  color: #f3f4f6;
}

.reset-button {
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.reset-button:hover {
  background: #2563eb;
}

.demo-quiz {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.dark .demo-quiz {
  background: #374151;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.word-display {
  text-align: center;
  margin-bottom: 2rem;
}

.word-persian {
  font-size: 3rem;
  font-family: 'Vazir', 'Iranian Sans', sans-serif;
  line-height: 1.5;
  margin-bottom: 1rem;
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

.word-info {
  margin-top: 1rem;
  padding: 1rem;
  background: #f3f4f6;
  border-radius: 8px;
}

.dark .word-info {
  background: #1f2937;
}

.word-transliteration {
  font-size: 1.25rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.dark .word-transliteration {
  color: #9ca3af;
}

.word-meaning {
  font-size: 1.125rem;
  color: #4b5563;
  font-style: italic;
}

.dark .word-meaning {
  color: #d1d5db;
}

.question-text {
  font-size: 1.25rem;
  text-align: center;
  margin-bottom: 0.5rem;
  color: #1f2937;
}

.dark .question-text {
  color: #f3f4f6;
}

.hint {
  text-align: center;
  color: #6b7280;
  margin-bottom: 1.5rem;
}

.dark .hint {
  color: #9ca3af;
}

.answers-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.answer-button {
  padding: 1rem;
  font-size: 1.125rem;
  border: 2px solid #e5e7eb;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.dark .answer-button {
  background: #1f2937;
  border-color: #4b5563;
  color: #f3f4f6;
}

.answer-button:hover:not(:disabled) {
  border-color: #3b82f6;
  transform: translateY(-2px);
}

.answer-button:disabled {
  cursor: not-allowed;
}

.answer-button.selected {
  border-color: #3b82f6;
}

.answer-button.correct {
  background: #10b981;
  color: white;
  border-color: #10b981;
}

.answer-button.incorrect {
  background: #ef4444;
  color: white;
  border-color: #ef4444;
}

.feedback {
  text-align: center;
}

.correct-feedback {
  color: #10b981;
  font-size: 1.25rem;
  margin-bottom: 1rem;
}

.incorrect-feedback {
  color: #ef4444;
  font-size: 1.125rem;
  margin-bottom: 1rem;
}

.next-button {
  padding: 0.75rem 2rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.125rem;
  cursor: pointer;
  transition: background 0.2s;
}

.next-button:hover {
  background: #2563eb;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

<style>
/* Global styles for highlighted letters */
.word-persian mark.highlighted-letter {
  background-color: transparent;
  color: #dc2626;
  padding: 0;
  margin: 0;
  font-weight: inherit;
  font-style: inherit;
  border: none;
  outline: none;
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
  display: inline;
  position: static;
  line-height: inherit;
}

.dark .word-persian mark.highlighted-letter {
  background-color: transparent;
  color: #fbbf24;
}
</style>