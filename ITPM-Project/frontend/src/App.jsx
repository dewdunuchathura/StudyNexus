import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";
import AISummary from "./pages/AISummary.jsx";
import SummaryPage from "./pages/SummaryPage.jsx";
import RevisionNotesPage from "./pages/RevisionNotesPage.jsx";
import QuestionsPage from "./pages/QuestionsPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/ai-summary" element={<AISummary />} />
      <Route path="/summary" element={<SummaryPage />} />
      <Route path="/revision-notes" element={<RevisionNotesPage />} />
      <Route path="/questions" element={<QuestionsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
