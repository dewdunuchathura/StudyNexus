import React from "react";
import SummaryShell from "../components/SummaryShell.jsx";
import { useLectureSummary } from "../context/LectureSummaryContext.jsx";

const STYLES = `
  .sp-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .sp-item {
    display: flex;
    gap: 14px;
    align-items: flex-start;
    padding: 14px 16px;
    border-radius: 12px;
    background: var(--blue-25);
    border: 1px solid var(--blue-100);
    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s, transform 0.2s;
  }

  .sp-item:hover {
    border-color: var(--blue-300);
    background: var(--blue-50);
    box-shadow: 0 4px 14px rgba(37,99,235,0.08);
    transform: translateX(3px);
  }

  .sp-num {
    flex-shrink: 0;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--blue-500), var(--blue-700));
    color: #fff;
    font-size: 11px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 2px;
    box-shadow: 0 2px 8px rgba(37,99,235,0.28);
  }

  .sp-item p {
    font-size: 14.5px;
    color: var(--ink-80);
    line-height: 1.78;
    font-weight: 400;
  }
`;

function SummaryPage() {
  const { content, document, clearDocument, summaryRecord } = useLectureSummary();
  const summaryItems = content?.summary || [];
  const hasContent = summaryItems.length > 0;

  return (
    <SummaryShell note="Summary page shows only the generated summary from the uploaded lecture file.">
      <style>{STYLES}</style>

      <header className="summary-header">
        <div className="brand">
          <div className="brand-mark">AI</div>
          <div>
            <p>Lecture Summary Studio</p>
            <span>Summary</span>
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
            <p>Summary</p>
            <span>Generated from the uploaded lecture file</span>
          </div>

          {hasContent ? (
            <div className="sp-list">
              {summaryItems.map((item, i) => (
                <div className="sp-item" key={i}>
                  <div className="sp-num">{i + 1}</div>
                  <p>{item}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-message">Upload a lecture file to generate the summary.</p>
          )}
        </section>
      </main>
    </SummaryShell>
  );
}

export default SummaryPage;