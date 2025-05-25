import { describe, it, expect } from 'vitest';
import { PersianWordAnalyzer } from './wordAnalyzer';

describe('PersianWordAnalyzer', () => {
  let analyzer: PersianWordAnalyzer;
  
  beforeEach(() => {
    analyzer = new PersianWordAnalyzer();
  });
  
  describe('analyzeWord', () => {
    it('should correctly analyze the word "سلام"', () => {
      const result = analyzer.analyzeWord('سلام');
      
      expect(result.letters).toHaveLength(4);
      expect(result.letters[0]).toEqual({
        letterId: 'sin',
        form: 'initial',
        position: 0,
        character: 'سـ'
      });
      expect(result.letters[1]).toEqual({
        letterId: 'lam',
        form: 'medial',
        position: 1,
        character: 'ـلـ'
      });
      expect(result.letters[2]).toEqual({
        letterId: 'alef',
        form: 'medial',
        position: 2,
        character: 'ـا'
      });
      expect(result.letters[3]).toEqual({
        letterId: 'mim',
        form: 'final',
        position: 3,
        character: 'ـم'
      });
    });
    
    it('should correctly analyze the word "آبی"', () => {
      const result = analyzer.analyzeWord('آبی');
      
      expect(result.letters).toHaveLength(3);
      expect(result.letters[0]).toEqual({
        letterId: 'alef',
        form: 'isolated',
        position: 0,
        character: 'آ'
      });
      expect(result.letters[1]).toEqual({
        letterId: 'beh',
        form: 'medial',
        position: 1,
        character: 'ـب'
      });
      expect(result.letters[2]).toEqual({
        letterId: 'yeh',
        form: 'isolated',
        position: 2,
        character: 'ی'
      });
    });
    
    it('should correctly analyze the word "کتاب"', () => {
      const result = analyzer.analyzeWord('کتاب');
      
      expect(result.letters).toHaveLength(4);
      expect(result.letters[0]).toEqual({
        letterId: 'kaf',
        form: 'initial',
        position: 0,
        character: 'کـ'
      });
      expect(result.letters[1]).toEqual({
        letterId: 'teh',
        form: 'medial',
        position: 1,
        character: 'ـتـ'
      });
      expect(result.letters[2]).toEqual({
        letterId: 'alef',
        form: 'medial',
        position: 2,
        character: 'ـا'
      });
      expect(result.letters[3]).toEqual({
        letterId: 'beh',
        form: 'final',
        position: 3,
        character: 'ـب'
      });
    });
    
    it('should correctly analyze the word "من"', () => {
      const result = analyzer.analyzeWord('من');
      
      expect(result.letters).toHaveLength(2);
      expect(result.letters[0]).toEqual({
        letterId: 'mim',
        form: 'initial',
        position: 0,
        character: 'مـ'
      });
      expect(result.letters[1]).toEqual({
        letterId: 'nun',
        form: 'final',
        position: 1,
        character: 'ـن'
      });
    });
    
    it('should correctly analyze the word "روز"', () => {
      const result = analyzer.analyzeWord('روز');
      
      expect(result.letters).toHaveLength(3);
      expect(result.letters[0]).toEqual({
        letterId: 'reh',
        form: 'isolated',
        position: 0,
        character: 'ر'
      });
      expect(result.letters[1]).toEqual({
        letterId: 'vav',
        form: 'medial',
        position: 1,
        character: 'ـو'
      });
      expect(result.letters[2]).toEqual({
        letterId: 'zeh',
        form: 'final',
        position: 2,
        character: 'ـز'
      });
    });
  });
  
  describe('findLetterOccurrences', () => {
    it('should find all occurrences of a letter in a word', () => {
      const occurrences = analyzer.findLetterOccurrences('نان', 'nun');
      
      expect(occurrences).toHaveLength(2);
      expect(occurrences[0].position).toBe(0);
      expect(occurrences[0].form).toBe('initial');
      expect(occurrences[1].position).toBe(2);
      expect(occurrences[1].form).toBe('final');
    });
    
    it('should find only occurrences with specific form', () => {
      const occurrences = analyzer.findLetterOccurrences('نان', 'nun', 'final');
      
      expect(occurrences).toHaveLength(1);
      expect(occurrences[0].position).toBe(2);
      expect(occurrences[0].form).toBe('final');
    });
    
    it('should return empty array if letter not found', () => {
      const occurrences = analyzer.findLetterOccurrences('سلام', 'beh');
      
      expect(occurrences).toHaveLength(0);
    });
  });
});