<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import LetterDisplay from './components/LetterDisplay.vue';
import QuizMode from './components/QuizMode.vue';
import MasteryProgress from './components/MasteryProgress.vue';
import { persianLetters } from './data/persianLetters';
import { MasteryTracker } from './services/masteryTracking';

const currentView = ref<'study' | 'quiz' | 'progress'>('study');
const currentLetterIndex = ref(0);
const currentLetter = ref(persianLetters[currentLetterIndex.value]);
const isDarkMode = ref(false);
const masteryData = ref<Map<string, any>>(new Map());

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

const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value;
  localStorage.setItem('darkMode', isDarkMode.value.toString());
};

const loadMasteryData = () => {
  const saved = localStorage.getItem('masteryData');
  if (saved) {
    try {
      const tracker = MasteryTracker.deserializeFromJSON(saved);
      masteryData.value = tracker.getAllMasteryData();
    } catch (e) {
      console.error('Failed to load mastery data:', e);
    }
  }
};


onMounted(() => {
  const savedDarkMode = localStorage.getItem('darkMode');
  if (savedDarkMode === 'true') {
    isDarkMode.value = true;
  }
  loadMasteryData();
  
  // Refresh mastery data when returning from quiz
  window.addEventListener('focus', loadMasteryData);
});

onUnmounted(() => {
  window.removeEventListener('focus', loadMasteryData);
});
</script>

<template>
  <div class="app" :class="{ 'dark': isDarkMode }">
    <header class="app-header">
      <div class="header-top">
        <h1>Persian Alphabet Learning</h1>
        <button @click="toggleDarkMode" class="dark-mode-toggle" :title="isDarkMode ? 'Light mode' : 'Dark mode'">
          {{ isDarkMode ? '☀️' : '🌙' }}
        </button>
      </div>
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
        <button 
          @click="() => { currentView = 'progress'; loadMasteryData(); }" 
          :class="{ active: currentView === 'progress' }"
        >
          Progress
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

      <div v-else-if="currentView === 'quiz'" class="quiz-mode">
        <QuizMode @close="currentView = 'study'" />
      </div>
      
      <div v-else-if="currentView === 'progress'" class="progress-view">
        <MasteryProgress :mastery-data="masteryData" />
      </div>
    </main>
    
    <footer class="app-footer">
      <p>
        Made with ❤️ by <a href="https://github.com/jotoft" target="_blank" rel="noopener">Johan Toft</a> · 
        <a href="https://github.com/jotoft/aleph" target="_blank" rel="noopener">GitHub</a> · 
        <a href="https://github.com/jotoft/aleph/blob/master/LICENSE" target="_blank" rel="noopener">MIT License</a>
      </p>
    </footer>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  background-color: #f5f5f5;
  transition: background-color 0.3s;
  display: flex;
  flex-direction: column;
}

.app.dark {
  background-color: #1a1a1a;
}

.app-header {
  background-color: #2c3e50;
  color: white;
  padding: 1rem;
  text-align: center;
  transition: background-color 0.3s;
  flex-shrink: 0;
}

.app.dark .app-header {
  background-color: #1f2937;
}

.header-top {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  margin-bottom: 0.75rem;
}

.app-header h1 {
  margin: 0;
  font-size: 1.5rem;
}

.dark-mode-toggle {
  position: absolute;
  right: 0;
  padding: 0.25rem;
  font-size: 1.25rem;
  background: none;
  border: 2px solid white;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dark-mode-toggle:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: rotate(180deg);
}

.main-nav {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.main-nav button {
  padding: 0.4rem 1.2rem;
  border: none;
  background-color: #34495e;
  color: white;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
  font-size: 0.9rem;
}

.app.dark .main-nav button {
  background-color: #374151;
}

.main-nav button:hover {
  background-color: #4a5f7a;
}

.app.dark .main-nav button:hover {
  background-color: #4b5563;
}

.main-nav button.active {
  background-color: #3498db;
}

.app.dark .main-nav button.active {
  background-color: #2563eb;
}

.app-main {
  padding: 1.5rem;
  flex: 1;
  overflow-y: auto;
}

.study-mode {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.letter-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: background-color 0.3s, box-shadow 0.3s;
  flex-shrink: 0;
}

.app.dark .letter-navigation {
  background-color: #374151;
  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.letter-navigation button {
  padding: 0.4rem 0.8rem;
  border: none;
  background-color: #3498db;
  color: white;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
  font-size: 0.9rem;
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

.app.dark .letter-counter {
  color: #e5e7eb;
}

.letter-selector {
  margin-top: 1rem;
  padding: 1rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: background-color 0.3s, box-shadow 0.3s;
  flex-shrink: 0;
}

.app.dark .letter-selector {
  background-color: #374151;
  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.letter-selector h3 {
  text-align: center;
  margin: 0 0 1rem 0;
  color: #2c3e50;
  font-size: 1rem;
}

.app.dark .letter-selector h3 {
  color: #e5e7eb;
}

.letter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(50px, 1fr));
  gap: 0.4rem;
  max-width: 800px;
  margin: 0 auto;
}

.letter-button {
  padding: 0.5rem;
  font-size: 1.25rem;
  font-family: 'Vazir', 'Arial', sans-serif;
  border: 2px solid #e0e0e0;
  background-color: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  color: #2c3e50;
}

.app.dark .letter-button {
  background-color: #4b5563;
  border-color: #6b7280;
  color: #e5e7eb;
}

.letter-button:hover {
  background-color: #f8f9fa;
  border-color: #3498db;
}

.app.dark .letter-button:hover {
  background-color: #6b7280;
  border-color: #3b82f6;
}

.letter-button.active {
  background-color: #3498db;
  color: white;
  border-color: #3498db;
}

.quiz-mode {
  max-width: 800px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.progress-view {
  max-width: 1200px;
  margin: 0 auto;
}

.app-footer {
  padding: 2rem;
  text-align: center;
  background-color: #f3f4f6;
  border-top: 1px solid #e5e7eb;
  margin-top: auto;
}

.app.dark .app-footer {
  background-color: #1f2937;
  border-top-color: #374151;
}

.app-footer p {
  margin: 0;
  font-size: 0.875rem;
  color: #6b7280;
}

.app.dark .app-footer p {
  color: #9ca3af;
}

.app-footer a {
  color: #3b82f6;
  text-decoration: none;
  transition: color 0.2s;
}

.app-footer a:hover {
  color: #2563eb;
  text-decoration: underline;
}

.app.dark .app-footer a {
  color: #60a5fa;
}

.app.dark .app-footer a:hover {
  color: #93bbfc;
}</style>