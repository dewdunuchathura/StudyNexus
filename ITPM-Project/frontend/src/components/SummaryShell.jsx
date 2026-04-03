import React from "react";
import { NavLink } from "react-router-dom";

export const SUMMARY_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Outfit:wght@300;400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --blue-950: #0a1628;
    --blue-900: #0f2347;
    --blue-800: #1e3a6e;
    --blue-700: #1d4ed8;
    --blue-600: #2563eb;
    --blue-500: #3b82f6;
    --blue-400: #60a5fa;
    --blue-300: #93c5fd;
    --blue-200: #bfdbfe;
    --blue-100: #dbeafe;
    --blue-50:  #eff6ff;
    --blue-25:  #f5f9ff;
    --ink:      #0f172a;
    --ink-80:   rgba(15,23,42,0.80);
    --ink-55:   rgba(15,23,42,0.55);
    --ink-35:   rgba(15,23,42,0.35);
    --ink-18:   rgba(15,23,42,0.18);
    --white:    #ffffff;
    --shadow-sm: 0 1px 3px rgba(37,99,235,0.07), 0 1px 2px rgba(15,23,42,0.05);
    --shadow-md: 0 4px 20px rgba(37,99,235,0.09), 0 2px 8px rgba(15,23,42,0.06);
    --shadow-lg: 0 12px 40px rgba(37,99,235,0.13), 0 4px 16px rgba(15,23,42,0.08);
  }

  .summary-shell {
    min-height: 100vh;
    display: flex;
    font-family: 'Outfit', sans-serif;
    color: var(--ink);
    background-color: var(--blue-25);
    background-image:
      radial-gradient(ellipse 80% 50% at 100% 0%, rgba(59,130,246,0.10) 0%, transparent 60%),
      radial-gradient(ellipse 60% 40% at 0% 100%, rgba(29,78,216,0.07) 0%, transparent 55%),
      url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%233b82f6' fill-opacity='0.025'%3E%3Ccircle cx='20' cy='20' r='1'/%3E%3C/g%3E%3C/svg%3E");
  }

  .summary-sidebar {
    width: 240px;
    flex-shrink: 0;
    min-height: 100vh;
    padding: 1.35rem 1rem;
    background: rgba(245,249,255,0.92);
    backdrop-filter: blur(18px);
    border-right: 1px solid var(--blue-200);
    box-shadow: 1px 0 20px rgba(37,99,235,0.04);
    position: sticky;
    top: 0;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .sidebar-brand {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0.5rem 0.35rem 1rem;
    border-bottom: 1px solid var(--blue-100);
  }

  .sidebar-brand strong {
    display: block;
    font-family: 'Playfair Display', serif;
    font-size: 15px;
    color: var(--ink);
    line-height: 1.2;
  }

  .sidebar-brand span {
    display: block;
    margin-top: 2px;
    font-size: 11px;
    color: var(--ink-35);
    line-height: 1.5;
  }

  .sidebar-nav {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-top: 0.2rem;
  }

  .sidebar-link {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0.8rem 0.9rem;
    border-radius: 10px;
    text-decoration: none;
    color: var(--ink-55);
    font-size: 13px;
    font-weight: 500;
    border: 1px solid transparent;
    transition: all 0.18s;
  }

  .sidebar-link::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--blue-300);
    flex-shrink: 0;
    box-shadow: 0 0 0 4px rgba(59,130,246,0.08);
  }

  .sidebar-link:hover {
    background: var(--blue-50);
    color: var(--blue-700);
    border-color: var(--blue-200);
  }

  .sidebar-link.active {
    background: linear-gradient(135deg, rgba(59,130,246,0.12), rgba(37,99,235,0.08));
    color: var(--blue-700);
    border-color: var(--blue-200);
    box-shadow: 0 8px 18px rgba(37,99,235,0.08);
  }

  .sidebar-note {
    margin-top: auto;
    padding: 0.9rem 0.2rem 0.2rem;
    font-size: 11px;
    line-height: 1.6;
    color: var(--ink-35);
  }

  .summary-main {
    flex: 1;
    min-width: 0;
  }

  .summary-header {
    position: sticky; top: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 3rem; height: 68px;
    background: rgba(245,249,255,0.92);
    backdrop-filter: blur(18px);
    border-bottom: 1px solid var(--blue-200);
    box-shadow: 0 1px 0 rgba(255,255,255,0.7), 0 2px 20px rgba(37,99,235,0.06);
  }

  .brand { display: flex; align-items: center; gap: 14px; }

  .brand-mark {
    width: 38px; height: 38px;
    background: linear-gradient(135deg, var(--blue-600) 0%, var(--blue-700) 100%);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Playfair Display', serif;
    font-weight: 700; font-size: 13.5px; color: #fff;
    letter-spacing: 0.06em; flex-shrink: 0;
    box-shadow: 0 3px 14px rgba(37,99,235,0.35), inset 0 1px 0 rgba(255,255,255,0.2);
  }

  .brand > div:last-child p {
    font-family: 'Playfair Display', serif;
    font-size: 16.5px; font-weight: 600; color: var(--ink); line-height: 1.2; letter-spacing: 0.01em;
  }

  .brand > div:last-child span {
    font-size: 11px; color: var(--ink-35); font-weight: 300; letter-spacing: 0.01em;
  }

  .header-actions { display: flex; gap: 10px; align-items: center; }

  .ghost-btn {
    padding: 8px 18px; border-radius: 8px;
    border: 1.5px solid var(--blue-300); background: transparent;
    color: var(--blue-600); font-family: 'Outfit', sans-serif; font-size: 13px; font-weight: 500;
    cursor: pointer; transition: all 0.18s; letter-spacing: 0.01em;
  }

  .ghost-btn:hover { background: var(--blue-50); border-color: var(--blue-400); box-shadow: 0 0 0 3px rgba(59,130,246,0.08); }
  .ghost-btn:disabled { opacity: 0.38; cursor: not-allowed; box-shadow: none; }

  .primary-btn {
    padding: 8.5px 20px; border-radius: 8px; border: none;
    background: linear-gradient(135deg, var(--blue-500) 0%, var(--blue-700) 100%);
    color: #fff;
    font-family: 'Outfit', sans-serif; font-size: 13px; font-weight: 600;
    cursor: pointer; transition: all 0.2s; letter-spacing: 0.01em;
    box-shadow: 0 3px 12px rgba(37,99,235,0.30), inset 0 1px 0 rgba(255,255,255,0.18);
  }

  .primary-btn:hover {
    background: linear-gradient(135deg, var(--blue-600) 0%, var(--blue-800) 100%);
    box-shadow: 0 6px 22px rgba(37,99,235,0.38);
    transform: translateY(-1px);
  }

  .primary-btn:disabled { opacity: 0.38; cursor: not-allowed; transform: none; box-shadow: none; }

  .text-btn {
    background: none; border: none; color: var(--ink-55);
    font-family: 'Outfit', sans-serif; font-size: 13px;
    cursor: pointer; transition: color 0.18s; padding: 4px 8px; border-radius: 5px;
  }

  .text-btn:hover { color: var(--blue-600); background: var(--blue-50); }

  .summary-page {
    max-width: 1220px; margin: 0 auto;
    padding: 2.4rem 2rem 5rem;
    display: flex; flex-direction: column; gap: 1.1rem;
  }

  .hero-card {
    display: grid; grid-template-columns: 1fr 330px;
    gap: 2.2rem; align-items: center;
    padding: 2.6rem 2.8rem; border-radius: 20px;
    background: linear-gradient(150deg, #ffffff 0%, #f0f6ff 100%);
    border: 1px solid var(--blue-200);
    box-shadow: var(--shadow-lg);
    position: relative; overflow: hidden;
  }

  .hero-card::before {
    content: ''; position: absolute; top: -60px; right: -60px;
    width: 420px; height: 420px; border-radius: 50%;
    background: radial-gradient(circle, rgba(59,130,246,0.10) 0%, transparent 65%);
    pointer-events: none;
  }

  .hero-card::after {
    content: ''; position: absolute; bottom: -40px; left: 80px;
    width: 280px; height: 200px;
    background: radial-gradient(ellipse, rgba(29,78,216,0.06) 0%, transparent 70%);
    pointer-events: none;
  }

  .hero-card .ring {
    position: absolute; top: 28px; right: 340px;
    width: 80px; height: 80px; border-radius: 50%;
    border: 1.5px solid rgba(59,130,246,0.18);
    pointer-events: none;
  }

  .hero-card .ring2 {
    position: absolute; bottom: 24px; right: 80px;
    width: 44px; height: 44px; border-radius: 50%;
    border: 1.5px solid rgba(59,130,246,0.14);
    pointer-events: none;
  }

  .hero-copy { position: relative; z-index: 1; }

  .pill {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 5px 14px; border-radius: 100px;
    background: rgba(59,130,246,0.10); border: 1px solid rgba(59,130,246,0.25);
    color: var(--blue-700); font-size: 10.5px; font-weight: 600;
    letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 1.3rem;
  }

  .pill::before {
    content: '';
    display: inline-block; width: 6px; height: 6px; border-radius: 50%;
    background: var(--blue-500); animation: pulse-dot 2s infinite;
  }

  @keyframes pulse-dot {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(0.75); }
  }

  .hero-copy h1 {
    font-family: 'Playfair Display', serif;
    font-size: 2.85rem; font-weight: 700; line-height: 1.13;
    color: var(--ink); margin-bottom: 1.1rem; letter-spacing: -0.015em;
  }

  .hero-copy h1 span {
    display: block; font-style: italic;
    background: linear-gradient(90deg, var(--blue-600) 0%, var(--blue-400) 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text; font-weight: 600;
  }

  .hero-text {
    font-size: 14px; color: var(--ink-55); line-height: 1.8;
    max-width: 510px; margin-bottom: 1.6rem; font-weight: 300;
  }

  .hero-badges { display: flex; flex-wrap: wrap; gap: 7px; }

  .hero-badges span {
    padding: 4px 12px; border-radius: 6px;
    background: var(--blue-50); border: 1px solid var(--blue-200);
    font-size: 11px; font-weight: 500; color: var(--blue-700); letter-spacing: 0.05em;
    transition: background 0.15s, border-color 0.15s;
  }

  .hero-badges span:hover { background: var(--blue-100); border-color: var(--blue-300); }

  .hero-stat { display: flex; flex-direction: column; gap: 11px; position: relative; z-index: 1; }

  .stat-card {
    padding: 1.15rem 1.25rem; border-radius: 12px;
    background: rgba(255,255,255,0.85);
    border: 1px solid var(--blue-100);
    backdrop-filter: blur(6px);
    box-shadow: var(--shadow-sm);
    transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
  }

  .stat-card:hover {
    border-color: var(--blue-300);
    box-shadow: var(--shadow-md);
    transform: translateX(3px);
  }

  .stat-card span {
    display: inline-flex; width: 26px; height: 26px;
    align-items: center; justify-content: center; border-radius: 50%;
    background: linear-gradient(135deg, var(--blue-500), var(--blue-700));
    color: #fff; font-size: 11.5px; font-weight: 700; margin-bottom: 9px;
    box-shadow: 0 2px 8px rgba(37,99,235,0.3);
  }

  .stat-card strong { display: block; font-size: 13.5px; font-weight: 600; color: var(--ink); margin-bottom: 4px; }
  .stat-card p { font-size: 12px; color: var(--ink-35); line-height: 1.55; font-weight: 300; }

  .dashboard-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.1rem; }

  .upload-card, .guide-card, .page-card, .result-card, .stack-card {
    padding: 1.5rem 1.6rem; border-radius: 16px;
    background: var(--white);
    border: 1px solid var(--blue-100);
    box-shadow: var(--shadow-sm);
    transition: box-shadow 0.2s, transform 0.2s;
  }

  .upload-card:hover, .guide-card:hover, .page-card:hover, .result-card:hover, .stack-card:hover { box-shadow: var(--shadow-md); transform: translateY(-1px); }

  .upload-card {
    border: 2px dashed var(--blue-200);
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; text-align: center; cursor: pointer; gap: 13px; min-height: 290px;
    position: relative; overflow: hidden;
  }

  .upload-card::before {
    content: ''; position: absolute; inset: 0;
    background: radial-gradient(ellipse 60% 50% at 50% 0%, rgba(59,130,246,0.04) 0%, transparent 70%);
    pointer-events: none;
  }

  .upload-card:hover, .upload-card.is-dragging {
    border-color: var(--blue-400);
    background: var(--blue-50);
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }

  .upload-card.is-dragging { border-color: var(--blue-500); }

  .upload-icon {
    width: 58px; height: 58px; border-radius: 16px;
    background: linear-gradient(135deg, var(--blue-100) 0%, var(--blue-50) 100%);
    border: 1.5px solid var(--blue-200);
    display: flex; align-items: center; justify-content: center;
    font-size: 28px; color: var(--blue-600); margin-bottom: 2px;
    box-shadow: 0 4px 14px rgba(59,130,246,0.15);
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .upload-card:hover .upload-icon {
    transform: scale(1.08);
    box-shadow: 0 6px 20px rgba(59,130,246,0.22);
  }

  .upload-card h2, .guide-card h2, .page-card h2, .result-card h2 {
    font-family: 'Playfair Display', serif;
    font-size: 1.25rem; font-weight: 600; color: var(--ink);
  }

  .upload-card p, .guide-card p, .page-card p, .result-card p {
    font-size: 13px; color: var(--ink-55); line-height: 1.7; font-weight: 300;
  }

  .file-format-row { display: flex; gap: 6px; flex-wrap: wrap; justify-content: center; }

  .file-format-row span {
    padding: 3.5px 10px; border-radius: 5px;
    background: var(--blue-50); border: 1px solid var(--blue-200);
    font-size: 11px; color: var(--blue-700); letter-spacing: 0.05em; font-weight: 500;
  }

  .upload-error {
    width: 100%;
    padding: 0.8rem 0.95rem;
    border-radius: 10px;
    border: 1px solid rgba(239,68,68,0.22);
    background: rgba(254,242,242,0.95);
    color: #b91c1c;
    font-size: 12.5px;
    line-height: 1.55;
    text-align: left;
  }

  .upload-success {
    width: 100%;
    padding: 0.8rem 0.95rem;
    border-radius: 10px;
    border: 1px solid rgba(34,197,94,0.24);
    background: rgba(240,253,244,0.96);
    color: #166534;
    font-size: 12.5px;
    line-height: 1.55;
    text-align: left;
  }

  .upload-card input[type="file"] { display: none; }

  .page-grid, .content-grid { display: grid; gap: 1.1rem; }
  .content-grid { grid-template-columns: 1fr 1fr; }
  .compact-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }

  .section-title { margin-bottom: 1.3rem; }

  .section-title p {
    font-family: 'Playfair Display', serif; font-size: 1.08rem; font-weight: 600;
    color: var(--ink); margin-bottom: 3px; letter-spacing: 0.01em;
  }

  .section-title span { font-size: 11.5px; color: var(--ink-35); font-weight: 300; letter-spacing: 0.01em; }

  .bullet-list { list-style: none; display: flex; flex-direction: column; gap: 10px; }

  .bullet-list li {
    position: relative; padding-left: 18px;
    font-size: 13.5px; color: var(--ink-80); line-height: 1.68; font-weight: 300;
    white-space: normal;
    word-break: break-word;
    overflow-wrap: anywhere;
  }

  .bullet-list li::before {
    content: ''; position: absolute; left: 0; top: 10px;
    width: 8px; height: 2px;
    background: linear-gradient(90deg, var(--blue-500), var(--blue-300));
    border-radius: 1px;
  }

  .bullet-list.compact li { font-size: 13px; }

  .note-columns { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }

  .note-columns h3, .stack-grid h3 {
    font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.09em;
    color: var(--blue-500); font-weight: 600; margin-bottom: 0.85rem;
  }

  .stack-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.9rem; }
  .stack-grid .bullet-list { margin-top: 0.85rem; }

  .question-list { display: flex; flex-direction: column; gap: 10px; }

  .question-card {
    display: flex; align-items: flex-start; gap: 12px;
    padding: 11px 14px; border-radius: 10px;
    background: var(--blue-25);
    border: 1px solid var(--blue-100);
    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
  }

  .question-card:hover {
    border-color: var(--blue-300);
    background: var(--blue-50);
    box-shadow: 0 2px 10px rgba(59,130,246,0.10);
  }

  .question-card span {
    flex-shrink: 0; font-size: 10px; font-weight: 700; letter-spacing: 0.07em;
    color: var(--blue-700); padding: 3px 8px; border-radius: 5px;
    background: rgba(59,130,246,0.10); border: 1px solid rgba(59,130,246,0.22); margin-top: 1px;
  }

  .question-card p { font-size: 13.5px; color: var(--ink-80); line-height: 1.62; font-weight: 300; }

  .empty-state {
    flex: 1; display: flex; flex-direction: column; align-items: center;
    justify-content: center; text-align: center; padding: 2rem 0; gap: 8px; opacity: 0.55;
  }

  .empty-state strong { font-size: 14px; color: var(--ink); font-weight: 500; }
  .empty-state p { font-size: 13px; color: var(--ink-55); font-weight: 300; }

  .empty-message {
    padding: 0.9rem 0 0.15rem;
    color: var(--ink-55);
    font-size: 13px;
    line-height: 1.72;
  }

  .file-summary {
    display: flex; align-items: center; gap: 14px;
    padding: 1rem 1.15rem; border-radius: 10px;
    background: linear-gradient(135deg, var(--blue-50) 0%, #f5f9ff 100%);
    border: 1px solid var(--blue-100);
  }

  .file-chip {
    padding: 5px 12px; border-radius: 6px;
    background: linear-gradient(135deg, var(--blue-500), var(--blue-700));
    color: #fff;
    font-size: 10.5px; font-weight: 700; letter-spacing: 0.08em; flex-shrink: 0;
    box-shadow: 0 2px 8px rgba(37,99,235,0.3);
  }

  .file-summary strong { display: block; font-size: 14px; font-weight: 600; color: var(--ink); }
  .file-summary span { font-size: 12px; color: var(--ink-35); font-weight: 300; }

  .result-actions { display: flex; gap: 10px; }

  .success-banner {
    padding: 11px 16px; border-radius: 9px;
    background: rgba(59,130,246,0.08);
    border: 1px solid var(--blue-200);
    color: var(--blue-700); font-size: 13px; font-weight: 400;
    display: flex; align-items: center; gap: 9px;
  }

  .success-banner::before {
    content: '✓'; display: inline-flex; width: 20px; height: 20px;
    align-items: center; justify-content: center; border-radius: 50%;
    background: var(--blue-600); color: #fff;
    font-size: 11px; font-weight: 700; flex-shrink: 0;
  }

  .section-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--blue-200) 30%, var(--blue-200) 70%, transparent);
    margin: 0.2rem 0;
    display: none;
  }

  @media (max-width: 1024px) {
    .summary-shell { flex-direction: column; }
    .summary-sidebar {
      width: 100%;
      min-height: auto;
      position: relative;
      top: auto;
      border-right: none;
      border-bottom: 1px solid var(--blue-200);
    }
    .hero-card, .dashboard-grid, .content-grid, .stack-grid, .page-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 1200px) {
    .compact-grid { grid-template-columns: 1fr 1fr; }
  }

  @media (max-width: 640px) {
    .summary-header { padding: 0 1.25rem; }
    .summary-page { padding: 1.5rem 1rem 3rem; }
    .hero-card { padding: 1.8rem 1.5rem; }
    .hero-copy h1 { font-size: 2rem; }
    .summary-sidebar { padding: 1rem 0.85rem; }
    .header-actions { flex-wrap: wrap; justify-content: flex-end; }
  }
