# Persian Alphabet Learning App - Architecture & Development Guide

## Overview
This is a Vue 3 + TypeScript application for learning the Persian alphabet with an adaptive learning system that tracks mastery of individual letter forms and adjusts difficulty accordingly.

## Architecture

### Core Components

#### 1. **Data Layer** (`src/data/`)
- `persianLetters.ts` - Contains the Persian letter data structure with:
  - All letter forms (isolated, initial, medial, final)
  - English and Persian names
  - Pronunciation guides (including Swedish hints)
  - Example words with transliteration and meanings

#### 2. **Learning System** (`src/services/`)
- `masteryTracking.ts` - Tracks user progress:
  - Form-specific mastery (each letter form tracked separately)
  - Confusion pair detection
  - Weighted accuracy (70% recent, 30% overall)
  - Contextual mastery (standalone vs in-word)
  - Serialization for localStorage persistence

- `adaptiveQuestionGenerator.ts` - Generates questions based on mastery:
  - Prioritizes weak letters/forms
  - Uses confused letters as distractors
  - Adapts question types based on mastery level
  - Suggests new letters when ready

#### 3. **UI Components** (`src/components/`)
- `LetterDisplay.vue` - Shows letter with all forms and examples
- `QuizMode.vue` - Interactive quiz with multiple question types:
  - Letter recognition
  - Name to letter
  - Form recognition
  - Word context (identify letter in word)
- `MasteryProgress.vue` - Visual progress tracking

### Key Features
- **Dark mode** with persistent preference
- **Keyboard shortcuts** (1-4 for answers, Enter/Space for next)
- **Auto-progression** for correct answers (1.5s delay)
- **Infinite mode** for continuous practice
- **Spaced repetition** based on performance
- **High DPI optimized** layout

## Development Tips

### Running the App
```bash
npm install
npm run dev      # Development server
npm run build    # Production build
npm test         # Run tests
```

### Adding New Letters
1. Add letter data to `src/data/persianLetters.ts`:
```typescript
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
    { word: "پدر", transliteration: "pedar", meaning: "father", difficulty: 1 }
  ]
}
```

2. Group similar letters for the progression system (in future implementation)

### Modifying Quiz Logic
- Question generation: Edit `AdaptiveQuestionGenerator.generateQuestion()`
- Add new question types: 
  1. Add type to `QuizType` in `adaptiveQuestionGenerator.ts`
  2. Implement generation in `createQuestion()`
  3. Add UI in `QuizMode.vue`

### Customizing Mastery Thresholds
Edit in `masteryTracking.ts`:
```typescript
private readonly MASTERY_THRESHOLDS = {
  LEARNING: 0,
  FAMILIAR: 0.6,
  PROFICIENT: 0.8,
  MASTERED: 0.95
}
```

### Testing
- Unit tests use Vitest
- Test files follow pattern `*.test.ts`
- Run specific test: `npm test filename.test.ts`

### State Management
- No Vuex/Pinia - uses Vue composition API
- Mastery data persisted to localStorage
- Progress refreshes on window focus

### Styling
- Scoped styles in Vue components
- Dark mode uses `.dark` class on root
- Persian text uses Vazir font (loaded from CDN)
- Responsive breakpoints mainly removed (optimized for laptop)

#### RTL Text Considerations
When highlighting or styling individual Persian/Arabic letters:
- **Never add padding** - it breaks letter connections
- **Never change font-weight** - it disrupts text shaping
- **Use `dir="rtl"`** on container elements for proper text flow
- **Color changes only** for highlighting individual letters
- **Dynamically generated content** (via v-html) needs global styles or `:deep()` selector

Example of safe highlighting:
```css
/* Global style block for dynamic content */
<style>
.word-persian mark {
  background-color: transparent;
  color: #dc2626;
  /* NO padding, margin, font-weight, or border */
}
</style>
```

Common pitfalls that break Persian text rendering:
- Wrapping individual letters in elements with padding/margin
- Changing font properties mid-word
- Using borders or outlines on inline elements
- Not setting proper RTL direction

## Common Tasks

### Reset Progress
In browser console:
```javascript
localStorage.removeItem('masteryData');
localStorage.removeItem('quizProgress');
```

### Debug Mastery Data
In browser console:
```javascript
const data = JSON.parse(localStorage.getItem('masteryData'));
console.log(data);
```

### Add Swedish Pronunciation Hints
When adding letters, include Swedish comparisons that are more accurate than English:
- Use Swedish words as reference: "som 'x' i 'svenskt ord'"
- Note special Swedish sounds that match Persian better

### Letter Progression System (Implemented)
The app uses an adaptive progression system that introduces new letters based on mastery:

1. **Starts with 5 core letters**: alef (ا), beh (ب), sin (س), mim (م), dal (د)
2. **Unlocks new groups when ready**: 
   - Requires 70% average accuracy on current letters
   - Each letter needs at least 5 practice attempts
   - At least 80% of active letters must be practiced
3. **Progression groups**:
   - Group 1: Most distinct letters (alef, beh, sin, mim, dal)
   - Group 2: Common letters (nun, lam, reh, yeh, vav)
   - Group 3: Letters with dots (teh, peh, jim, cheh)
   - Group 4: Complex shapes (kaf, heh, ain, ghain)
   - Group 5: Similar pairs (zeh, zheh, sad, zad)
   - Group 6: Less common (kheh, shin, feh, qaf)
   - Group 7: Remaining letters
4. **Prevents overload**: Won't add new letters if struggling with current ones

## Architecture Decisions

### Why Form-Specific Tracking?
Persian letters change significantly between forms. A learner might recognize ه (isolated) but struggle with هـ (initial) because they look very different.

### Why Confusion Tracking?
The algorithm uses actual mistakes to create better distractors. If you confuse ب with پ, the system will use these as distractors for each other more often.

### Why Not Use a State Management Library?
The app is simple enough that Vue's reactivity system handles state well. The only persistent state is mastery data, which is cleanly encapsulated in the MasteryTracker class.

## Future Enhancements
- [ ] Complete letter set (32 letters total)
- [ ] Audio pronunciation
- [ ] Writing practice with touch/mouse input  
- [ ] Word building exercises
- [ ] Sentence reading practice
- [ ] Gamification (achievements, streaks)
- [ ] Export/import progress
- [ ] Multiple user profiles

## Troubleshooting

### Build Errors
- Check TypeScript errors: `npm run build`
- Ensure all imports use correct paths
- Watch for circular dependencies

### Quiz Not Adapting
- Check if mastery data is saving: Look for 'masteryData' in localStorage
- Verify question generator config has correct letter IDs
- Check browser console for errors

### Dark Mode Issues
- Ensure `.dark` class is on app root
- Check that component uses `:global(.dark)` for child selectors
- Verify dark mode styles exist for new components

### Known Issues
- **iOS Letter Highlighting**: In word context questions, highlighted Persian letters may appear disconnected on iOS browsers (Safari, Firefox, and others) despite proper CSS resets. The issue doesn't occur in desktop browsers. This appears to be related to iOS's WebKit rendering engine (all iOS browsers use WebKit) and how it handles inline elements within RTL text.