// Progressive word list for learning Persian vocabulary
// Words are organized by the letters they contain, allowing gradual introduction
// as users learn new letters

export interface ProgressiveWord {
  id: string;
  persian: string;
  transliteration: string;
  meaning: string;
  requiredLetters: string[]; // Letter IDs that must be known
  difficulty: number; // 1-3, where 1 is easiest
  category: string; // For thematic grouping
  frequency: number; // How common the word is (1-5, 5 being most common)
}

export const progressiveWords: ProgressiveWord[] = [
  // Group 1: Words using only initial letters (alef, beh, sin, mim, dal)
  {
    id: "ab",
    persian: "آب",
    transliteration: "āb",
    meaning: "water",
    requiredLetters: ["alef", "beh"],
    difficulty: 1,
    category: "nature",
    frequency: 5
  },
  {
    id: "bad",
    persian: "بد",
    transliteration: "bad",
    meaning: "bad",
    requiredLetters: ["beh", "dal"],
    difficulty: 1,
    category: "adjectives",
    frequency: 5
  },
  {
    id: "man",
    persian: "من",
    transliteration: "man",
    meaning: "I/me",
    requiredLetters: ["mim", "nun"],
    difficulty: 1,
    category: "pronouns",
    frequency: 5
  },
  {
    id: "sad",
    persian: "صد",
    transliteration: "sad",
    meaning: "hundred",
    requiredLetters: ["sad", "dal"],
    difficulty: 1,
    category: "numbers",
    frequency: 4
  },
  {
    id: "dam",
    persian: "دم",
    transliteration: "dam",
    meaning: "breath/moment",
    requiredLetters: ["dal", "mim"],
    difficulty: 1,
    category: "abstract",
    frequency: 3
  },
  {
    id: "bas",
    persian: "بس",
    transliteration: "bas",
    meaning: "enough",
    requiredLetters: ["beh", "sin"],
    difficulty: 1,
    category: "expressions",
    frequency: 5
  },

  // Group 2: Adding nun, lam, reh, yeh, vav
  {
    id: "dar",
    persian: "در",
    transliteration: "dar",
    meaning: "in/door",
    requiredLetters: ["dal", "reh"],
    difficulty: 1,
    category: "prepositions",
    frequency: 5
  },
  {
    id: "del",
    persian: "دل",
    transliteration: "del",
    meaning: "heart",
    requiredLetters: ["dal", "lam"],
    difficulty: 1,
    category: "body",
    frequency: 5
  },
  {
    id: "sal",
    persian: "سال",
    transliteration: "sāl",
    meaning: "year",
    requiredLetters: ["sin", "alef", "lam"],
    difficulty: 1,
    category: "time",
    frequency: 5
  },
  {
    id: "sar",
    persian: "سر",
    transliteration: "sar",
    meaning: "head",
    requiredLetters: ["sin", "reh"],
    difficulty: 1,
    category: "body",
    frequency: 5
  },
  {
    id: "nam",
    persian: "نام",
    transliteration: "nām",
    meaning: "name",
    requiredLetters: ["nun", "alef", "mim"],
    difficulty: 1,
    category: "abstract",
    frequency: 5
  },
  {
    id: "ran",
    persian: "ران",
    transliteration: "rān",
    meaning: "thigh",
    requiredLetters: ["reh", "alef", "nun"],
    difficulty: 2,
    category: "body",
    frequency: 2
  },
  {
    id: "nou",
    persian: "نو",
    transliteration: "now",
    meaning: "new",
    requiredLetters: ["nun", "vav"],
    difficulty: 1,
    category: "adjectives",
    frequency: 4
  },
  {
    id: "dou",
    persian: "دو",
    transliteration: "do",
    meaning: "two",
    requiredLetters: ["dal", "vav"],
    difficulty: 1,
    category: "numbers",
    frequency: 5
  },
  {
    id: "roi",
    persian: "روی",
    transliteration: "ruy",
    meaning: "face/on",
    requiredLetters: ["reh", "vav", "yeh"],
    difficulty: 2,
    category: "body",
    frequency: 4
  },

  // Group 3: Adding teh, peh, jim, cheh
  {
    id: "tar",
    persian: "تر",
    transliteration: "tar",
    meaning: "more/-er",
    requiredLetters: ["teh", "reh"],
    difficulty: 1,
    category: "grammar",
    frequency: 5
  },
  {
    id: "to",
    persian: "تو",
    transliteration: "to",
    meaning: "you",
    requiredLetters: ["teh", "vav"],
    difficulty: 1,
    category: "pronouns",
    frequency: 5
  },
  {
    id: "pa",
    persian: "پا",
    transliteration: "pā",
    meaning: "foot",
    requiredLetters: ["peh", "alef"],
    difficulty: 1,
    category: "body",
    frequency: 5
  },
  {
    id: "pol",
    persian: "پل",
    transliteration: "pol",
    meaning: "bridge",
    requiredLetters: ["peh", "lam"],
    difficulty: 1,
    category: "places",
    frequency: 3
  },
  {
    id: "jang",
    persian: "جنگ",
    transliteration: "jang",
    meaning: "war",
    requiredLetters: ["jim", "nun", "gaf"],
    difficulty: 2,
    category: "abstract",
    frequency: 3
  },
  {
    id: "chand",
    persian: "چند",
    transliteration: "chand",
    meaning: "how many/several",
    requiredLetters: ["cheh", "nun", "dal"],
    difficulty: 2,
    category: "questions",
    frequency: 5
  },
  {
    id: "chap",
    persian: "چپ",
    transliteration: "chap",
    meaning: "left",
    requiredLetters: ["cheh", "peh"],
    difficulty: 1,
    category: "directions",
    frequency: 4
  },

  // Group 4: More complex words with multiple forms
  {
    id: "kitab",
    persian: "کتاب",
    transliteration: "ketāb",
    meaning: "book",
    requiredLetters: ["kaf", "teh", "alef", "beh"],
    difficulty: 2,
    category: "objects",
    frequency: 5
  },
  {
    id: "hava",
    persian: "هوا",
    transliteration: "havā",
    meaning: "weather/air",
    requiredLetters: ["heh", "vav", "alef"],
    difficulty: 2,
    category: "nature",
    frequency: 5
  },
  {
    id: "gham",
    persian: "غم",
    transliteration: "gham",
    meaning: "sorrow",
    requiredLetters: ["ghain", "mim"],
    difficulty: 2,
    category: "emotions",
    frequency: 3
  },
  {
    id: "asb",
    persian: "اسب",
    transliteration: "asb",
    meaning: "horse",
    requiredLetters: ["alef", "sin", "beh"],
    difficulty: 1,
    category: "animals",
    frequency: 3
  },
  {
    id: "gol",
    persian: "گل",
    transliteration: "gol",
    meaning: "flower",
    requiredLetters: ["gaf", "lam"],
    difficulty: 1,
    category: "nature",
    frequency: 4
  },

  // Common phrases and expressions
  {
    id: "salam",
    persian: "سلام",
    transliteration: "salām",
    meaning: "hello/peace",
    requiredLetters: ["sin", "lam", "alef", "mim"],
    difficulty: 1,
    category: "greetings",
    frequency: 5
  },
  {
    id: "mamnun",
    persian: "ممنون",
    transliteration: "mamnun",
    meaning: "thank you",
    requiredLetters: ["mim", "nun", "vav"],
    difficulty: 2,
    category: "greetings",
    frequency: 5
  },
  {
    id: "bebakhshid",
    persian: "ببخشید",
    transliteration: "bebakhshid",
    meaning: "excuse me/sorry",
    requiredLetters: ["beh", "kheh", "shin", "yeh", "dal"],
    difficulty: 3,
    category: "greetings",
    frequency: 5
  },

  // More vocabulary with varying difficulty
  {
    id: "zan",
    persian: "زن",
    transliteration: "zan",
    meaning: "woman",
    requiredLetters: ["zeh", "nun"],
    difficulty: 1,
    category: "people",
    frequency: 5
  },
  {
    id: "mard",
    persian: "مرد",
    transliteration: "mard",
    meaning: "man",
    requiredLetters: ["mim", "reh", "dal"],
    difficulty: 1,
    category: "people",
    frequency: 5
  },
  {
    id: "khaneh",
    persian: "خانه",
    transliteration: "khāne",
    meaning: "house/home",
    requiredLetters: ["kheh", "alef", "nun", "heh"],
    difficulty: 2,
    category: "places",
    frequency: 5
  },
  {
    id: "shahr",
    persian: "شهر",
    transliteration: "shahr",
    meaning: "city",
    requiredLetters: ["shin", "heh", "reh"],
    difficulty: 2,
    category: "places",
    frequency: 4
  },
  {
    id: "kar",
    persian: "کار",
    transliteration: "kār",
    meaning: "work",
    requiredLetters: ["kaf", "alef", "reh"],
    difficulty: 1,
    category: "abstract",
    frequency: 5
  },
  {
    id: "rah",
    persian: "راه",
    transliteration: "rāh",
    meaning: "way/road",
    requiredLetters: ["reh", "alef", "heh"],
    difficulty: 1,
    category: "places",
    frequency: 5
  },
  {
    id: "doust",
    persian: "دوست",
    transliteration: "dust",
    meaning: "friend",
    requiredLetters: ["dal", "vav", "sin", "teh"],
    difficulty: 2,
    category: "people",
    frequency: 5
  },
  {
    id: "pedar",
    persian: "پدر",
    transliteration: "pedar",
    meaning: "father",
    requiredLetters: ["peh", "dal", "reh"],
    difficulty: 1,
    category: "family",
    frequency: 5
  },
  {
    id: "madar",
    persian: "مادر",
    transliteration: "mādar",
    meaning: "mother",
    requiredLetters: ["mim", "alef", "dal", "reh"],
    difficulty: 2,
    category: "family",
    frequency: 5
  },
  {
    id: "baradar",
    persian: "برادر",
    transliteration: "barādar",
    meaning: "brother",
    requiredLetters: ["beh", "reh", "alef", "dal"],
    difficulty: 2,
    category: "family",
    frequency: 4
  },
  {
    id: "khahar",
    persian: "خواهر",
    transliteration: "khāhar",
    meaning: "sister",
    requiredLetters: ["kheh", "vav", "alef", "heh", "reh"],
    difficulty: 3,
    category: "family",
    frequency: 4
  }
];

// Helper function to get words available for given known letters
export function getAvailableWords(knownLetterIds: string[]): ProgressiveWord[] {
  return progressiveWords.filter(word => 
    word.requiredLetters.every(letterId => knownLetterIds.includes(letterId))
  );
}

// Helper function to get words by difficulty
export function getWordsByDifficulty(words: ProgressiveWord[], difficulty: number): ProgressiveWord[] {
  return words.filter(word => word.difficulty === difficulty);
}

// Helper function to get words by category
export function getWordsByCategory(words: ProgressiveWord[], category: string): ProgressiveWord[] {
  return words.filter(word => word.category === category);
}

// Get all unique categories
export function getCategories(): string[] {
  return [...new Set(progressiveWords.map(word => word.category))];
}