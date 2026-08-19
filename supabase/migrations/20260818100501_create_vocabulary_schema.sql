/*
# Create vocabulary learning schema (single-tenant, no auth)

1. New Tables
- `words`: stores English vocabulary words with Vietnamese meanings
  - `id` (uuid, primary key)
  - `word` (text, the English word)
  - `pronunciation` (text, IPA pronunciation)
  - `part_of_speech` (text, e.g. noun, verb, adjective)
  - `meaning_vi` (text, Vietnamese translation)
  - `example_en` (text, example sentence in English)
  - `example_vi` (text, example sentence translated to Vietnamese)
  - `image_url` (text, optional image for the word)
  - `created_at` (timestamp)
- `progress`: tracks the learner's progress on each word
  - `id` (uuid, primary key)
  - `word_id` (uuid, foreign key to words)
  - `status` (text: 'new', 'learning', 'mastered')
  - `review_count` (int, number of times reviewed)
  - `correct_count` (int, number of correct answers in quizzes)
  - `last_reviewed_at` (timestamp)
  - `created_at` (timestamp)
  - `updated_at` (timestamp)

2. Security
- Enable RLS on both tables.
- Allow anon + authenticated CRUD because this is a single-tenant shared learning app with no sign-in.
*/

CREATE TABLE IF NOT EXISTS words (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  word text NOT NULL,
  pronunciation text,
  part_of_speech text,
  meaning_vi text NOT NULL,
  example_en text,
  example_vi text,
  image_url text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  word_id uuid NOT NULL REFERENCES words(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'new',
  review_count integer NOT NULL DEFAULT 0,
  correct_count integer NOT NULL DEFAULT 0,
  last_reviewed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(word_id)
);

CREATE INDEX IF NOT EXISTS idx_progress_status ON progress(status);
CREATE INDEX IF NOT EXISTS idx_progress_word_id ON progress(word_id);

ALTER TABLE words ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_words" ON words;
CREATE POLICY "anon_select_words" ON words FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_words" ON words;
CREATE POLICY "anon_insert_words" ON words FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_words" ON words;
CREATE POLICY "anon_update_words" ON words FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_words" ON words;
CREATE POLICY "anon_delete_words" ON words FOR DELETE
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_progress" ON progress;
CREATE POLICY "anon_select_progress" ON progress FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_progress" ON progress;
CREATE POLICY "anon_insert_progress" ON progress FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_progress" ON progress;
CREATE POLICY "anon_update_progress" ON progress FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_progress" ON progress;
CREATE POLICY "anon_delete_progress" ON progress FOR DELETE
  TO anon, authenticated USING (true);