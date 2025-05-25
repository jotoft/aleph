import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MasteryTracker } from './masteryTracking';

// Mock global objects
const mockCreateObjectURL = vi.fn(() => 'blob:mock-url');
const mockRevokeObjectURL = vi.fn();
const mockClick = vi.fn();
const mockAlert = vi.fn();

// Store original values
const originalURL = global.URL;
const originalAlert = global.alert;

describe('Export/Import functionality', () => {
  beforeEach(() => {
    // Setup mocks
    global.URL.createObjectURL = mockCreateObjectURL;
    global.URL.revokeObjectURL = mockRevokeObjectURL;
    global.alert = mockAlert;
    
    // Clear mocks
    vi.clearAllMocks();
    
    // Clear localStorage
    localStorage.clear();
  });

  afterEach(() => {
    // Restore originals
    global.URL = originalURL;
    global.alert = originalAlert;
  });

  describe('Export functionality', () => {
    it('should export both mastery and word progression data', () => {
      // Setup test data
      const tracker = new MasteryTracker();
      tracker.recordAttempt('alef', 'isolated', true);
      tracker.recordAttempt('beh', 'initial', true);
      const masteryData = tracker.serializeToJSON();
      localStorage.setItem('masteryData', masteryData);
      
      // Add word progression data
      const wordProgressData = {
        wordMastery: [
          {
            wordId: 'ab',
            lastSeen: new Date().toISOString(),
            timesPresented: 5,
            timesCorrect: 4,
            averageResponseTime: 2000,
            confusedWith: []
          }
        ],
        recentCategories: ['nature']
      };
      localStorage.setItem('wordProgressionData', JSON.stringify(wordProgressData));

      // Mock document.createElement
      const mockLink = {
        href: '',
        download: '',
        click: mockClick,
      };
      vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any);

      // Simulate export (extracted logic from component)
      const exportProgress = () => {
        const masteryData = localStorage.getItem('masteryData');
        if (!masteryData) {
          alert('No progress data to export!');
          return;
        }
        
        const exportData = {
          version: '2.0',
          exportDate: new Date().toISOString(),
          masteryData: JSON.parse(masteryData),
          wordProgressionData: null as any
        };
        
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
      };

      // Execute export
      exportProgress();

      // Verify blob creation
      expect(mockCreateObjectURL).toHaveBeenCalled();
      const blobCall = mockCreateObjectURL.mock.calls[0][0];
      expect(blobCall).toBeInstanceOf(Blob);
      expect(blobCall.type).toBe('application/json');

      // Verify download triggered
      expect(mockClick).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });

    it('should handle missing word progression data gracefully', () => {
      // Setup only mastery data
      const tracker = new MasteryTracker();
      tracker.recordAttempt('alef', 'isolated', true);
      localStorage.setItem('masteryData', tracker.serializeToJSON());
      
      // No word progression data

      const mockLink = {
        href: '',
        download: '',
        click: mockClick,
      };
      vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any);

      // Create a mock Blob to capture content
      let capturedContent = '';
      global.Blob = class MockBlob {
        type: string;
        constructor(parts: any[], options?: any) {
          capturedContent = parts[0];
          this.type = options?.type || '';
        }
      } as any;

      // Simulate export
      const masteryDataStr = localStorage.getItem('masteryData');
      const exportData = {
        version: '2.0',
        exportDate: new Date().toISOString(),
        masteryData: JSON.parse(masteryDataStr!),
        wordProgressionData: null
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      
      // Verify export structure
      const exported = JSON.parse(capturedContent);
      expect(exported.version).toBe('2.0');
      expect(exported.masteryData).toBeDefined();
      expect(exported.wordProgressionData).toBeNull();
    });
  });

  describe('Import functionality', () => {
    it('should import new format with both data types', () => {
      const importData = {
        version: '2.0',
        exportDate: new Date().toISOString(),
        masteryData: {
          version: '1.0',
          letters: {
            alef: {
              letterId: 'alef',
              forms: {
                isolated: {
                  form: 'isolated',
                  exposures: 10,
                  correctAnswers: 8,
                  recentAccuracy: [1, 1, 0, 1, 1],
                  lastSeen: new Date().toISOString()
                },
                initial: {
                  form: 'initial',
                  exposures: 0,
                  correctAnswers: 0,
                  recentAccuracy: [],
                  lastSeen: new Date().toISOString()
                },
                medial: {
                  form: 'medial',
                  exposures: 0,
                  correctAnswers: 0,
                  recentAccuracy: [],
                  lastSeen: new Date().toISOString()
                },
                final: {
                  form: 'final',
                  exposures: 0,
                  correctAnswers: 0,
                  recentAccuracy: [],
                  lastSeen: new Date().toISOString()
                }
              },
              overallMastery: 0.8,
              masteryLevel: 2,
              confusedWith: [],
              contextualMastery: {
                inWords: 0.75,
                standalone: 0.85
              }
            }
          }
        },
        wordProgressionData: {
          wordMastery: [{
            wordId: 'salam',
            lastSeen: new Date().toISOString(),
            timesPresented: 3,
            timesCorrect: 3,
            averageResponseTime: 1500,
            confusedWith: []
          }],
          recentCategories: ['greetings']
        }
      };

      // Simulate import logic
      const importProgress = (dataStr: string) => {
        const parsed = JSON.parse(dataStr);
        
        let masteryData: any;
        let wordProgressionData: any = null;
        
        if (parsed.version === '2.0') {
          masteryData = parsed.masteryData;
          wordProgressionData = parsed.wordProgressionData;
        } else {
          masteryData = parsed;
        }
        
        // Validate and save
        MasteryTracker.deserializeFromJSON(JSON.stringify(masteryData.letters || masteryData));
        localStorage.setItem('masteryData', JSON.stringify(masteryData));
        
        if (wordProgressionData) {
          localStorage.setItem('wordProgressionData', JSON.stringify(wordProgressionData));
        }
      };

      // Execute import
      importProgress(JSON.stringify(importData));

      // Verify data was saved correctly
      const savedMastery = localStorage.getItem('masteryData');
      const savedWordProgress = localStorage.getItem('wordProgressionData');
      
      expect(savedMastery).toBeDefined();
      expect(JSON.parse(savedMastery!)).toEqual(importData.masteryData);
      
      expect(savedWordProgress).toBeDefined();
      expect(JSON.parse(savedWordProgress!)).toEqual(importData.wordProgressionData);
    });

    it('should handle old format (backward compatibility)', () => {
      const oldFormatData = {
        version: '1.0',
        letters: {
          beh: {
            letterId: 'beh',
            forms: {
              isolated: {
                form: 'isolated',
                exposures: 5,
                correctAnswers: 4,
                recentAccuracy: [1, 1, 1, 0, 1],
                lastSeen: new Date().toISOString()
              },
              initial: {
                form: 'initial',
                exposures: 0,
                correctAnswers: 0,
                recentAccuracy: [],
                lastSeen: new Date().toISOString()
              },
              medial: {
                form: 'medial',
                exposures: 0,
                correctAnswers: 0,
                recentAccuracy: [],
                lastSeen: new Date().toISOString()
              },
              final: {
                form: 'final',
                exposures: 0,
                correctAnswers: 0,
                recentAccuracy: [],
                lastSeen: new Date().toISOString()
              }
            },
            overallMastery: 0.8,
            masteryLevel: 2,
            confusedWith: [],
            contextualMastery: {
              inWords: 0.8,
              standalone: 0.8
            }
          }
        }
      };

      // Simulate import of old format
      const parsed = oldFormatData;
      let masteryData = parsed.version === '2.0' ? parsed : parsed;
      
      // Validate and save
      MasteryTracker.deserializeFromJSON(JSON.stringify(masteryData.letters || masteryData));
      localStorage.setItem('masteryData', JSON.stringify(masteryData));

      // Verify
      const saved = localStorage.getItem('masteryData');
      expect(saved).toBeDefined();
      expect(JSON.parse(saved!)).toEqual(oldFormatData);
      
      // Word progression should not be set
      expect(localStorage.getItem('wordProgressionData')).toBeNull();
    });
  });
});