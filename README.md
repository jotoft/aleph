# Aleph - Persian Alphabet Learning App

An adaptive learning web application for mastering the Persian alphabet, featuring intelligent spaced repetition and form-specific tracking.

🚀 **[Try it live](https://jotoft.github.io/aleph/)**

## Features

### 🎯 Adaptive Learning System
- **Smart progression**: Starts with 5 core letters, gradually unlocks all 32 Persian letters
- **Form-specific tracking**: Separately tracks mastery of isolated, initial, medial, and final forms
- **Confusion detection**: Identifies which letters you mix up and uses them as smart distractors
- **Spaced repetition**: Prioritizes letters you struggle with

### 📚 Study Modes
- **Letter Display**: View all forms of each letter with example words
- **Practice Quiz**: Multiple question types:
  - Letter recognition
  - Name to letter matching
  - Form identification
  - Letters in context (word examples)
- **Progress Tracking**: Visual mastery indicators for each letter and form

### 🎨 User Experience
- **Dark mode** with persistent preference
- **Keyboard shortcuts** (1-4 for answers, Enter/Space to continue)
- **Swedish pronunciation hints** for Swedish speakers
- **High DPI optimized** layout
- **RTL text rendering** with proper letter connections

### 💾 Data Management
- **Export Progress**: Download your learning data as a JSON file
- **Import Progress**: Restore your progress on any device
- **Date-stamped exports**: Each export includes the date in the filename
- **Progress portability**: Easy transfer between local and online versions

## Technology Stack

- **Vue 3** with Composition API
- **TypeScript** for type safety
- **Vite** for fast development and building
- **Vitest** for unit testing
- **No external state management** - uses Vue's reactivity system
- **localStorage** for progress persistence

## Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/jotoft/aleph.git
cd aleph

# Install dependencies
npm install

# Start development server
npm run dev
```

### Building for Production
```bash
npm run build
```

### Running Tests
```bash
npm test
```

## How It Works

The app uses an intelligent progression system that unlocks letters based on your mastery:

1. **Start with 5 core letters**: alef (ا), beh (ب), sin (س), mim (م), dal (د)
2. **Unlock new groups as you improve**:
   - Group 2: nun (ن), lam (ل), reh (ر), yeh (ی), vav (و)
   - Group 3: teh (ت), peh (پ), jim (ج), cheh (چ)
   - Group 4: kaf (ک), heh (ه), ain (ع), ghain (غ)
   - And 3 more groups...

**New letters unlock when**:
- You achieve 70%+ accuracy on current letters
- Each letter has been practiced at least 5 times
- At least 80% of active letters have been practiced

Each letter form (isolated, initial, medial, final) is tracked separately because Persian letters change significantly between positions. The system won't overwhelm you - if you're struggling, it waits until you're ready before adding new letters.

## Migrating Your Progress

To transfer your progress (e.g., from local development to the online version):

1. **Export from your current version**:
   - Go to the Progress page
   - Scroll to "Data Management" 
   - Click "Export Progress"
   - Save the JSON file

2. **Import to the new version**:
   - Go to the Progress page
   - Click "Import Progress"
   - Select your saved JSON file
   - Your progress will be restored instantly

This is especially useful when moving from `localhost` to the GitHub Pages version at https://jotoft.github.io/aleph/

## Development Guide

See [CLAUDE.md](./CLAUDE.md) for detailed architecture documentation and development tips.

## Deployment

The app automatically deploys to GitHub Pages when you push to the master branch. See [DEPLOY.md](./DEPLOY.md) for deployment details.

## License

MIT License, feel free to use this for your own learning projects!
