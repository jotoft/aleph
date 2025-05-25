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
  },
  // Group 2: Similar to existing letters
  {
    id: "peh",
    isolated: "پ",
    initial: "پـ",
    medial: "ـپـ",
    final: "ـپ",
    nameEn: "peh",
    nameFa: "په",
    pronunciation: "p",
    pronunciationSv: "som svenskt 'p' i 'pappa'",
    exampleWords: [
      { word: "پدر", transliteration: "pedar", meaning: "father", difficulty: 1 },
      { word: "پنج", transliteration: "panj", meaning: "five", difficulty: 1 }
    ]
  },
  {
    id: "jim",
    isolated: "ج",
    initial: "جـ",
    medial: "ـجـ",
    final: "ـج",
    nameEn: "jim",
    nameFa: "جیم",
    pronunciation: "j",
    pronunciationSv: "som engelska 'j' i 'jump'",
    exampleWords: [
      { word: "جان", transliteration: "jān", meaning: "soul/life", difficulty: 1 },
      { word: "جدید", transliteration: "jadid", meaning: "new", difficulty: 2 }
    ]
  },
  {
    id: "cheh",
    isolated: "چ",
    initial: "چـ",
    medial: "ـچـ",
    final: "ـچ",
    nameEn: "cheh",
    nameFa: "چه",
    pronunciation: "ch",
    pronunciationSv: "som 'tj' i 'tjugo'",
    exampleWords: [
      { word: "چه", transliteration: "che", meaning: "what", difficulty: 1 },
      { word: "چهار", transliteration: "chahār", meaning: "four", difficulty: 1 }
    ]
  },
  {
    id: "theh",
    isolated: "ث",
    initial: "ثـ",
    medial: "ـثـ",
    final: "ـث",
    nameEn: "theh",
    nameFa: "ثه",
    pronunciation: "s (th)",
    pronunciationSv: "som 's' (historiskt 'th' som i engelska 'think')",
    exampleWords: [
      { word: "ثانیه", transliteration: "sāniye", meaning: "second", difficulty: 2 },
      { word: "ثبت", transliteration: "sabt", meaning: "registration", difficulty: 2 }
    ]
  },
  {
    id: "heh-jimi",
    isolated: "ح",
    initial: "حـ",
    medial: "ـحـ",
    final: "ـح",
    nameEn: "heh-jimi",
    nameFa: "حه",
    pronunciation: "h (guttural)",
    pronunciationSv: "djupt 'h' från halsen",
    exampleWords: [
      { word: "حال", transliteration: "hāl", meaning: "condition/state", difficulty: 1 },
      { word: "صبح", transliteration: "sobh", meaning: "morning", difficulty: 2 }
    ]
  },
  // Group 3: Letters with dots below
  {
    id: "zheh",
    isolated: "ژ",
    initial: "ژ",
    medial: "ـژ",
    final: "ـژ",
    nameEn: "zheh",
    nameFa: "ژه",
    pronunciation: "zh",
    pronunciationSv: "som 'j' i franska 'jour'",
    exampleWords: [
      { word: "ژاپن", transliteration: "zhāpon", meaning: "Japan", difficulty: 1 },
      { word: "ژله", transliteration: "zhele", meaning: "jelly", difficulty: 1 }
    ]
  },
  // Group 4: Different shapes
  {
    id: "shin",
    isolated: "ش",
    initial: "شـ",
    medial: "ـشـ",
    final: "ـش",
    nameEn: "shin",
    nameFa: "شین",
    pronunciation: "sh",
    pronunciationSv: "som 'sj' i 'sjö'",
    exampleWords: [
      { word: "شما", transliteration: "shomā", meaning: "you (formal)", difficulty: 1 },
      { word: "شب", transliteration: "shab", meaning: "night", difficulty: 1 }
    ]
  },
  {
    id: "sad",
    isolated: "ص",
    initial: "صـ",
    medial: "ـصـ",
    final: "ـص",
    nameEn: "sad",
    nameFa: "صاد",
    pronunciation: "s (emphatic)",
    pronunciationSv: "tjockt 's' (emfatiskt)",
    exampleWords: [
      { word: "صبح", transliteration: "sobh", meaning: "morning", difficulty: 1 },
      { word: "صدا", transliteration: "sedā", meaning: "sound/voice", difficulty: 1 }
    ]
  },
  {
    id: "zad",
    isolated: "ض",
    initial: "ضـ",
    medial: "ـضـ",
    final: "ـض",
    nameEn: "zad",
    nameFa: "ضاد",
    pronunciation: "z (emphatic)",
    pronunciationSv: "tjockt 'z' (emfatiskt)",
    exampleWords: [
      { word: "ضرب", transliteration: "zarb", meaning: "multiplication", difficulty: 2 },
      { word: "ضعیف", transliteration: "za'if", meaning: "weak", difficulty: 2 }
    ]
  },
  {
    id: "tah",
    isolated: "ط",
    initial: "طـ",
    medial: "ـطـ",
    final: "ـط",
    nameEn: "tah",
    nameFa: "طا",
    pronunciation: "t (emphatic)",
    pronunciationSv: "tjockt 't' (emfatiskt)",
    exampleWords: [
      { word: "طلا", transliteration: "talā", meaning: "gold", difficulty: 1 },
      { word: "وسط", transliteration: "vasat", meaning: "middle", difficulty: 2 }
    ]
  },
  {
    id: "zah",
    isolated: "ظ",
    initial: "ظـ",
    medial: "ـظـ",
    final: "ـظ",
    nameEn: "zah",
    nameFa: "ظا",
    pronunciation: "z (emphatic)",
    pronunciationSv: "tjockt 'z' (emfatiskt)",
    exampleWords: [
      { word: "ظهر", transliteration: "zohr", meaning: "noon", difficulty: 1 },
      { word: "لفظ", transliteration: "lafz", meaning: "word/pronunciation", difficulty: 2 }
    ]
  },
  {
    id: "ain",
    isolated: "ع",
    initial: "عـ",
    medial: "ـعـ",
    final: "ـع",
    nameEn: "ain",
    nameFa: "عین",
    pronunciation: "' (pharyngeal)",
    pronunciationSv: "djupt gutturalt ljud (svårt för svenskar)",
    exampleWords: [
      { word: "عشق", transliteration: "'eshq", meaning: "love", difficulty: 1 },
      { word: "ساعت", transliteration: "sā'at", meaning: "hour/clock", difficulty: 2 }
    ]
  },
  {
    id: "ghain",
    isolated: "غ",
    initial: "غـ",
    medial: "ـغـ",
    final: "ـغ",
    nameEn: "ghain",
    nameFa: "غین",
    pronunciation: "gh",
    pronunciationSv: "gurglande 'r' (som franska 'r')",
    exampleWords: [
      { word: "غذا", transliteration: "ghazā", meaning: "food", difficulty: 1 },
      { word: "باغ", transliteration: "bāgh", meaning: "garden", difficulty: 1 }
    ]
  },
  {
    id: "feh",
    isolated: "ف",
    initial: "فـ",
    medial: "ـفـ",
    final: "ـف",
    nameEn: "feh",
    nameFa: "فه",
    pronunciation: "f",
    pronunciationSv: "som svenskt 'f' i 'fika'",
    exampleWords: [
      { word: "فارسی", transliteration: "fārsi", meaning: "Persian", difficulty: 1 },
      { word: "نصف", transliteration: "nesf", meaning: "half", difficulty: 2 }
    ]
  },
  {
    id: "qaf",
    isolated: "ق",
    initial: "قـ",
    medial: "ـقـ",
    final: "ـق",
    nameEn: "qaf",
    nameFa: "قاف",
    pronunciation: "q (gh)",
    pronunciationSv: "djupt 'k' från halsen",
    exampleWords: [
      { word: "قلب", transliteration: "qalb", meaning: "heart", difficulty: 1 },
      { word: "قیمت", transliteration: "qeymat", meaning: "price", difficulty: 2 }
    ]
  },
  {
    id: "gaf",
    isolated: "گ",
    initial: "گـ",
    medial: "ـگـ",
    final: "ـگ",
    nameEn: "gaf",
    nameFa: "گاف",
    pronunciation: "g",
    pronunciationSv: "som svenskt 'g' i 'gå'",
    exampleWords: [
      { word: "گل", transliteration: "gol", meaning: "flower", difficulty: 1 },
      { word: "بزرگ", transliteration: "bozorg", meaning: "big", difficulty: 1 }
    ]
  },
  // Special letter
  {
    id: "hamzeh",
    isolated: "ء",
    initial: "ء",
    medial: "ء",
    final: "ء",
    nameEn: "hamzeh",
    nameFa: "همزه",
    pronunciation: "' (glottal stop)",
    pronunciationSv: "kort paus (som i 'uh-oh')",
    exampleWords: [
      { word: "مأمور", transliteration: "ma'mur", meaning: "officer", difficulty: 2 },
      { word: "سؤال", transliteration: "so'āl", meaning: "question", difficulty: 2 }
    ]
  }
];