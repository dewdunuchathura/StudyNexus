import React from "react";
import SummaryShell from "../components/SummaryShell.jsx";
import { useLectureSummary } from "../context/LectureSummaryContext.jsx";

function RevisionNotesPage() {
  const { content, document, clearDocument, summaryRecord } = useLectureSummary();
  const revisionNotes = content?.revisionNotes || [];
  const hasContent = revisionNotes.length > 0;

  return (
    <SummaryShell note="Revision notes page shows only the generated revision notes from the uploaded lecture file.">
      <header className="summary-header">
        <div className="brand">
          <div className="brand-mark">AI</div>
          <div>
            <p>Lecture Summary Studio</p>
            <span>Revision notes</span>
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
            <p>Revision notes</p>
            <span>Generated from the uploaded lecture file</span>
          </div>
          {hasContent ? (
            <ul className="bullet-list">
              {revisionNotes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="empty-message">Upload a lecture file to generate the revision notes.</p>
          )}
        </section>
      </main>
    </SummaryShell>
  );
}

export default RevisionNotesPage;
