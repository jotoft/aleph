<script setup lang="ts">
import { ref } from 'vue';
import LetterDisplay from './components/LetterDisplay.vue';
import { persianLetters } from './data/persianLetters';

const currentView = ref<'study' | 'quiz'>('study');
const currentLetterIndex = ref(0);
const currentLetter = ref(persianLetters[currentLetterIndex.value]);

const nextLetter = () => {
  if (currentLetterIndex.value < persianLetters.length - 1) {
    currentLetterIndex.value++;
    currentLetter.value = persianLetters[currentLetterIndex.value];
  }
};

const previousLetter = () => {
  if (currentLetterIndex.value > 0) {
    currentLetterIndex.value--;
    currentLetter.value = persianLetters[currentLetterIndex.value];
  }
};

const selectLetter = (index: number) => {
  currentLetterIndex.value = index;
  currentLetter.value = persianLetters[index];
};
</script>

<template>
  <div class="app">
    <header class="app-header">
      <h1>Persian Alphabet Learning</h1>
      <nav class="main-nav">
        <button 
          @click="currentView = 'study'" 
          :class="{ active: currentView === 'study' }"
        >
          Study Mode
        </button>
        <button 
          @click="currentView = 'quiz'" 
          :class="{ active: currentView === 'quiz' }"
        >
          Practice Quiz
        </button>
      </nav>
    </header>

    <main class="app-main">
      <div v-if="currentView === 'study'" class="study-mode">
        <div class="letter-navigation">
          <button @click="previousLetter" :disabled="currentLetterIndex === 0">
            ← Previous
          </button>
          <span class="letter-counter">
            {{ currentLetterIndex + 1 }} / {{ persianLetters.length }}
          </span>
          <button @click="nextLetter" :disabled="currentLetterIndex === persianLetters.length - 1">
            Next →
          </button>
        </div>

        <LetterDisplay :letter="currentLetter" />

        <div class="letter-selector">
          <h3>Select a letter:</h3>
          <div class="letter-grid">
            <button 
              v-for="(letter, index) in persianLetters" 
              :key="letter.id"
              @click="selectLetter(index)"
              :class="{ active: index === currentLetterIndex }"
              class="letter-button"
            >
              {{ letter.isolated }}
            </button>
          </div>
        </div>
      </div>

      <div v-else class="quiz-mode">
        <p>Quiz mode coming soon!</p>
      </div>
    </main>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.app-header {
  background-color: #2c3e50;
  color: white;
  padding: 1.5rem;
  text-align: center;
}

.app-header h1 {
  margin: 0 0 1rem 0;
  font-size: 2rem;
}

.main-nav {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.main-nav button {
  padding: 0.5rem 1.5rem;
  border: none;
  background-color: #34495e;
  color: white;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.main-nav button:hover {
  background-color: #4a5f7a;
}

.main-nav button.active {
  background-color: #3498db;
}

.app-main {
  padding: 2rem;
}

.study-mode {
  max-width: 800px;
  margin: 0 auto;
}

.letter-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1rem;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.letter-navigation button {
  padding: 0.5rem 1rem;
  border: none;
  background-color: #3498db;
  color: white;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.letter-navigation button:hover:not(:disabled) {
  background-color: #2980b9;
}

.letter-navigation button:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}

.letter-counter {
  font-weight: bold;
  color: #2c3e50;
}

.letter-selector {
  margin-top: 2rem;
  padding: 2rem;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.letter-selector h3 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #2c3e50;
}

.letter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
  gap: 0.5rem;
}

.letter-button {
  padding: 0.75rem;
  font-size: 1.5rem;
  font-family: 'Vazir', 'Arial', sans-serif;
  border: 2px solid #e0e0e0;
  background-color: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.letter-button:hover {
  background-color: #f8f9fa;
  border-color: #3498db;
}

.letter-button.active {
  background-color: #3498db;
  color: white;
  border-color: #3498db;
}

.quiz-mode {
  text-align: center;
  padding: 3rem;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  max-width: 600px;
  margin: 0 auto;
}</style>