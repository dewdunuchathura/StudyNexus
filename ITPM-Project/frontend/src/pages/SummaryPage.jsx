import React from "react";
import SummaryShell from "../components/SummaryShell.jsx";
import { useLectureSummary } from "../context/LectureSummaryContext.jsx";

function SummaryPage() {
  const { content, document, clearDocument, summaryRecord } = useLectureSummary();
  const summaryItems = content?.summary || [];
  const hasContent = summaryItems.length > 0;

  return (
    <SummaryShell note="Summary page shows only the generated summary from the uploaded lecture file.">
      <header className="summary-header">
        <div className="brand">
          <div className="brand-mark">AI</div>
          <div>
            <p>Lecture Summary Studio</p>
            <span>Summary</span>
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
            <p>Summary</p>
            <span>Generated from the uploaded lecture file</span>
          </div>
          {hasContent ? (
            <ul className="bullet-list">
              {summaryItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="empty-message">Upload a lecture file to generate the summary.</p>
          )}
        </section>
      </main>
    </SummaryShell>
  );
}

export default SummaryPage;
