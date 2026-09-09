import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { VocabularyProvider } from '@/context/VocabularyContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { DashboardPage } from '@/pages/DashboardPage';
import { LibraryPage } from '@/pages/LibraryPage';
import { FlashcardsPage } from '@/pages/FlashcardsPage';
import { QuizPage } from '@/pages/QuizPage';
import { AddWordPage } from '@/pages/AddWordPage';

export default function App() {
  return (
    <BrowserRouter>
      <VocabularyProvider>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="library" element={<LibraryPage />} />
            <Route path="flashcards" element={<FlashcardsPage />} />
            <Route path="quiz" element={<QuizPage />} />
            <Route path="add" element={<AddWordPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </VocabularyProvider>
    </BrowserRouter>
  );
}
