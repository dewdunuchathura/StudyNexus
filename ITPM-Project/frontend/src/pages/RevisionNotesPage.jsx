import React, { useState } from "react";
import SummaryShell from "../components/SummaryShell.jsx";
import { useLectureSummary } from "../context/LectureSummaryContext.jsx";

const STYLES = `
  .rn-progress-wrap {
    margin-bottom: 1.15rem;
  }

  .rn-progress-labels {
    display: flex;
    justify-content: space-between;
    font-size: 11.5px;
    color: var(--ink-35);
    margin-bottom: 7px;
    font-weight: 400;
  }

  .rn-progress-track {
    height: 6px;
    background: var(--blue-100);
    border-radius: 3px;
    overflow: hidden;
  }

  .rn-progress-fill {
    height: 100%;
    border-radius: 3px;
    background: linear-gradient(90deg, var(--blue-500), var(--blue-400));
    transition: width 0.4s ease;
  }

  .rn-progress-fill.all-done {
    background: linear-gradient(90deg, #22c55e, #4ade80);
  }

  .rn-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .rn-card {
    display: flex;
    gap: 13px;
    align-items: flex-start;
    padding: 14px 16px;
    border-radius: 12px;
    background: var(--white);
    border: 1px solid var(--blue-100);
    box-shadow: var(--shadow-sm);
    cursor: pointer;
    transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s, background 0.2s;
    user-select: none;
  }

  .rn-card:hover {
    border-color: var(--blue-300);
    box-shadow: 0 4px 16px rgba(37,99,235,0.10);
    transform: translateX(3px);
  }

  .rn-card:focus-visible {
    outline: 2px solid var(--blue-400);
    outline-offset: 2px;
  }

  .rn-card.checked {
    background: linear-gradient(135deg, rgba(34,197,94,0.05), rgba(34,197,94,0.02));
    border-color: rgba(34,197,94,0.28);
  }

  .rn-card.checked:hover {
    border-color: rgba(34,197,94,0.44);
    box-shadow: 0 4px 16px rgba(34,197,94,0.10);
  }

  .rn-checkbox {
    flex-shrink: 0;
    width: 22px;
    height: 22px;
    border-radius: 6px;
    border: 2px solid var(--blue-300);
    background: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 2px;
    font-size: 12px;
    color: #fff;
    transition: background 0.18s, border-color 0.18s;
  }

  .rn-card.checked .rn-checkbox {
    background: linear-gradient(135deg, #22c55e, #16a34a);
    border-color: #22c55e;
  }

  .rn-idx {
    flex-shrink: 0;
    font-size: 10.5px;
    font-weight: 700;
    color: var(--blue-400);
    letter-spacing: 0.05em;
    margin-top: 4px;
    min-width: 20px;
  }

  .rn-card p {
    font-size: 14.5px;
    color: var(--ink-80);
    line-height: 1.78;
    font-weight: 400;
    transition: color 0.2s;
  }

  .rn-card.checked p {
    color: var(--ink-35);
    text-decoration: line-through;
    text-decoration-color: rgba(15,23,42,0.18);
  }

  .rn-reset {
    background: none;
    border: none;
    font-family: 'Outfit', sans-serif;
    font-size: 12px;
    color: var(--ink-35);
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 5px;
    transition: color 0.18s, background 0.18s;
    margin-top: 10px;
    display: block;
    margin-left: auto;
  }

  .rn-reset:hover {
    color: var(--blue-600);
    background: var(--blue-50);
  }
`;

function RevisionNotesPage() {
  const { content, document, clearDocument, summaryRecord } = useLectureSummary();
  const revisionNotes = content?.revisionNotes || [];
  const hasContent = revisionNotes.length > 0;
  const [checked, setChecked] = useState({});

  const checkedCount = Object.values(checked).filter(Boolean).length;
  const progress = hasContent ? (checkedCount / revisionNotes.length) * 100 : 0;
  const allDone = hasContent && checkedCount === revisionNotes.length;

  function toggle(i) {
    setChecked((prev) => ({ ...prev, [i]: !prev[i] }));
  }

  return (
    <SummaryShell note="Tick off notes as you revise them. Progress resets on refresh.">
      <style>{STYLES}</style>

      <header className="summary-header">
        <div className="brand">
          <div className="brand-mark">AI</div>
          <div>
            <p>Lecture Summary Studio</p>
            <span>Revision Notes</span>
          </div>
        </div>
        <div className="header-actions">
          <button
            type="button"
            className="ghost-btn"
            onClick={clearDocument}
            disabled={!document && !summaryRecord}
          >
            Clear file
          </button>
        </div>
      </header>

      <main className="summary-page">
        <section className="stack-card">
          <div className="section-title">
            <p>Revision Notes</p>
            <span>Generated from the uploaded lecture file</span>
          </div>

          {hasContent ? (
            <>
              <div className="rn-progress-wrap">
                <div className="rn-progress-labels">
                  <span>{checkedCount} of {revisionNotes.length} reviewed</span>
                  <span>{Math.round(progress)}% complete</span>
                </div>
                <div className="rn-progress-track">
                  <div
                    className={`rn-progress-fill${allDone ? " all-done" : ""}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="rn-list">
                {revisionNotes.map((note, i) => (
                  <div
                    key={i}
                    className={`rn-card${checked[i] ? " checked" : ""}`}
                    onClick={() => toggle(i)}
                    role="checkbox"
                    aria-checked={!!checked[i]}
                    tabIndex={0}
                    onKeyDown={(e) => (e.key === " " || e.key === "Enter") && toggle(i)}
                  >
                    <div className="rn-checkbox">{checked[i] ? "✓" : ""}</div>
                    <span className="rn-idx">#{i + 1}</span>
                    <p>{note}</p>
                  </div>
                ))}
              </div>

              {checkedCount > 0 && (
                <button
                  type="button"
                  className="rn-reset"
                  onClick={() => setChecked({})}
                >
                  Reset progress
                </button>
              )}
            </>
          ) : (
            <p className="empty-message">Upload a lecture file to generate the revision notes.</p>
          )}
        </section>
      </main>
    </SummaryShell>
  );
}

export default RevisionNotesPage;