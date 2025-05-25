<template>
  <div class="letter-display">
    <div class="letter-main">
      <h2 class="letter-isolated">{{ letter.isolated }}</h2>
      <div class="letter-info">
        <p class="letter-name">{{ letter.nameFa }} ({{ letter.nameEn }})</p>
        <p class="pronunciation">{{ letter.pronunciation }}</p>
        <p v-if="letter.pronunciationSv" class="pronunciation-sv">
          🇸🇪 {{ letter.pronunciationSv }}
        </p>
      </div>
    </div>
    
    <div class="letter-forms">
      <h3>Letter Forms</h3>
      <div class="forms-grid">
        <div class="form-item">
          <span class="form-label">Isolated</span>
          <span class="form-letter">{{ letter.isolated }}</span>
        </div>
        <div class="form-item">
          <span class="form-label">Initial</span>
          <span class="form-letter">{{ letter.initial }}</span>
        </div>
        <div class="form-item">
          <span class="form-label">Medial</span>
          <span class="form-letter">{{ letter.medial }}</span>
        </div>
        <div class="form-item">
          <span class="form-label">Final</span>
          <span class="form-letter">{{ letter.final }}</span>
        </div>
      </div>
    </div>
    
    <div class="example-words" v-if="letter.exampleWords.length > 0">
      <h3>Example Words</h3>
      <div class="words-list">
        <div v-for="word in letter.exampleWords" :key="word.word" class="word-item">
          <span class="word-persian">{{ word.word }}</span>
          <span class="word-transliteration">{{ word.transliteration }}</span>
          <span class="word-meaning">{{ word.meaning }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
import type { PersianLetter } from '../data/persianLetters';

defineProps<{
  letter: PersianLetter;
}>();
</script>

<style scoped>
.letter-display {
  padding: 2rem;
  max-width: 600px;
  margin: 0 auto;
  direction: rtl;
}

.letter-main {
  text-align: center;
  margin-bottom: 3rem;
}

.letter-isolated {
  font-size: 8rem;
  margin: 0;
  font-family: 'Vazir', 'Arial', sans-serif;
  color: #2c3e50;
}

.letter-info {
  margin-top: 1rem;
  direction: ltr;
}

.letter-name {
  font-size: 1.5rem;
  margin: 0.5rem 0;
}

.pronunciation {
  font-size: 1.2rem;
  color: #666;
  margin: 0.5rem 0;
}

.pronunciation-sv {
  font-size: 1.1rem;
  color: #0066cc;
  margin: 0.5rem 0;
}

.letter-forms {
  margin-bottom: 3rem;
}

.letter-forms h3 {
  text-align: center;
  margin-bottom: 1.5rem;
  direction: ltr;
}

.forms-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  text-align: center;
}

.form-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.9rem;
  color: #666;
  direction: ltr;
}

.form-letter {
  font-size: 3rem;
  font-family: 'Vazir', 'Arial', sans-serif;
  color: #2c3e50;
}

.example-words h3 {
  text-align: center;
  margin-bottom: 1.5rem;
  direction: ltr;
}

.words-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.word-item {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  align-items: center;
  padding: 0.75rem;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.word-persian {
  font-size: 2rem;
  font-family: 'Vazir', 'Arial', sans-serif;
  text-align: right;
}

.word-transliteration {
  text-align: center;
  color: #666;
  direction: ltr;
}

.word-meaning {
  text-align: left;
  color: #0066cc;
  direction: ltr;
}

@media (max-width: 768px) {
  .letter-isolated {
    font-size: 6rem;
  }
  
  .forms-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .word-item {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 0.5rem;
  }
}</style>