`;

const SUMMARY_THEME_OVERRIDES = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,400&display=swap');

  .summary-shell {
    font-family: 'DM Sans', sans-serif;
    background:
      radial-gradient(circle at top right, rgba(34, 211, 238, 0.12), transparent 28%),
      radial-gradient(circle at bottom left, rgba(37, 99, 235, 0.10), transparent 34%),
      linear-gradient(180deg, #f8fbff 0%, #eef4ff 100%);
  }

  .summary-sidebar {
    background: linear-gradient(180deg, #0f1b6b 0%, #13257f 100%);
    border-right: none;
    box-shadow: 8px 0 30px rgba(15, 27, 107, 0.18);
  }

  .sidebar-brand {
    border-bottom-color: rgba(255, 255, 255, 0.12);
  }

  .sidebar-brand strong,
  .sidebar-brand span {
    color: rgba(255, 255, 255, 0.92);
  }

  .sidebar-link {
    color: rgba(255, 255, 255, 0.78);
    background: rgba(255, 255, 255, 0.03);
    border-color: rgba(255, 255, 255, 0.08);
    font-family: 'DM Sans', sans-serif;
  }

  .sidebar-link::before {
    background: var(--aqua);
    box-shadow: 0 0 0 4px rgba(34, 211, 238, 0.14);
  }

  .sidebar-link:hover,
  .sidebar-link.active {
    background: rgba(255, 255, 255, 0.10);
    color: #ffffff;
    border-color: rgba(34, 211, 238, 0.25);
  }

  .sidebar-link.active {
    background: rgba(34, 211, 238, 0.16);
    box-shadow: 0 10px 22px rgba(0, 0, 0, 0.12);
  }

  .sidebar-note {
    color: rgba(255, 255, 255, 0.60);
  }

  .summary-header {
    background: rgba(15, 27, 107, 0.96);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 2px 24px rgba(15, 27, 107, 0.22);
  }

  .brand > div:last-child p,
  .brand > div:last-child span {
    color: rgba(255, 255, 255, 0.92);
  }

  .brand-mark {
    background: linear-gradient(135deg, var(--blue) 0%, var(--cyan) 100%);
    box-shadow: 0 8px 20px rgba(14, 165, 233, 0.28);
  }

  .ghost-btn {
    border-color: rgba(255, 255, 255, 0.22);
    color: #ffffff;
    background: rgba(255, 255, 255, 0.06);
    font-family: 'DM Sans', sans-serif;
  }

  .ghost-btn:hover {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.35);
    box-shadow: 0 0 0 3px rgba(34, 211, 238, 0.10);
  }

  .primary-btn {
    background: linear-gradient(135deg, var(--blue) 0%, var(--cyan) 100%);
    box-shadow: 0 8px 24px rgba(14, 165, 233, 0.28);
    font-family: 'DM Sans', sans-serif;
  }

  .summary-page {
    max-width: 1240px;
    padding: 2.4rem 1.25rem 5rem;
    gap: 1.25rem;
  }

  .hero-card {
    background: linear-gradient(135deg, #0f1b6b 0%, #1a2fa8 55%, #0ea5e9 100%);
    border: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow: 0 20px 50px rgba(15, 27, 107, 0.18);
  }

  .hero-card::before {
    background: radial-gradient(circle, rgba(34, 211, 238, 0.18) 0%, transparent 68%);
  }

  .hero-card::after {
    background: radial-gradient(ellipse, rgba(255, 255, 255, 0.08) 0%, transparent 70%);
  }

  .hero-card .ring,
  .hero-card .ring2 {
    border-color: rgba(255, 255, 255, 0.16);
  }

  .hero-copy h1 {
    font-family: 'Sora', sans-serif;
    color: #ffffff;
    font-size: clamp(2.25rem, 4vw, 3.2rem);
  }

  .hero-copy h1 span {
    background: linear-gradient(90deg, #67e8f9 0%, #a5f3fc 100%);
    -webkit-background-clip: text;
    background-clip: text;
  }

  .hero-text {
    color: rgba(255, 255, 255, 0.74);
    font-size: 1.02rem;
  }

  .hero-badges span {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.16);
    color: #ffffff;
    font-family: 'DM Sans', sans-serif;
  }

  .hero-badges span:hover {
    background: rgba(255, 255, 255, 0.18);
    border-color: rgba(34, 211, 238, 0.35);
  }

  .hero-stat .stat-card {
    background: rgba(255, 255, 255, 0.10);
    border-color: rgba(255, 255, 255, 0.14);
    box-shadow: none;
  }

  .stat-card span {
    background: linear-gradient(135deg, var(--cyan) 0%, #67e8f9 100%);
    color: #0f1b6b;
    box-shadow: none;
  }

  .stat-card strong,
  .stat-card p {
    color: rgba(255, 255, 255, 0.95);
  }

  .stat-card p {
    color: rgba(255, 255, 255, 0.70);
  }

  .upload-card,
  .guide-card,
  .page-card,
  .result-card,
  .stack-card {
    border-color: rgba(37, 99, 235, 0.12);
    background: rgba(255, 255, 255, 0.98);
    box-shadow: 0 16px 40px rgba(15, 27, 107, 0.08);
  }

  .upload-card:hover,
  .guide-card:hover,
  .page-card:hover,
  .result-card:hover,
  .stack-card:hover {
    box-shadow: 0 20px 46px rgba(15, 27, 107, 0.12);
  }

  .upload-card {
    background:
      radial-gradient(circle at top, rgba(34, 211, 238, 0.06), transparent 55%),
      rgba(255, 255, 255, 0.98);
    border-style: solid;
    border-width: 1px;
  }

  .upload-card:hover,
  .upload-card.is-dragging {
    background:
      radial-gradient(circle at top, rgba(34, 211, 238, 0.10), transparent 55%),
      #f8fbff;
    border-color: rgba(37, 99, 235, 0.28);
  }

  .upload-icon {
    background: linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%);
    border-color: rgba(37, 99, 235, 0.16);
    color: var(--blue);
  }

  .upload-card h2,
  .guide-card h2,
  .page-card h2,
  .result-card h2 {
    font-family: 'Sora', sans-serif;
  }

  .upload-card p,
  .guide-card p,
  .page-card p,
  .result-card p,
  .bullet-list li,
  .question-card p,
  .empty-message,
  .file-summary span {
    color: rgba(17, 24, 39, 0.74);
    font-family: 'DM Sans', sans-serif;
  }

  .section-title p {
    font-family: 'Sora', sans-serif;
  }

  .section-title span {
    color: rgba(17, 24, 39, 0.48);
  }

  .file-format-row span {
    background: rgba(37, 99, 235, 0.06);
    border-color: rgba(37, 99, 235, 0.14);
    color: var(--blue);
    font-family: 'DM Sans', sans-serif;
  }

  .bullet-list li::before {
    background: linear-gradient(90deg, var(--blue) 0%, var(--cyan) 100%);
  }

  .question-card {
    background: linear-gradient(135deg, rgba(37, 99, 235, 0.05), rgba(14, 165, 233, 0.04));
    border-color: rgba(37, 99, 235, 0.12);
  }

  .question-card span {
    background: rgba(37, 99, 235, 0.10);
    border-color: rgba(37, 99, 235, 0.18);
    color: var(--blue);
  }

  .file-summary {
    background: linear-gradient(135deg, #f8fbff 0%, #eff6ff 100%);
    border-color: rgba(37, 99, 235, 0.10);
  }

  .file-chip {
    background: linear-gradient(135deg, var(--blue) 0%, var(--cyan) 100%);
  }

  .empty-message {
    color: rgba(17, 24, 39, 0.50);
  }

  @media (max-width: 1024px) {
    .summary-sidebar {
      box-shadow: none;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
  }
`;
function navClassName({ isActive }) {
  return `sidebar-link ${isActive ? "active" : ""}`;
}

function SummaryShell({ children, note = "Use the sidebar to move between the guidance page, summary, revision notes, and questions." }) {
  return (
    <>
      <style>{SUMMARY_STYLES + SUMMARY_THEME_OVERRIDES}</style>
      <div className="summary-shell">
        <aside className="summary-sidebar">
          <div className="sidebar-brand">
            <div className="brand-mark">AI</div>
            <div>
              <strong>Studio</strong>
              <span>Navigate between the document pages.</span>
            </div>
          </div>

          <nav className="sidebar-nav" aria-label="Summary navigation">
            <NavLink to="/ai-summary" className={navClassName}>
              Upload Files
            </NavLink>
            <NavLink to="/summary" className={navClassName}>
              Summary Page
            </NavLink>
            <NavLink to="/revision-notes" className={navClassName}>
              Revision Notes
            </NavLink>
            <NavLink to="/questions" className={navClassName}>
              Questions
            </NavLink>
          </nav>

          <p className="sidebar-note">{note}</p>
        </aside>

        <div className="summary-main">{children}</div>
      </div>
    </>
  );
}

export default SummaryShell;




