<template>
  <div class="highlight-test">
    <h2>Letter Highlighting Test</h2>
    
    <div class="test-section">
      <h3>Debug: Testing Different Highlighting Approaches</h3>
      
      <h4>Test with dir="rtl"</h4>
      <div class="word-display">
        <p class="word-persian" dir="rtl">
          آ<mark class="highlighted-letter">ب</mark>ی
        </p>
        <p class="word-transliteration">ābi (beh highlighted)</p>
      </div>
      
      <div class="word-display">
        <p class="word-persian" dir="rtl">
          س<mark class="highlighted-letter">ل</mark>ام
        </p>
        <p class="word-transliteration">salām (lam highlighted)</p>
      </div>
      
      <div class="word-display">
        <p class="word-persian" dir="rtl">
          کتا<mark class="highlighted-letter">ب</mark>
        </p>
        <p class="word-transliteration">ketāb (final beh highlighted)</p>
      </div>
    </div>
    
    <button @click="toggleDarkMode" class="toggle-button">
      Toggle Dark Mode (currently: {{ isDark ? 'Dark' : 'Light' }})
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const isDark = ref(false);

const toggleDarkMode = () => {
  isDark.value = !isDark.value;
  if (isDark.value) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

onMounted(() => {
  isDark.value = document.documentElement.classList.contains('dark');
});
</script>

<style scoped>
.highlight-test {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

h2 {
  color: #1f2937;
  margin-bottom: 2rem;
}

.dark h2 {
  color: #f3f4f6;
}

h3 {
  color: #4b5563;
  margin-bottom: 1rem;
}

.dark h3 {
  color: #d1d5db;
}

.test-section {
  margin-bottom: 2rem;
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
  color: #1f2937;
}

.dark .word-display .word-persian {
  color: #f3f4f6;
}

.word-persian mark.highlighted-letter {
  background-color: transparent;
  color: #dc2626;
}

.dark .word-persian mark.highlighted-letter {
  background-color: transparent;
  color: #fbbf24;
}

.word-display .word-transliteration {
  font-size: 1rem;
  color: #6b7280;
  margin: 0;
}

.dark .word-display .word-transliteration {
  color: #9ca3af;
}

.toggle-button {
  padding: 0.75rem 1.5rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;
}

.toggle-button:hover {
  background-color: #2563eb;
}
</style>