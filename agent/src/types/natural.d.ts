declare module 'natural' {
  export const PorterStemmerPt: {
    stem: (word: string) => string;
    tokenizeAndStem: (text: string) => string[];
  };
  
  export class WordTokenizer {
    tokenize(text: string): string[];
  }
  
  export class SentenceTokenizer {
    tokenize(text: string): string[];
  }
  
  export class TfIdf {
    addDocument(document: string): void;
    tfidfs(searchTerm: string): number[];
    listTerms(documentIndex: number): Array<{ term: string; tfidf: number }>;
  }
  
  export const LevenshteinDistance: {
    compute: (str1: string, str2: string) => number;
  };
} 