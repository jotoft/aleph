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
    
    <div class="forms-and-words">
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
  padding: 1.5rem;
  margin: 0 auto;
  direction: rtl;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: background-color 0.3s, box-shadow 0.3s;
  display: flex;
  gap: 2rem;
  height: 100%;
}

:global(.dark) .letter-display {
  background-color: #374151;
  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.letter-main {
  text-align: center;
  flex: 0 0 250px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.letter-isolated {
  font-size: 4rem;
  margin: 0;
  font-family: 'Vazir', 'Arial', sans-serif;
  color: #2c3e50;
  transition: color 0.3s;
  line-height: 1;
}

:global(.dark) .letter-isolated {
  color: #e5e7eb;
}

.letter-info {
  margin-top: 1rem;
  direction: ltr;
}

.letter-name {
  font-size: 1.1rem;
  margin: 0.25rem 0;
  color: #2c3e50;
  transition: color 0.3s;
}

:global(.dark) .letter-name {
  color: #e5e7eb;
}

.pronunciation {
  font-size: 0.95rem;
  color: #666;
  margin: 0.25rem 0;
  transition: color 0.3s;
}

:global(.dark) .pronunciation {
  color: #9ca3af;
}

.pronunciation-sv {
  font-size: 0.9rem;
  color: #0066cc;
  margin: 0.25rem 0;
  transition: color 0.3s;
}

:global(.dark) .pronunciation-sv {
  color: #3b82f6;
}

.forms-and-words {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow-y: auto;
  direction: ltr;
}

.letter-forms {
  flex-shrink: 0;
}

.letter-forms h3 {
  text-align: center;
  margin: 0 0 0.75rem 0;
  direction: ltr;
  color: #2c3e50;
  transition: color 0.3s;
  font-size: 1rem;
}

:global(.dark) .letter-forms h3 {
  color: #e5e7eb;
}

.forms-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
  text-align: center;
}

.form-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.form-label {
  font-size: 0.8rem;
  color: #666;
  direction: ltr;
  transition: color 0.3s;
}

:global(.dark) .form-label {
  color: #9ca3af;
}

.form-letter {
  font-size: 2rem;
  font-family: 'Vazir', 'Arial', sans-serif;
  color: #2c3e50;
  transition: color 0.3s;
  line-height: 1;
  direction: rtl;
}

:global(.dark) .form-letter {
  color: #e5e7eb;
}

.example-words {
  flex: 1;
  min-height: 0;
}

.example-words h3 {
  text-align: center;
  margin: 0 0 0.75rem 0;
  direction: ltr;
  color: #2c3e50;
  transition: color 0.3s;
  font-size: 1rem;
}

:global(.dark) .example-words h3 {
  color: #e5e7eb;
}

.words-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.word-item {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  align-items: center;
  padding: 0.4rem 0.6rem;
  background-color: #f8f9fa;
  border-radius: 6px;
  transition: background-color 0.3s;
}

:global(.dark) .word-item {
  background-color: #4b5563;
}

.word-persian {
  font-size: 1.3rem;
  font-family: 'Vazir', 'Arial', sans-serif;
  text-align: right;
  color: #2c3e50;
  transition: color 0.3s;
  direction: rtl;
}

:global(.dark) .word-persian {
  color: #e5e7eb;
}

.word-transliteration {
  text-align: center;
  color: #666;
  direction: ltr;
  transition: color 0.3s;
  font-size: 0.85rem;
}

:global(.dark) .word-transliteration {
  color: #9ca3af;
}

.word-meaning {
  text-align: left;
  color: #0066cc;
  direction: ltr;
  transition: color 0.3s;
  font-size: 0.85rem;
}

:global(.dark) .word-meaning {
  color: #3b82f6;
}

/* Mobile styles removed for laptop optimization */</style>