import React from "react";
import SummaryShell from "../components/SummaryShell.jsx";
import { useLectureSummary } from "../context/LectureSummaryContext.jsx";

function QuestionsPage() {
  const { content, document, clearDocument, summaryRecord } = useLectureSummary();
  const questions = content?.questions || [];
  const hasContent = questions.length > 0;

  return (
    <SummaryShell note="Questions page shows only the generated questions from the uploaded lecture file.">
      <header className="summary-header">
        <div className="brand">
          <div className="brand-mark">AI</div>
          <div>
            <p>Lecture Summary Studio</p>
            <span>Questions</span>
          </div>
        </div>
        <div className="header-actions">
          <button type="button" className="ghost-btn" onClick={clearDocument} disabled={!document && !summaryRecord}>
            Clear file
          </button>
        </div>
      </header>

      <main className="summary-page">
        <section className="stack-card">
          <div className="section-title">
            <p>Questions</p>
            <span>Generated from the uploaded lecture file</span>
          </div>
          {hasContent ? (
            <div className="question-list">
              {questions.map((question, index) => (
                <div className="question-card" key={question}>
                  <span>Q{index + 1}</span>
                  <p>{question}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-message">Upload a lecture file to generate questions.</p>
          )}
        </section>
      </main>
    </SummaryShell>
  );
}

export default QuestionsPage;
