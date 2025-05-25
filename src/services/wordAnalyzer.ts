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

// Non-connecting letters (don't connect to following letter)
const NON_CONNECTING_LETTERS = ['alef', 'dal', 'reh', 'zeh', 'zheh', 'vav'];

export class PersianWordAnalyzer {
  private letterMap: Map<string, PersianLetter>;
  private isolatedToLetterMap: Map<string, string>;
  
  constructor() {
    this.letterMap = new Map(persianLetters.map(l => [l.id, l]));
    
    // Create a map from isolated form to letter ID for quick lookup
    this.isolatedToLetterMap = new Map();
    for (const letter of persianLetters) {
      this.isolatedToLetterMap.set(letter.isolated, letter.id);
    }
    
    // Add special cases
    this.isolatedToLetterMap.set('آ', 'alef'); // Alef with madda
  }
  
  analyzeWord(word: string): AnalyzedWord {
    const letters: LetterPosition[] = [];
    const chars = [...word]; // Handle Unicode properly
    
    for (let i = 0; i < chars.length; i++) {
      const char = chars[i];
      const letterId = this.isolatedToLetterMap.get(char);
      
      if (letterId) {
        const form = this.determineForm(letterId, i, chars);
        letters.push({
          letterId,
          form,
          position: i,
          character: char
        });
      }
    }
    
    return { word, letters };
  }
  
  private determineForm(letterId: string, position: number, chars: string[]): LetterForm {
    const isNonConnecting = NON_CONNECTING_LETTERS.includes(letterId);
    const prevChar = position > 0 ? chars[position - 1] : null;
    const nextChar = position < chars.length - 1 ? chars[position + 1] : null;
    
    const prevLetterId = prevChar ? this.isolatedToLetterMap.get(prevChar) : null;
    const nextLetterId = nextChar ? this.isolatedToLetterMap.get(nextChar) : null;
    
    const connectsToPrev = prevLetterId && !NON_CONNECTING_LETTERS.includes(prevLetterId);
    const connectsToNext = nextLetterId && !isNonConnecting;
    
    if (connectsToPrev && connectsToNext) {
      return 'medial';
    } else if (connectsToPrev && !connectsToNext) {
      return 'final';
    } else if (!connectsToPrev && connectsToNext) {
      return 'initial';
    } else {
      return 'isolated';
    }
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