// Progressive word list for learning Persian vocabulary
// Words are organized by the letters they contain, allowing gradual introduction
// as users learn new letters

export interface ProgressiveWord {
  id: string;
  persian: string;
  persianWithDiacritics?: string; // Persian text with vowel marks for beginners
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
    persianWithDiacritics: "آب",
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
    persianWithDiacritics: "بَد",
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
    persianWithDiacritics: "مَن",
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
    persianWithDiacritics: "صَد",
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
    persianWithDiacritics: "دَم",
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
    persianWithDiacritics: "بَس",
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
    persianWithDiacritics: "دَر",
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
    persianWithDiacritics: "دِل",
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
    persianWithDiacritics: "سال",
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
    persianWithDiacritics: "سَر",
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
    persianWithDiacritics: "نام",
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
    persianWithDiacritics: "دو",
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
    persianWithDiacritics: "تو",
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
    persianWithDiacritics: "پا",
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
    persianWithDiacritics: "سَلام",
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
    persianWithDiacritics: "زَن",
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
    persianWithDiacritics: "مَرد",
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
    persianWithDiacritics: "کار",
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
    persianWithDiacritics: "دوست",
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
    persianWithDiacritics: "پِدَر",
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
    persianWithDiacritics: "مادَر",
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
  },

  // Shopping list: Vegetables (سبزیجات)
  {
    id: "piyaz",
    persian: "پیاز",
    transliteration: "piyāz",
    meaning: "onion",
    requiredLetters: ["peh", "yeh", "alef", "zeh"],
    difficulty: 1,
    category: "vegetables",
    frequency: 5
  },
  {
    id: "sir",
    persian: "سیر",
    transliteration: "sir",
    meaning: "garlic",
    requiredLetters: ["sin", "yeh", "reh"],
    difficulty: 1,
    category: "vegetables",
    frequency: 5
  },
  {
    id: "gojeh",
    persian: "گوجه",
    transliteration: "gojeh",
    meaning: "tomato",
    requiredLetters: ["gaf", "vav", "jim", "heh"],
    difficulty: 1,
    category: "vegetables",
    frequency: 5
  },
  {
    id: "khiyar",
    persian: "خیار",
    transliteration: "khiyār",
    meaning: "cucumber",
    requiredLetters: ["kheh", "yeh", "alef", "reh"],
    difficulty: 1,
    category: "vegetables",
    frequency: 5
  },
  {
    id: "havij",
    persian: "هویج",
    transliteration: "havij",
    meaning: "carrot",
    requiredLetters: ["heh", "vav", "yeh", "jim"],
    difficulty: 1,
    category: "vegetables",
    frequency: 4
  },
  {
    id: "kahu",
    persian: "کاهو",
    transliteration: "kāhu",
    meaning: "lettuce",
    requiredLetters: ["kaf", "alef", "heh", "vav"],
    difficulty: 1,
    category: "vegetables",
    frequency: 4
  },
  {
    id: "kadu",
    persian: "کدو",
    transliteration: "kadu",
    meaning: "squash/zucchini",
    requiredLetters: ["kaf", "dal", "vav"],
    difficulty: 1,
    category: "vegetables",
    frequency: 4
  },
  {
    id: "felfel",
    persian: "فلفل",
    transliteration: "felfel",
    meaning: "pepper",
    requiredLetters: ["feh", "lam"],
    difficulty: 1,
    category: "vegetables",
    frequency: 4
  },
  {
    id: "sibzamini",
    persian: "سیب‌زمینی",
    transliteration: "sib-zamini",
    meaning: "potato",
    requiredLetters: ["sin", "yeh", "beh", "zeh", "mim", "nun"],
    difficulty: 2,
    category: "vegetables",
    frequency: 5
  },
  {
    id: "badamjan",
    persian: "بادمجان",
    transliteration: "bādamjān",
    meaning: "eggplant",
    requiredLetters: ["beh", "alef", "dal", "mim", "jim", "nun"],
    difficulty: 2,
    category: "vegetables",
    frequency: 4
  },
  {
    id: "esfenaj",
    persian: "اسفناج",
    transliteration: "esfenāj",
    meaning: "spinach",
    requiredLetters: ["alef", "sin", "feh", "nun", "jim"],
    difficulty: 2,
    category: "vegetables",
    frequency: 3
  },
  {
    id: "lubiya",
    persian: "لوبیا",
    transliteration: "lubiyā",
    meaning: "beans",
    requiredLetters: ["lam", "vav", "beh", "yeh", "alef"],
    difficulty: 2,
    category: "vegetables",
    frequency: 4
  },
  {
    id: "nokhod",
    persian: "نخود",
    transliteration: "nokhod",
    meaning: "chickpeas",
    requiredLetters: ["nun", "kheh", "vav", "dal"],
    difficulty: 2,
    category: "vegetables",
    frequency: 4
  },
  {
    id: "gharch",
    persian: "قارچ",
    transliteration: "qārch",
    meaning: "mushroom",
    requiredLetters: ["qaf", "alef", "reh", "cheh"],
    difficulty: 2,
    category: "vegetables",
    frequency: 3
  },
  {
    id: "jafari",
    persian: "جعفری",
    transliteration: "ja'fari",
    meaning: "parsley",
    requiredLetters: ["jim", "ain", "feh", "reh", "yeh"],
    difficulty: 2,
    category: "vegetables",
    frequency: 4
  },
  {
    id: "geshniz",
    persian: "گشنیز",
    transliteration: "geshniz",
    meaning: "cilantro/coriander",
    requiredLetters: ["gaf", "shin", "nun", "yeh", "zeh"],
    difficulty: 2,
    category: "vegetables",
    frequency: 4
  },
  {
    id: "tareh",
    persian: "تره",
    transliteration: "tareh",
    meaning: "leek/chives",
    requiredLetters: ["teh", "reh", "heh"],
    difficulty: 1,
    category: "vegetables",
    frequency: 3
  },
  {
    id: "sabzi",
    persian: "سبزی",
    transliteration: "sabzi",
    meaning: "herbs/greens",
    requiredLetters: ["sin", "beh", "zeh", "yeh"],
    difficulty: 1,
    category: "vegetables",
    frequency: 5
  },

  // Shopping list: Dairy & Eggs (لبنیات و تخم مرغ)
  {
    id: "shir",
    persian: "شیر",
    transliteration: "shir",
    meaning: "milk",
    requiredLetters: ["shin", "yeh", "reh"],
    difficulty: 1,
    category: "dairy",
    frequency: 5
  },
  {
    id: "mast",
    persian: "ماست",
    transliteration: "māst",
    meaning: "yogurt",
    requiredLetters: ["mim", "alef", "sin", "teh"],
    difficulty: 1,
    category: "dairy",
    frequency: 5
  },
  {
    id: "panir",
    persian: "پنیر",
    transliteration: "panir",
    meaning: "cheese",
    requiredLetters: ["peh", "nun", "yeh", "reh"],
    difficulty: 1,
    category: "dairy",
    frequency: 5
  },
  {
    id: "kareh",
    persian: "کره",
    transliteration: "kareh",
    meaning: "butter",
    requiredLetters: ["kaf", "reh", "heh"],
    difficulty: 1,
    category: "dairy",
    frequency: 5
  },
  {
    id: "tokhmemorgh",
    persian: "تخم‌مرغ",
    transliteration: "tokhm-e morgh",
    meaning: "egg",
    requiredLetters: ["teh", "kheh", "mim", "reh", "ghain"],
    difficulty: 2,
    category: "dairy",
    frequency: 5
  },
  {
    id: "khameh",
    persian: "خامه",
    transliteration: "khāmeh",
    meaning: "cream",
    requiredLetters: ["kheh", "alef", "mim", "heh"],
    difficulty: 1,
    category: "dairy",
    frequency: 4
  },
  {
    id: "dugh",
    persian: "دوغ",
    transliteration: "dugh",
    meaning: "yogurt drink",
    requiredLetters: ["dal", "vav", "ghain"],
    difficulty: 1,
    category: "dairy",
    frequency: 4
  },
  {
    id: "sarshir",
    persian: "سرشیر",
    transliteration: "sarshir",
    meaning: "clotted cream",
    requiredLetters: ["sin", "reh", "shin", "yeh"],
    difficulty: 2,
    category: "dairy",
    frequency: 3
  },
  {
    id: "kashk",
    persian: "کشک",
    transliteration: "kashk",
    meaning: "whey (dried)",
    requiredLetters: ["kaf", "shin"],
    difficulty: 1,
    category: "dairy",
    frequency: 3
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