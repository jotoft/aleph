export interface PersianLetter {
  id: string;
  isolated: string;
  initial: string;
  medial: string;
  final: string;
  nameEn: string;
  nameFa: string;
  pronunciation: string;
  pronunciationSv?: string;
  exampleWords: {
    word: string;
    transliteration: string;
    meaning: string;
    difficulty: number;
  }[];
}

export const persianLetters: PersianLetter[] = [
  {
    id: "alef",
    isolated: "ا",
    initial: "ا",
    medial: "ـا",
    final: "ـا",
    nameEn: "alef",
    nameFa: "الف",
    pronunciation: "a/o/e",
    pronunciationSv: "som 'a' i 'katt', 'o' i 'bord', eller 'e' i 'hej'",
    exampleWords: [
      { word: "آب", transliteration: "āb", meaning: "water", difficulty: 1 },
      { word: "انار", transliteration: "anār", meaning: "pomegranate", difficulty: 2 }
    ]
  },
  {
    id: "beh",
    isolated: "ب",
    initial: "بـ",
    medial: "ـبـ",
    final: "ـب",
    nameEn: "beh",
    nameFa: "به",
    pronunciation: "b",
    pronunciationSv: "som svenskt 'b' i 'boll'",
    exampleWords: [
      { word: "بله", transliteration: "baleh", meaning: "yes", difficulty: 1 },
      { word: "کتاب", transliteration: "ketāb", meaning: "book", difficulty: 2 }
    ]
  },
  {
    id: "teh",
    isolated: "ت",
    initial: "تـ",
    medial: "ـتـ",
    final: "ـت",
    nameEn: "teh",
    nameFa: "ته",
    pronunciation: "t",
    pronunciationSv: "som svenskt 't' i 'tak'",
    exampleWords: [
      { word: "تو", transliteration: "to", meaning: "you", difficulty: 1 },
      { word: "دست", transliteration: "dast", meaning: "hand", difficulty: 2 }
    ]
  },
  {
    id: "reh",
    isolated: "ر",
    initial: "ر",
    medial: "ـر",
    final: "ـر",
    nameEn: "reh",
    nameFa: "ره",
    pronunciation: "r",
    pronunciationSv: "rullande 'r' som i vissa svenska dialekter",
    exampleWords: [
      { word: "روز", transliteration: "ruz", meaning: "day", difficulty: 1 },
      { word: "کار", transliteration: "kār", meaning: "work", difficulty: 2 }
    ]
  },
  {
    id: "zeh",
    isolated: "ز",
    initial: "ز",
    medial: "ـز",
    final: "ـز",
    nameEn: "zeh",
    nameFa: "زه",
    pronunciation: "z",
    pronunciationSv: "som 's' i 'rosa' (tonande s)",
    exampleWords: [
      { word: "زن", transliteration: "zan", meaning: "woman", difficulty: 1 },
      { word: "روز", transliteration: "ruz", meaning: "day", difficulty: 2 }
    ]
  },
  {
    id: "sin",
    isolated: "س",
    initial: "سـ",
    medial: "ـسـ",
    final: "ـس",
    nameEn: "sin",
    nameFa: "سین",
    pronunciation: "s",
    pronunciationSv: "som svenskt 's' i 'sol'",
    exampleWords: [
      { word: "سلام", transliteration: "salām", meaning: "hello", difficulty: 1 },
      { word: "دست", transliteration: "dast", meaning: "hand", difficulty: 2 }
    ]
  },
  {
    id: "mim",
    isolated: "م",
    initial: "مـ",
    medial: "ـمـ",
    final: "ـم",
    nameEn: "mim",
    nameFa: "میم",
    pronunciation: "m",
    pronunciationSv: "som svenskt 'm' i 'mor'",
    exampleWords: [
      { word: "من", transliteration: "man", meaning: "I/me", difficulty: 1 },
      { word: "سلام", transliteration: "salām", meaning: "hello", difficulty: 2 }
    ]
  },
  {
    id: "nun",
    isolated: "ن",
    initial: "نـ",
    medial: "ـنـ",
    final: "ـن",
    nameEn: "nun",
    nameFa: "نون",
    pronunciation: "n",
    pronunciationSv: "som svenskt 'n' i 'nu'",
    exampleWords: [
      { word: "نان", transliteration: "nān", meaning: "bread", difficulty: 1 },
      { word: "من", transliteration: "man", meaning: "I/me", difficulty: 1 }
    ]
  },
  {
    id: "yeh",
    isolated: "ی",
    initial: "یـ",
    medial: "ـیـ",
    final: "ـی",
    nameEn: "yeh",
    nameFa: "یه",
    pronunciation: "y/i",
    pronunciationSv: "som 'j' i 'ja' eller 'i' i 'vi'",
    exampleWords: [
      { word: "یک", transliteration: "yek", meaning: "one", difficulty: 1 },
      { word: "آبی", transliteration: "ābi", meaning: "blue", difficulty: 2 }
    ]
  },
  {
    id: "heh",
    isolated: "ه",
    initial: "هـ",
    medial: "ـهـ",
    final: "ـه",
    nameEn: "heh",
    nameFa: "هه",
    pronunciation: "h",
    pronunciationSv: "som svenskt 'h' i 'hej'",
    exampleWords: [
      { word: "هست", transliteration: "hast", meaning: "is/exists", difficulty: 2 },
      { word: "خانه", transliteration: "khāneh", meaning: "house", difficulty: 2 }
    ]
  },
  {
    id: "vav",
    isolated: "و",
    initial: "و",
    medial: "ـو",
    final: "ـو",
    nameEn: "vav",
    nameFa: "واو",
    pronunciation: "v/u/o",
    pronunciationSv: "som 'v' i 'vad', 'o' i 'bok', eller 'u' i 'du'",
    exampleWords: [
      { word: "و", transliteration: "va", meaning: "and", difficulty: 1 },
      { word: "تو", transliteration: "to", meaning: "you", difficulty: 1 }
    ]
  },
  {
    id: "lam",
    isolated: "ل",
    initial: "لـ",
    medial: "ـلـ",
    final: "ـل",
    nameEn: "lam",
    nameFa: "لام",
    pronunciation: "l",
    pronunciationSv: "som svenskt 'l' i 'lampa'",
    exampleWords: [
      { word: "لب", transliteration: "lab", meaning: "lip", difficulty: 1 },
      { word: "سال", transliteration: "sāl", meaning: "year", difficulty: 2 }
    ]
  },
  {
    id: "dal",
    isolated: "د",
    initial: "د",
    medial: "ـد",
    final: "ـد",
    nameEn: "dal",
    nameFa: "دال",
    pronunciation: "d",
    pronunciationSv: "som svenskt 'd' i 'dag'",
    exampleWords: [
      { word: "دو", transliteration: "do", meaning: "two", difficulty: 1 },
      { word: "بد", transliteration: "bad", meaning: "bad", difficulty: 1 }
    ]
  },
  {
    id: "kaf",
    isolated: "ک",
    initial: "کـ",
    medial: "ـکـ",
    final: "ـک",
    nameEn: "kaf",
    nameFa: "کاف",
    pronunciation: "k",
    pronunciationSv: "som svenskt 'k' i 'katt'",
    exampleWords: [
      { word: "که", transliteration: "keh", meaning: "that", difficulty: 1 },
      { word: "یک", transliteration: "yek", meaning: "one", difficulty: 1 }
    ]
  },
  {
    id: "kheh",
    isolated: "خ",
    initial: "خـ",
    medial: "ـخـ",
    final: "ـخ",
    nameEn: "kheh",
    nameFa: "خه",
    pronunciation: "kh",
    pronunciationSv: "som 'ch' i tyska 'Bach' eller skotska 'loch'",
    exampleWords: [
      { word: "خوب", transliteration: "khub", meaning: "good", difficulty: 1 },
      { word: "خانه", transliteration: "khāneh", meaning: "house", difficulty: 2 }
    ]
  }
];