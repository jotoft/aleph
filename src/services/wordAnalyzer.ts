import { persianLetters, type PersianLetter } from '../data/persianLetters';
import type { LetterForm } from './masteryTracking';

export interface LetterPosition {
  letterId: string;
  form: LetterForm;
  position: number;
  character: string;
}

export interface AnalyzedWord {
  word: string;
  letters: LetterPosition[];
}

export class PersianWordAnalyzer {
  private letterMap: Map<string, PersianLetter>;
  
  constructor() {
    this.letterMap = new Map(persianLetters.map(l => [l.id, l]));
  }
  
  analyzeWord(word: string): AnalyzedWord {
    const letters: LetterPosition[] = [];
    
    for (let i = 0; i < word.length; i++) {
      const char = word[i];
      const letterInfo = this.identifyLetter(char);
      
      if (letterInfo) {
        letters.push({
          letterId: letterInfo.letterId,
          form: letterInfo.form,
          position: i,
          character: char
        });
      }
    }
    
    return { word, letters };
  }
  
  private identifyLetter(char: string): { letterId: string; form: LetterForm } | null {
    // Check each letter to find which one contains this character
    for (const [letterId, letter] of this.letterMap) {
      if (char === letter.isolated) return { letterId, form: 'isolated' };
      if (char === letter.initial) return { letterId, form: 'initial' };
      if (char === letter.medial) return { letterId, form: 'medial' };
      if (char === letter.final) return { letterId, form: 'final' };
    }
    
    // Not a letter we track (might be a diacritic, space, etc.)
    return null;
  }
  
  findLetterOccurrences(word: string, letterId: string, form?: LetterForm): LetterPosition[] {
    const analyzed = this.analyzeWord(word);
    return analyzed.letters.filter(l => 
      l.letterId === letterId && 
      (form === undefined || l.form === form)
    );
  }
}

// Create and export a singleton instance
export const wordAnalyzer = new PersianWordAnalyzer();