import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { NewWord, Progress, Word } from '@/types';

interface VocabularyContextType {
  words: Word[];
  progress: Progress[];
  loading: boolean;
  error: string;
  setError: (err: string) => void;
  progressMap: Map<string, Progress>;
  mastered: number;
  learning: number;
  studiedToday: number;
  accuracy: number;
  toast: string;
  showToast: (msg: string) => void;
  addWord: (input: NewWord) => Promise<Word>;
  updateWord: (id: string, input: NewWord) => Promise<Word>;
  deleteWord: (id: string) => Promise<void>;
  updateWordProgress: (word: Word, correct: boolean) => Promise<void>;

  // Trạng thái modal toàn cục
  selectedWord: Word | null;
  setSelectedWord: (word: Word | null) => void;
  editingWord: Word | null;
  setEditingWord: (word: Word | null) => void;
  deletingWord: Word | null;
  setDeletingWord: (word: Word | null) => void;
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
}

const VocabularyContext = createContext<VocabularyContextType | undefined>(undefined);

export function VocabularyProvider({ children }: { children: React.ReactNode }) {
  const [words, setWords] = useState<Word[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  // Modal states
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [editingWord, setEditingWord] = useState<Word | null>(null);
  const [deletingWord, setDeletingWord] = useState<Word | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    async function load() {
      const [wordsResult, progressResult] = await Promise.all([
        supabase.from('words').select('*').order('created_at'),
        supabase.from('progress').select('*'),
      ]);
      if (wordsResult.error || progressResult.error) {
        setError('Không thể tải dữ liệu. Vui lòng thử lại.');
      } else {
        setWords((wordsResult.data ?? []) as Word[]);
        setProgress((progressResult.data ?? []) as Progress[]);
      }
      setLoading(false);
    }
    void load();
  }, []);

  const progressMap = useMemo(() => new Map(progress.map((item) => [item.word_id, item])), [progress]);
  const mastered = progress.filter((item) => item.status === 'mastered').length;
  const learning = progress.filter((item) => item.status === 'learning').length;
  const studiedToday = progress.filter(
    (item) => item.last_reviewed_at && new Date(item.last_reviewed_at).toDateString() === new Date().toDateString()
  ).length;
  const accuracy = progress.length
    ? Math.round(
        (progress.reduce((sum, item) => sum + (item.review_count ? item.correct_count / item.review_count : 0), 0) /
          progress.length) *
          100
      )
    : 0;

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(''), 2600);
  }

  async function updateWordProgress(word: Word, correct: boolean) {
    const old = progressMap.get(word.id);
    const reviewCount = (old?.review_count ?? 0) + 1;
    const correctCount = (old?.correct_count ?? 0) + (correct ? 1 : 0);
    const next: Progress = {
      word_id: word.id,
      review_count: reviewCount,
      correct_count: correctCount,
      status: correctCount >= 3 ? 'mastered' : 'learning',
      last_reviewed_at: new Date().toISOString(),
    };
    setProgress((current) => [...current.filter((item) => item.word_id !== word.id), next]);
    const { error: saveError } = await supabase.from('progress').upsert(next, { onConflict: 'word_id' });
    if (saveError) setError('Chưa lưu được tiến độ của bạn.');
  }

  async function addWord(input: NewWord) {
    const payload = {
      word: input.word.trim(),
      pronunciation: input.pronunciation.trim() || null,
      part_of_speech: input.part_of_speech.trim() || null,
      meaning_vi: input.meaning_vi.trim(),
      example_en: input.example_en.trim() || null,
      example_vi: input.example_vi.trim() || null,
    };
    const { data, error: insertError } = await supabase.from('words').insert(payload).select().single();
    if (insertError) throw insertError;
    const created = data as Word;
    setWords((current) => [created, ...current]);
    return created;
  }

  async function updateWord(id: string, input: NewWord) {
    const payload = {
      word: input.word.trim(),
      pronunciation: input.pronunciation.trim() || null,
      part_of_speech: input.part_of_speech.trim() || null,
      meaning_vi: input.meaning_vi.trim(),
      example_en: input.example_en.trim() || null,
      example_vi: input.example_vi.trim() || null,
    };
    const { data, error: updateError } = await supabase.from('words').update(payload).eq('id', id).select().single();
    if (updateError) throw updateError;
    const updated = data as Word;
    setWords((current) => current.map((w) => (w.id === id ? updated : w)));
    if (selectedWord?.id === id) {
      setSelectedWord(updated);
    }
    return updated;
  }

  async function deleteWord(id: string) {
    const { error: deleteError } = await supabase.from('words').delete().eq('id', id);
    if (deleteError) throw deleteError;
    setWords((current) => current.filter((w) => w.id !== id));
    setProgress((current) => current.filter((p) => p.word_id !== id));
    if (selectedWord?.id === id) {
      setSelectedWord(null);
    }
  }

  return (
    <VocabularyContext.Provider
      value={{
        words,
        progress,
        loading,
        error,
        setError,
        progressMap,
        mastered,
        learning,
        studiedToday,
        accuracy,
        toast,
        showToast,
        addWord,
        updateWord,
        deleteWord,
        updateWordProgress,
        selectedWord,
        setSelectedWord,
        editingWord,
        setEditingWord,
        deletingWord,
        setDeletingWord,
        isAddModalOpen,
        setIsAddModalOpen,
      }}
    >
      {children}
    </VocabularyContext.Provider>
  );
}

export function useVocabulary() {
  const context = useContext(VocabularyContext);
  if (!context) {
    throw new Error('useVocabulary must be used within a VocabularyProvider');
  }
  return context;
}
