<template>
  <div class="mastery-progress">
    <div class="progress-header">
      <h2>Your Learning Progress</h2>
      <div class="stats-summary">
        <div class="stat">
          <span class="stat-value">{{ masteredCount }}</span>
          <span class="stat-label">Mastered</span>
        </div>
        <div class="stat">
          <span class="stat-value">{{ proficientCount }}</span>
          <span class="stat-label">Proficient</span>
        </div>
        <div class="stat">
          <span class="stat-value">{{ familiarCount }}</span>
          <span class="stat-label">Familiar</span>
        </div>
        <div class="stat">
          <span class="stat-value">{{ learningCount }}</span>
          <span class="stat-label">Learning</span>
        </div>
      </div>
    </div>

    <div class="legend">
      <div class="legend-item">
        <div class="form-dot high"></div>
        <span>High accuracy (>80%)</span>
      </div>
      <div class="legend-item">
        <div class="form-dot medium"></div>
        <span>Medium accuracy (50-80%)</span>
      </div>
      <div class="legend-item">
        <div class="form-dot low"></div>
        <span>Low accuracy (<50%)</span>
      </div>
      <div class="legend-item">
        <div class="form-dot untested"></div>
        <span>Not practiced yet</span>
      </div>
    </div>

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
        <div class="letter-name-fa">{{ letterData.letter.nameFa }}</div>
        <div class="mastery-bar">
          <div 
            class="mastery-fill" 
            :style="{ width: `${letterData.overallMastery * 100}%` }"
          ></div>
          <span class="mastery-percent">{{ Math.round(letterData.overallMastery * 100) }}%</span>
        </div>
        <div class="form-indicators">
          <div class="form-row" v-for="form in forms" :key="form">
            <span class="form-label">{{ form.charAt(0).toUpperCase() + form.slice(1) }}</span>
            <div 
              class="form-dot"
              :class="{ 
                'high': getFormAccuracy(letterData.forms[form]) > 0.8,
                'medium': getFormAccuracy(letterData.forms[form]) > 0.5,
                'low': getFormAccuracy(letterData.forms[form]) <= 0.5,
                'untested': letterData.forms[form].exposures === 0
              }"
              :title="`${form}: ${Math.round(getFormAccuracy(letterData.forms[form]) * 100)}% (${letterData.forms[form].exposures} attempts)`"
            ></div>
          </div>
        </div>
        <div class="attempts-info">
          {{ getTotalAttempts(letterData) }} attempts
        </div>
      </div>
    </div>
    
    <div class="data-management">
      <h3>Data Management</h3>
      <div class="data-buttons">
        <button @click="exportProgress" class="export-button">
          📥 Export Progress
        </button>
        <button @click="triggerImport" class="import-button">
          📤 Import Progress
        </button>
        <input 
          ref="importInput"
          type="file" 
          accept=".json"
          @change="importProgress"
          style="display: none"
        />
      </div>
      <div v-if="importMessage" class="import-message" :class="{ error: importError }">
        {{ importMessage }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { persianLetters } from '../data/persianLetters';
import { MasteryTracker } from '../services/masteryTracking';
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

const masteredCount = computed(() => letterProgress.value.filter(l => l.masteryLevel === 3).length);
const proficientCount = computed(() => letterProgress.value.filter(l => l.masteryLevel === 2).length);
const familiarCount = computed(() => letterProgress.value.filter(l => l.masteryLevel === 1).length);
const learningCount = computed(() => letterProgress.value.filter(l => l.masteryLevel === 0).length);

function getFormAccuracy(form: any): number {
  if (!form || form.exposures === 0) return 0;
  return form.correctAnswers / form.exposures;
}

function getTotalAttempts(letterData: any): number {
  return Object.values(letterData.forms).reduce((sum: number, form: any) => sum + (form.exposures || 0), 0);
}

// Import/Export functionality
const importInput = ref<HTMLInputElement>();
const importMessage = ref('');
const importError = ref(false);

function exportProgress() {
  const masteryData = localStorage.getItem('masteryData');
  if (!masteryData) {
    alert('No progress data to export!');
    return;
  }
  
  // Create a comprehensive export object
  const exportData = {
    version: '2.0',
    exportDate: new Date().toISOString(),
    masteryData: JSON.parse(masteryData),
    wordProgressionData: null as any
  };
  
  // Include word progression data if available
  const wordData = localStorage.getItem('wordProgressionData');
  if (wordData) {
    try {
      exportData.wordProgressionData = JSON.parse(wordData);
    } catch (e) {
      console.error('Failed to parse word progression data:', e);
    }
  }
  
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `persian-progress-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function triggerImport() {
  importInput.value?.click();
}

function importProgress(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = e.target?.result as string;
      const parsed = JSON.parse(data);
      
      // Handle both old format (direct mastery data) and new format (wrapped)
      let masteryData: any;
      let wordProgressionData: any = null;
      
      if (parsed.version === '2.0') {
        // New format with version
        masteryData = parsed.masteryData;
        wordProgressionData = parsed.wordProgressionData;
      } else {
        // Old format - assume it's direct mastery data
        masteryData = parsed;
      }
      
      // Validate mastery data structure
      MasteryTracker.deserializeFromJSON(JSON.stringify(masteryData));
      
      // Save to localStorage
      localStorage.setItem('masteryData', JSON.stringify(masteryData));
      
      // Save word progression data if available
      if (wordProgressionData) {
        localStorage.setItem('wordProgressionData', JSON.stringify(wordProgressionData));
      }
      
      importMessage.value = 'Progress imported successfully! Refreshing...';
      importError.value = false;
      
      // Refresh the page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      importMessage.value = 'Error importing file. Please check it\'s a valid progress file.';
      importError.value = true;
      console.error('Import error:', error);
    }
  };
  
  reader.readAsText(file);
  
  // Clear the input so the same file can be selected again
  (event.target as HTMLInputElement).value = '';
}
</script>

<style scoped>
.mastery-progress {
  padding: 2rem;
}

.progress-header {
  text-align: center;
  margin-bottom: 2rem;
}

.progress-header h2 {
  margin: 0 0 1.5rem 0;
  font-size: 2rem;
  color: #1f2937;
}

.dark .progress-header h2 {
  color: #f3f4f6;
}

.stats-summary {
  display: flex;
  justify-content: center;
  gap: 3rem;
  margin-bottom: 1rem;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: bold;
  color: #1f2937;
}

.dark .stat-value {
  color: #f3f4f6;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.dark .stat-label {
  color: #9ca3af;
}

.legend {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background-color: #f3f4f6;
  border-radius: 8px;
}

.dark .legend {
  background-color: #1f2937;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #4b5563;
}

.dark .legend-item {
  color: #d1d5db;
}

.letter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
}

.letter-card {
  padding: 1rem;
  background-color: white;
  border-radius: 12px;
  text-align: center;
  transition: all 0.3s;
  border: 3px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  position: relative;
}

.dark .letter-card {
  background-color: #374151;
  border-color: #4b5563;
}

.letter-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.letter-card.mastered {
  border-color: #10b981;
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
}

.dark .letter-card.mastered {
  background: linear-gradient(135deg, #064e3b 0%, #047857 100%);
  border-color: #10b981;
}

.letter-card.proficient {
  border-color: #3b82f6;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
}

.dark .letter-card.proficient {
  background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
  border-color: #3b82f6;
}

.letter-card.familiar {
  border-color: #f59e0b;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
}

.dark .letter-card.familiar {
  background: linear-gradient(135deg, #78350f 0%, #92400e 100%);
  border-color: #f59e0b;
}

.letter-display {
  font-size: 2.5rem;
  font-family: 'Vazir', 'Arial', sans-serif;
  margin-bottom: 0.25rem;
  color: #1f2937;
  line-height: 1;
}

.dark .letter-display {
  color: #f3f4f6;
}

.letter-name {
  font-size: 0.875rem;
  color: #4b5563;
  margin-bottom: 0.25rem;
  font-weight: 500;
}

.dark .letter-name {
  color: #d1d5db;
}

.letter-name-fa {
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 0.75rem;
  font-family: 'Vazir', 'Arial', sans-serif;
}

.dark .letter-name-fa {
  color: #9ca3af;
}

.mastery-bar {
  height: 6px;
  background-color: #e5e7eb;
  border-radius: 3px;
  margin-bottom: 0.75rem;
  position: relative;
  overflow: visible;
}

.dark .mastery-bar {
  background-color: #4b5563;
}

.mastery-fill {
  height: 100%;
  background-color: #3b82f6;
  transition: width 0.3s;
  border-radius: 3px;
}

.mastery-percent {
  position: absolute;
  right: -35px;
  top: -8px;
  font-size: 0.75rem;
  font-weight: bold;
  color: #3b82f6;
}

.dark .mastery-percent {
  color: #60a5fa;
}

.form-indicators {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  align-items: stretch;
  margin-bottom: 0.5rem;
}

.form-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.125rem 0;
}

.form-label {
  font-size: 0.7rem;
  color: #6b7280;
  text-align: left;
}

.dark .form-label {
  color: #9ca3af;
}

.form-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #e5e7eb;
  transition: all 0.2s;
}

.form-dot.high {
  background-color: #10b981;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
}

.form-dot.medium {
  background-color: #f59e0b;
  box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.2);
}

.form-dot.low {
  background-color: #ef4444;
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
}

.form-dot.untested {
  background-color: #e5e7eb;
}

.dark .form-dot.untested {
  background-color: #4b5563;
}

.attempts-info {
  font-size: 0.7rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.dark .attempts-info {
  color: #9ca3af;
}

/* Data Management Section */
.data-management {
  margin-top: 3rem;
  padding: 2rem;
  background-color: #f3f4f6;
  border-radius: 8px;
  text-align: center;
}

.dark .data-management {
  background-color: #1f2937;
}

.data-management h3 {
  margin: 0 0 1.5rem 0;
  font-size: 1.5rem;
  color: #1f2937;
}

.dark .data-management h3 {
  color: #f3f4f6;
}

.data-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 1rem;
}

.export-button,
.import-button {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.export-button {
  background-color: #3b82f6;
  color: white;
}

.export-button:hover {
  background-color: #2563eb;
  transform: scale(1.05);
}

.import-button {
  background-color: #10b981;
  color: white;
}

.import-button:hover {
  background-color: #059669;
  transform: scale(1.05);
}

.import-message {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-size: 0.9rem;
  background-color: #d1fae5;
  color: #065f46;
  border: 1px solid #10b981;
}

.import-message.error {
  background-color: #fee2e2;
  color: #991b1b;
  border-color: #ef4444;
}

.dark .import-message {
  background-color: #064e3b;
  color: #d1fae5;
}

.dark .import-message.error {
  background-color: #7f1d1d;
  color: #fee2e2;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .mastery-progress {
    padding: 1rem;
  }

  .progress-header h2 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }

  .stats-summary {
    gap: 1.5rem;
    flex-wrap: wrap;
  }

  .stat-value {
    font-size: 2rem;
  }

  .stat-label {
    font-size: 0.75rem;
  }

  .legend {
    flex-wrap: wrap;
    gap: 1rem;
    padding: 0.75rem;
  }

  .legend-item {
    font-size: 0.75rem;
  }

  .letter-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 0.75rem;
  }

  .letter-card {
    padding: 0.75rem;
  }

  .letter-display {
    font-size: 2rem;
  }

  .letter-name {
    font-size: 0.75rem;
  }

  .letter-name-fa {
    font-size: 0.65rem;
    margin-bottom: 0.5rem;
  }

  .mastery-bar {
    margin-bottom: 0.5rem;
  }

  .mastery-percent {
    right: -30px;
    font-size: 0.65rem;
  }

  .form-label {
    font-size: 0.6rem;
  }

  .form-dot {
    width: 8px;
    height: 8px;
  }

  .attempts-info {
    font-size: 0.6rem;
  }

  .data-management {
    padding: 1rem;
    margin-top: 2rem;
  }

  .data-management h3 {
    font-size: 1.25rem;
    margin-bottom: 1rem;
  }

  .data-buttons {
    flex-direction: column;
    gap: 0.75rem;
  }

  .export-button,
  .import-button {
    padding: 0.75rem 1.25rem;
    font-size: 0.9rem;
    width: 100%;
    justify-content: center;
  }
}
</style>