export type Page = 'dashboard' | 'library' | 'flashcards' | 'quiz' | 'add';

export type NewWord = {
  word: string;
  pronunciation: string;
  part_of_speech: string;
  meaning_vi: string;
  example_en: string;
  example_vi: string;
  category: string;
  level: string;
};

export type Word = {
  id: string;
  word: string;
  pronunciation: string | null;
  part_of_speech: string | null;
  meaning_vi: string;
  example_en: string | null;
  example_vi: string | null;
  category: string;
  level: string;
  image_url: string | null;
};

export type Progress = {
  id?: string;
  word_id: string;
  status: 'new' | 'learning' | 'mastered';
  review_count: number;
  correct_count: number;
  last_reviewed_at?: string | null;
};
