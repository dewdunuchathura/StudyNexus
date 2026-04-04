import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import SummaryShell from "../components/SummaryShell.jsx";
import { supportedTypes, formatFileSize } from "../lib/lectureSummary.js";
import { useLectureSummary } from "../context/LectureSummaryContext.jsx";

const STYLES = `
  .ai-quick-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 0.25rem;
  }

  .ai-quick-link {
    display: flex;
    align-items: center;
    gap: 13px;
    padding: 13px 16px;
    border-radius: 12px;
    background: var(--blue-25);
    border: 1px solid var(--blue-100);
    text-decoration: none;
    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s, transform 0.2s;
  }

  .ai-quick-link:hover {
    border-color: var(--blue-300);
    background: var(--blue-50);
    box-shadow: 0 4px 14px rgba(37,99,235,0.08);
    transform: translateX(3px);
  }

  .ai-quick-num {
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
    box-shadow: 0 2px 8px rgba(37,99,235,0.28);
    flex-shrink: 0;
  }

  .ai-quick-text strong {
    display: block;
    font-size: 13.5px;
    font-weight: 600;
    color: var(--ink);
    line-height: 1.3;
  }

  .ai-quick-text span {
    font-size: 11.5px;
    color: var(--ink-35);
    font-weight: 300;
  }

  .ai-quick-arrow {
    margin-left: auto;
    font-size: 14px;
    color: var(--blue-400);
    flex-shrink: 0;
  }
`;

const QUICK_LINKS = [
  { to: "/summary",        label: "Summary",        desc: "Key takeaways from the lecture" },
  { to: "/revision-notes", label: "Revision Notes",  desc: "Notes to review before your exam" },
  { to: "/questions",      label: "Questions",       desc: "Practice questions to test yourself" },
];

function AISummary() {
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const { document, uploadFile, clearDocument } = useLectureSummary();

  useEffect(() => {
    if (!uploadStatus) return;
    const timer = window.setTimeout(() => setUploadStatus(""), 2500);
    return () => window.clearTimeout(timer);
  }, [uploadStatus]);

  useEffect(() => {
    if (document?.name && !selectedFile) {
      setSelectedFile({
        name: document.name,
        extension: document.extension,
        sizeLabel: document.sizeLabel,
        updatedAt: document.updatedAt,
      });
    }
  }, [document, selectedFile]);

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  async function handleFile(file) {
    if (!file || isUploading) return;

    const preview = {
      name: file.name,
      extension: (file.name.split(".").pop() || "FILE").toUpperCase(),
      sizeLabel: formatFileSize(file.size),
      updatedAt: new Date(file.lastModified).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    };

    setSelectedFile(preview);
    setIsUploading(true);
    setUploadError("");
    setUploadStatus("Uploading file...");

    const result = await uploadFile(file);

    if (result?.ok) {
      setUploadError("");
      setUploadStatus("Upload completed");
      const savedDocument = result?.data?.document || preview;
      setSelectedFile(savedDocument);
    } else {
      setUploadStatus("");
      setUploadError(result?.error || "Unable to upload that file.");
    }

    setIsUploading(false);

    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleDrop(event) {
    event.preventDefault();
    setDragOver(false);
    handleFile(event.dataTransfer.files[0]);
  }

  const visibleDocument = document || selectedFile;

  return (
    <SummaryShell note="This page is the entry point. Upload the lecture file here, then open the Summary, Revision Notes, or Questions page from the links below.">
      <style>{STYLES}</style>

      <header className="summary-header">
        <div className="brand">
          <div className="brand-mark">AI</div>
          <div>
            <p>Lecture Summary Studio</p>
            <span>Upload and navigation</span>
          </div>
        </div>
        <div className="header-actions">
          <button type="button" className="ghost-btn" onClick={openFilePicker} disabled={isUploading}>
            {isUploading ? "Uploading..." : "Upload document"}
          </button>
          <button
            type="button"
            className="ghost-btn"
            onClick={() => {
              clearDocument();
              setUploadError("");
              setUploadStatus("");
              setSelectedFile(null);
            }}
            disabled={!visibleDocument || isUploading}
          >
            Clear file
          </button>
        </div>
      </header>

      <main className="summary-page">
        {/* -- Hero -- */}
        <section className="hero-card">
          <div className="ring" />
          <div className="ring2" />
          <div className="hero-copy">
            <div className="pill">Upload Section</div>
            <h1>
              Upload the lecture file here.
              <span>The content will appear on the relevant pages below.</span>
            </h1>
            <p className="hero-text">
              Use this page to upload the document once. The backend will extract the text, send it to Gemini, and the generated output will be shown separately on the Summary, Revision Notes, and Questions pages.
            </p>
            <div className="hero-badges">
              {supportedTypes.map((type) => (
                <span key={type}>{type}</span>
              ))}
            </div>
          </div>

          <div className="hero-stat">
            <div className="stat-card">
              <span>1</span>
              <strong>Upload the document</strong>
              <p>Choose a lecture file from your device or drag it here.</p>
            </div>
            <div className="stat-card">
              <span>2</span>
              <strong>Generate the content</strong>
              <p>The backend extracts the lecture text and sends it to Gemini.</p>
            </div>
            <div className="stat-card">
              <span>3</span>
              <strong>Open the pages</strong>
              <p>Summary, revision notes, and questions all live on separate pages.</p>
            </div>
          </div>
        </section>

        {/* -- Uploaded file -- */}
        {visibleDocument && (
          <section className="stack-card">
            <div className="section-title">
              <p>Uploaded file</p>
              <span>This is the file you uploaded</span>
            </div>
            <div className="file-summary" style={{ width: "100%" }}>
              <div className="file-chip">{visibleDocument.extension}</div>
              <div style={{ textAlign: "left" }}>
                <strong>{visibleDocument.name}</strong>
                <span>
                  {visibleDocument.sizeLabel} | Added {visibleDocument.updatedAt}
                </span>
              </div>
            </div>
          </section>
        )}

        {/* -- Upload + Quick links -- */}
        <section className="dashboard-grid">
          <article
            className={`upload-card ${dragOver ? "is-dragging" : ""}`}
            onClick={openFilePicker}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <div className="upload-icon">+</div>
            <h2>Drop or choose a file</h2>
            <p>
              Upload a PDF or PPTX file. The backend will generate the study content from it.
            </p>
            <div className="file-format-row">
              {supportedTypes.map((type) => (
                <span key={type}>{type}</span>
              ))}
            </div>
            {uploadStatus && <p className="upload-success">{uploadStatus}</p>}
            {uploadError && <p className="upload-error">{uploadError}</p>}
            <button
              type="button"
              className="primary-btn"
              onClick={(e) => { e.stopPropagation(); openFilePicker(); }}
              disabled={isUploading}
            >
              {isUploading ? "Uploading..." : "Choose file"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              onChange={(e) => handleFile(e.target.files[0])}
              disabled={isUploading}
            />
          </article>

          <article className="guide-card">
            <div className="section-title">
              <p>Quick links</p>
              <span>Open the generated pages</span>
            </div>
            <nav className="ai-quick-list">
              {QUICK_LINKS.map(({ to, label, desc }, i) => (
                <Link key={to} className="ai-quick-link" to={to}>
                  <div className="ai-quick-num">{i + 1}</div>
                  <div className="ai-quick-text">
                    <strong>{label}</strong>
                    <span>{desc}</span>
                  </div>
                  <span className="ai-quick-arrow">?</span>
                </Link>
              ))}
            </nav>
          </article>
        </section>
      </main>
    </SummaryShell>
  );
}

export default AISummary;
