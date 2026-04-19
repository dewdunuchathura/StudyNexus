import React, { useState } from "react";
import SummaryShell from "../components/SummaryShell.jsx";
import { useLectureSummary } from "../context/LectureSummaryContext.jsx";

const STYLES = `
  .qp-progress-wrap {
    margin-bottom: 1.15rem;
  }

  .qp-progress-labels {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    font-size: 11.5px;
    color: var(--ink-35);
    margin-bottom: 7px;
    font-weight: 400;
  }

  .qp-progress-track {
    height: 6px;
    background: var(--blue-100);
    border-radius: 3px;
    overflow: hidden;
  }

  .qp-progress-fill {
    height: 100%;
    border-radius: 3px;
    background: linear-gradient(90deg, var(--blue-500), var(--blue-400));
    transition: width 0.35s ease;
  }

  .qp-progress-fill.all-done {
    background: linear-gradient(90deg, #22c55e, #4ade80);
  }

  .qp-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .qp-card {
    border-radius: 14px;
    background: var(--white);
    border: 1px solid var(--blue-100);
    box-shadow: var(--shadow-sm);
    overflow: hidden;
    transition: box-shadow 0.2s, transform 0.2s, border-color 0.2s;
  }

  .qp-card:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-1px);
    border-color: var(--blue-200);
  }

  .qp-card.reviewed {
    border-color: rgba(34,197,94,0.28);
    background: linear-gradient(135deg, rgba(34,197,94,0.03), var(--white));
  }

  .qp-card.reviewed:hover {
    border-color: rgba(34,197,94,0.44);
    box-shadow: 0 4px 16px rgba(34,197,94,0.10);
  }

  .qp-body {
    padding: 15px 18px;
    display: flex;
    gap: 13px;
    align-items: flex-start;
  }

  .qp-badge {
    flex-shrink: 0;
    padding: 3.5px 10px;
    border-radius: 6px;
    background: rgba(59,130,246,0.10);
    border: 1px solid rgba(59,130,246,0.22);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.07em;
    color: var(--blue-700);
    margin-top: 3px;
    transition: background 0.18s, border-color 0.18s, color 0.18s;
  }

  .qp-card.reviewed .qp-badge {
    background: rgba(34,197,94,0.10);
    border-color: rgba(34,197,94,0.22);
    color: #16a34a;
  }

  .qp-body p {
    font-size: 14.5px;
    color: var(--ink-80);
    line-height: 1.78;
    font-weight: 400;
  }

  .qp-footer {
    padding: 8px 18px 11px;
    background: var(--blue-25);
    border-top: 1px solid var(--blue-50);
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .qp-card.reviewed .qp-footer {
    background: rgba(34,197,94,0.04);
    border-top-color: rgba(34,197,94,0.10);
  }

  .qp-btn {
    font-family: 'Outfit', sans-serif;
    font-size: 11.5px;
    font-weight: 500;
    padding: 5px 13px;
    border-radius: 7px;
    cursor: pointer;
    transition: all 0.18s;
  }

  .qp-btn-mark {
    border: 1px solid rgba(34,197,94,0.28);
    background: rgba(34,197,94,0.08);
    color: #16a34a;
  }

  .qp-btn-mark:hover {
    background: rgba(34,197,94,0.16);
    border-color: rgba(34,197,94,0.42);
  }

  .qp-card.reviewed .qp-btn-mark {
    background: var(--blue-50);
    border-color: var(--blue-200);
    color: var(--blue-600);
  }

  .qp-card.reviewed .qp-btn-mark:hover {
    background: var(--blue-100);
  }

  .qp-done-banner {
    text-align: center;
    padding: 1.6rem 1rem;
    border-radius: 12px;
    background: linear-gradient(135deg, rgba(34,197,94,0.07), rgba(34,197,94,0.03));
    border: 1px solid rgba(34,197,94,0.2);
    margin-bottom: 1rem;
  }

  .qp-done-banner h3 {
    font-family: 'Playfair Display', serif;
    font-size: 1.2rem;
    font-weight: 600;
    color: #15803d;
    margin-bottom: 5px;
  }

  .qp-done-banner p {
    font-size: 13px;
    color: #16a34a;
    opacity: 0.85;
  }
`;

function QuestionsPage() {
  const { content, document, clearDocument, summaryRecord } = useLectureSummary();
  const questions = content?.questions || [];
  const hasContent = questions.length > 0;

  const [reviewed, setReviewed] = useState({});
  const reviewedCount = Object.values(reviewed).filter(Boolean).length;
  const progress = hasContent ? (reviewedCount / questions.length) * 100 : 0;
  const allDone = hasContent && reviewedCount === questions.length;

  function toggleReviewed(index) {
    setReviewed((prev) => ({ ...prev, [index]: !prev[index] }));
  }

  return (
    <SummaryShell note="Mark questions as reviewed to track your exam prep progress.">
      <style>{STYLES}</style>

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
            <>
              <div className="qp-progress-wrap">
                <div className="qp-progress-labels">
                  <span>
                    {reviewedCount} of {questions.length} reviewed
                  </span>
                  <span>{Math.round(progress)}% complete</span>
                </div>
                <div className="qp-progress-track">
                  <div
                    className={`qp-progress-fill${allDone ? " all-done" : ""}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {allDone && (
                <div className="qp-done-banner">
                  <h3>All questions reviewed!</h3>
                  <p>You've gone through all {questions.length} practice questions.</p>
                </div>
              )}

              <div className="qp-list">
                {questions.map((question, index) => {
                  const isReviewed = !!reviewed[index];

                  return (
                    <div key={`${index}-${question}`} className={`qp-card${isReviewed ? " reviewed" : ""}`}>
                      <div className="qp-body">
                        <span className="qp-badge">{isReviewed ? "Done" : `Q${index + 1}`}</span>
                        <p>{question}</p>
                      </div>

                      <div className="qp-footer">
                        <button type="button" className="qp-btn qp-btn-mark" onClick={() => toggleReviewed(index)}>
                          {isReviewed ? "Mark as unreviewed" : "Mark as reviewed"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <p className="empty-message">Upload a lecture file to generate questions.</p>
          )}
        </section>
      </main>
    </SummaryShell>
  );
}

export default QuestionsPage;
