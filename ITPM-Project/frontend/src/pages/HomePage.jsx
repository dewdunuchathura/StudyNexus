import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import '../styles/home.css';

/* --- Data --- */
/* --- Data --- */
const FEATURES = [
  {
    icon: '??', bg: '#dbeafe', color: '#2563eb',
    title: 'AI Lecture Summaries',
    desc: 'Upload PDFs, PowerPoints, or Word docs and get intelligent AI-generated summaries with key concepts and bullet-point revision notes instantly.',
  },
  {
    icon: '??', bg: '#dcfce7', color: '#16a34a',
    title: 'Study Group Management',
    desc: 'Create academic groups, send and manage join requests, assign group leader roles, and post announcements to your team effortlessly.',
  },
  {
    icon: '??', bg: '#fce7f3', color: '#be185d',
    title: 'Resource Sharing Hub',
    desc: 'Upload and share study materials within groups, categorized by subject or module, with interactive commenting and interaction tools.',
  },
  {
    icon: '??', bg: '#fef3c7', color: '#b45309',
    title: 'Competitive Leaderboard',
    desc: 'Earn points for completed tasks, climb the academic ranks, and stay motivated through gamified peer competition across your institution.',
  },
  {
    icon: '???', bg: '#ede9fe', color: '#7c3aed',
    title: 'Enterprise Security',
    desc: 'JWT authentication, robust password hashing, and granular role-based permissions ensure your academic data stays private and protected.',
  },
  {
    icon: '??', bg: '#e0f2fe', color: '#0284c7',
    title: 'Real-time Analytics',
    desc: 'Stay informed with instant visual metrics, progress bars, and high-level academic overviews to monitor your performance at a glance.',
  },
];

const AI_STEPS = [
  { num: '01', title: 'Upload Your Lecture Material', desc: 'Supports PDF, PPTX, DOCX � drag and drop or click to upload from any device.' },
  { num: '02', title: 'AI Processes & Extracts Key Concepts', desc: 'Our model analyzes structure, headings, and content to identify what matters most.' },
  { num: '03', title: 'Review, Save & Download', desc: 'Get a summary card with bullet-point notes you can save, search, or export instantly.' },
];

const HOW_STEPS = [
  { icon: '??', title: 'Create Your Account', desc: 'Register as a Student, Lecturer, or Admin. Verify your email and set up your academic profile in under 2 minutes.' },
  { icon: '??', title: 'Upload Study Materials', desc: 'Drop in lecture slides, PDFs, or notes. Our AI instantly processes and generates smart summaries for you.' },
  { icon: '??', title: 'Join or Create Groups', desc: 'Find study groups by module or subject, send a join request, and start sharing resources with peers.' },
  { icon: '??', title: 'Track & Compete', desc: 'Monitor your progress dashboard, climb the leaderboard, and hit your academic goals with AI-powered insights.' },
];

const ROLES = [
  {
    variant: 'student', emoji: '??', title: 'For Students', checkClass: 'blue',
    desc: 'Focus purely on your studies without administrative distractions. Your personalized academic hub awaits.',
    features: [
      'Manage personal study goals & deadlines',
      'Upload files & get AI-generated summaries',
      'Track individual progress metrics',
      'Join study groups & share resources',
      'Compete globally on the leaderboard',
    ],
  },
  {
    variant: 'lecturer', emoji: '?????', title: 'For Lecturers', checkClass: 'green',
    desc: 'Monitor student progress and manage academic cohorts effortlessly, all from one streamlined dashboard.',
    features: [
      'View global student leaderboard',
      'Search and view student profiles',
      'Track overall classroom success metrics',
      'Manage and distribute study resources',
      'Monitor group activity & participation',
    ],
  },
  {
    variant: 'admin', emoji: '???', title: 'For Admins', checkClass: 'purple',
    desc: 'Full systematic control over users, security, and access rules across the entire institution.',
    features: [
      'Edit, update, or remove user accounts',
      'Create lecturer and admin accounts',
      'Manage system-wide study goals',
      'Monitor and flag reported content',
      'Control role-based permissions & security',
    ],
  },
];

const GROUPS = [
  { icon: '??', bg: 'g-blue', name: 'Advanced Algorithms Study Group', meta: '14 members � CS Module 3', badge: 'Active', badgeClass: 'badge-active' },
  { icon: '??', bg: 'g-green', name: 'Bioinformatics Research Circle', meta: '8 members � BIO Module 5', badge: 'New', badgeClass: 'badge-new' },
  { icon: '??', bg: 'g-amber', name: 'Data Structures & Databases', meta: '20 members � IT Module 2', badge: 'Full', badgeClass: 'badge-full' },
  { icon: '??', bg: 'g-pink', name: 'UI/UX Design Collective', meta: '11 members � DES Module 1', badge: 'Active', badgeClass: 'badge-active' },
];

const COLLAB_FEATURES = [
  { icon: '??', title: 'Group Announcements & Discussion Boards', desc: 'Post updates, pin important messages, and keep every member in sync with a built-in group chat system.' },
  { icon: '??', title: 'Managed Access & Role Assignment', desc: 'Group leaders can accept or reject member requests, assign roles, and control who sees what.' },
  { icon: '??', title: 'Shared Resource Library', desc: 'Every group gets its own resource hub where members can upload, comment, and organize files by module.' },
];

const RESOURCES = [
  { icon: '??', title: 'Upload Materials', desc: 'Share lecture notes, past papers, and study guides with your group or the wider platform.' },
  { icon: '???', title: 'Categorized by Module', desc: 'Resources are tagged by subject and module so finding what you need takes seconds, not minutes.' },
  { icon: '??', title: 'Comment & Interact', desc: 'Ask questions, leave feedback, and discuss shared materials directly within the platform.' },
  { icon: '??', title: 'Content Moderation', desc: 'Report inappropriate content and let admins maintain a safe, productive academic environment.' },
];

const STATS = [
  { num: '12,000+', lbl: 'Active University Students' },
  { num: '98.7%', lbl: 'AI Summary Accuracy Rate' },
  { num: '3,500+', lbl: 'Study Groups Created' },
  { num: '250k+', lbl: 'Resources Shared' },
];

const TESTIMONIALS = [
  {
    initials: 'AK', stars: '?????',
    quote: 'The AI summary feature is a game-changer. I upload my lecturer\'s slides and get study-ready notes in under 30 seconds. My GPA improved noticeably after using EduNexus.',
    name: 'Ashan Karunaratne', role: 'Computer Science Student, Year 3',
  },
  {
    initials: 'NP', stars: '?????',
    quote: 'As a lecturer, tracking student progress has never been this effortless. I can see who\'s engaged and who needs extra support � all in real time.',
    name: 'Dr. Nirosha Perera', role: 'Senior Lecturer, Faculty of IT',
  },
  {
    initials: 'SM', stars: '?????',
    quote: 'Our study group uses EduNexus to share notes and coordinate before every exam. The group resource hub keeps everything organized � no more messy WhatsApp files!',
    name: 'Sanduni Madushan', role: 'Business IT Student, Year 2',
  },
];

const AI_BULLETS = [
  'Normalization reduces data redundancy by organizing tables into defined normal forms (1NF ? 3NF).',
  'A primary key uniquely identifies each row; foreign keys enforce referential integrity between relations.',
  'ACID properties (Atomicity, Consistency, Isolation, Durability) guarantee transaction reliability.',
  'Indexing improves query speed but increases write overhead � balance is critical for optimization.',
];

export default function HomePage() {
  const navRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll('.fade-up').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onScroll = () => {
      if (!navRef.current) return;
      navRef.current.classList.toggle('scrolled', window.scrollY > 20);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      if (!navRef.current) return;
      navRef.current.classList.toggle('scrolled', window.scrollY > 20);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <nav className="hp-nav" ref={navRef}>
        <a href="/" className="nav-logo">
          <div className="nav-logo-icon">??</div>
          <span className="nav-logo-text">
            Edu<em>Nexus</em>
          </span>
        </a>

        <ul className="nav-links">
          <li><a href="#features">Features</a></li>
          <li><a href="#how-it-works">How it Works</a></li>
          <li><a href="#roles">Roles</a></li>
          <li><a href="#collaboration">Collaboration</a></li>
        </ul>

        <div className="nav-actions">
          <Link to="/login" className="btn-ghost">Sign In</Link>
          <Link to="/register" className="btn-primary">Sign Up →</Link>
        </div>
      </nav>

      <section className="hero" id="home">
        <div className="hero-bg-dots" />
        <div className="hero-glow" />
        <div className="hero-glow2" />
        <div className="hero-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="hero-badge-dot" />
              EduNexus AI Platform 2.0 is Live
            </div>
            <h1 className="hero-title">
              Study Smarter.<br />
              Collaborate Better.<br />
              <span className="gradient-text">Powered by AI.</span>
            </h1>
            <p className="hero-sub">
              The intelligent academic platform that helps university students upload
              lecture materials, generate AI summaries, form study groups, and track
              progress � all in one place.
            </p>
            <div className="hero-actions">
              <Link to="/register" className="btn-hero-primary">Start Learning Now</Link>
              <a href="#how-it-works" className="btn-hero-ghost">→ See How It Works</a>
            </div>
            <div className="hero-stats">
              {[
                { num: '12k+', lbl: 'Active Students' },
                { num: '98%', lbl: 'Summary Accuracy' },
                { num: '3.5k', lbl: 'Study Groups' },
              ].map((s) => (
                <div key={s.lbl}>
                  <div className="stat-num">{s.num}</div>
                  <div className="stat-lbl">{s.lbl}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-card">
              <div className="card-header">
                <div className="dot dot-r" />
                <div className="dot dot-y" />
                <div className="dot dot-g" />
                <div className="card-url">edunexus.app/dashboard</div>
              </div>
              <div className="card-metrics">
                {[
                  { num: '12', lbl: 'Active Goals', bar: 'bar-blue', w: '75%' },
                  { num: '8', lbl: 'Completed Tasks', bar: 'bar-green', w: '90%' },
                  { num: '3', lbl: 'Pending Review', bar: 'bar-amber', w: '35%' },
                ].map((m) => (
                  <div className="metric-box" key={m.lbl}>
                    <div className="metric-num">{m.num}</div>
                    <div className="metric-lbl">{m.lbl}</div>
                    <div className={`metric-bar ${m.bar}`} style={{ width: m.w }} />
                  </div>
                ))}
              </div>
              <div className="ai-pill">
                <div className="ai-pill-icon">??</div>
                <div className="ai-pill-text">
                  <strong>AI Summary Ready</strong>
                  "Database Normalization" � 4 key points extracted
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="hp-section features-section" id="features">
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="section-head center fade-up">
            <div className="section-label">Platform Features</div>
            <h2 className="section-title">Everything you need to excel academically</h2>
            <p className="section-sub">
              Six core pillars that transform the way university students learn,
              collaborate, and grow together.
            </p>
          </div>
          <div className="features-grid">
            {FEATURES.map((f) => (
              <div className="feature-card fade-up" key={f.title}>
                <div className="feature-icon-wrap" style={{ background: f.bg }}>
                  <span style={{ color: f.color }}>{f.icon}</span>
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="ai-section" id="ai-summary">
        <div className="hero-bg-dots" />
        <div className="ai-inner">
          <div className="fade-up">
            <div className="section-label">AI-Powered Intelligence</div>
            <h2 className="section-title">From lecture file to smart notes in seconds</h2>
            <p className="section-sub">
              Our AI engine reads your uploaded materials and distills them into clean,
              actionable study content so you can focus on understanding � not note-taking.
            </p>
            <div className="ai-steps">
              {AI_STEPS.map((s) => (
                <div className="ai-step" key={s.num}>
                  <div className="ai-step-num">{s.num}</div>
                  <div>
                    <div className="ai-step-title">{s.title}</div>
                    <div className="ai-step-desc">{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="ai-demo-card fade-up">
            <div className="upload-zone">
              <div className="upload-icon">??</div>
              <div className="upload-text">
                <strong>Drag & drop</strong> your lecture file here
                <br />or click to browse
              </div>
              <div className="file-types">
                {["PDF", "PPT", "DOCX", "TXT"].map((t) => (
                  <span className="file-tag" key={t}>{t}</span>
                ))}
              </div>
            </div>
            <div className="ai-output">
              <div className="ai-output-label">? AI-Generated Summary � Database Systems</div>
              {AI_BULLETS.map((b, i) => (
                <div className="ai-bullet" key={i}>
                  <span className="ai-bullet-arrow">?</span>
                  {b}
                </div>
              ))}
            </div>
            </div>
          </div>
        </div>
      </section>

      <section className="hp-section steps-section" id="how-it-works">
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="section-head center fade-up">
            <div className="section-label">How It Works</div>
            <h2 className="section-title">Get started in four simple steps</h2>
            <p className="section-sub">
              From signup to full academic collaboration � EduNexus gets you productive
              in minutes.
            </p>
          </div>
          <div className="steps-grid fade-up">
            {HOW_STEPS.map((s, i) => (
              <div className="step-item" key={s.title}>
                <div className="step-circle-wrap">
                  <div className="step-circle">{s.icon}</div>
                  <div className="step-num-badge">{i + 1}</div>
                </div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="hp-section roles-section" id="roles">
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="section-head center fade-up">
            <div className="section-label">Built for Everyone</div>
            <h2 className="section-title">A platform that adapts to your role</h2>
            <p className="section-sub">
              Whether you\'re learning, teaching, or managing � EduNexus is tailored
              to your exact needs.
            </p>
          </div>
          <div className="roles-grid">
            {ROLES.map((r) => (
              <div className={`role-card ${r.variant} fade-up`} key={r.title}>
                <span className="role-emoji">{r.emoji}</span>
                <h3>{r.title}</h3>
                <p className="role-desc">{r.desc}</p>
                <ul className="role-features">
                  {r.features.map((f) => (
                    <li key={f}>
                      <span className={`check ${r.checkClass}`}>?</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="hp-section collab-section" id="collaboration">
        <div className="collab-inner">
          <div className="collab-visual fade-up">
            <p className="collab-visual-label">Active Study Groups</p>
            {GROUPS.map((g) => (
              <div className="group-card" key={g.name}>
                <div className={`group-icon ${g.bg}`}>{g.icon}</div>
                <div className="group-info">
                  <div className="group-name">{g.name}</div>
                  <div className="group-meta">{g.meta}</div>
                </div>
                <span className={`group-badge ${g.badgeClass}`}>{g.badge}</span>
              </div>
            ))}
          </div>

          <div className="fade-up">
            <div className="section-label">Group Collaboration</div>
            <h2 className="section-title">Study together. Achieve more.</h2>
            <p className="section-sub">
              Create or join subject-specific study groups where you can share materials,
              discuss ideas, and support each other through exams and assignments.
            </p>
            <div className="collab-features">
              {COLLAB_FEATURES.map((cf) => (
                <div className="cf" key={cf.title}>
                  <div className="cf-icon">{cf.icon}</div>
                  <div>
                    <div className="cf-title">{cf.title}</div>
                    <div className="cf-desc">{cf.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="hp-section resources-section" id="resources">
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="section-head center fade-up">
            <div className="section-label">Academic Resources</div>
            <h2 className="section-title">Share knowledge. Grow together.</h2>
            <p className="section-sub">
              A centralized hub for all your academic materials � organized, searchable,
              and always at your fingertips.
            </p>
          </div>
          <div className="resources-grid">
            {RESOURCES.map((r) => (
              <div className="res-card fade-up" key={r.title}>
                <span className="res-icon">{r.icon}</span>
                <h4>{r.title}</h4>
                <p>{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="stats-banner">
        <div className="stats-inner fade-up">
          {STATS.map((s) => (
            <div key={s.lbl}>
              <div className="stat-big-num">{s.num}</div>
              <div className="stat-big-lbl">{s.lbl}</div>
            </div>
          ))}
        </div>
      </div>

      <section className="hp-section testimonials-section" id="testimonials">
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="section-head center fade-up">
            <div className="section-label">Student Stories</div>
            <h2 className="section-title">What our community is saying</h2>
          </div>
          <div className="testimonials-grid">
            {TESTIMONIALS.map((t) => (
              <div className="testi-card fade-up" key={t.name}>
                <div className="testi-stars">{t.stars}</div>
                <p className="testi-quote">"{t.quote}"</p>
                <div className="testi-author">
                  <div className="testi-avatar">{t.initials}</div>
          <div className="testimonials-grid">
            {TESTIMONIALS.map((t) => (
              <div className="testi-card fade-up" key={t.name}>
                <div className="testi-stars">{t.stars}</div>
                <p className="testi-quote">"{t.quote}"</p>
                <div className="testi-author">
                  <div className="testi-avatar">{t.initials}</div>
                  <div>
                    <div className="testi-name">{t.name}</div>
                    <div className="testi-role-label">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="hero-bg-dots" />
        <div className="hero-glow" />
        <div className="cta-inner fade-up">
          <div className="section-label">Get Started Today</div>
          <h2 className="section-title">Ready to transform how you study?</h2>
          <p className="section-sub">
            Join thousands of university students already using EduNexus to learn
            faster, collaborate smarter, and achieve more.
          </p>
          <div className="cta-buttons">
            <Link to="/register" className="btn-hero-primary">Create Free Account</Link>
            <a href="#features" className="btn-hero-ghost">Explore Features</a>
          </div>
        </div>
      </section>

      <footer className="hp-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <a href="/" className="nav-logo">
              <div className="nav-logo-icon">??</div>
              <span className="nav-logo-text">Edu<em>Nexus</em></span>
            </a>
            <p>
              An intelligent Learning Management System designed to help students,
              lecturers, and admins seamlessly track academic progress and collaborate.
            </p>
          </div>

          <div className="footer-nav">
            <h5>Platform</h5>
            <ul>
              <li><a href="#features">Features</a></li>
              <li><a href="#how-it-works">How it Works</a></li>
              <li><a href="#roles">Roles</a></li>
              <li><a href="#collaboration">Collaboration</a></li>
            </ul>
          </div>

          <div className="footer-nav">
            <h5>Users</h5>
            <ul>
              <li><a href="#roles">For Students</a></li>
              <li><a href="#roles">For Lecturers</a></li>
              <li><a href="#roles">For Admins</a></li>
              <li><Link to="/register">Sign Up</Link></li>
            </ul>
          </div>

          <div className="footer-nav">
            <h5>Legal</h5>
            <ul>
              <li><a href="/privacy">Privacy Policy</a></li>
              <li><a href="/terms">Terms of Service</a></li>
              <li><a href="/cookies">Cookie Policy</a></li>
              <li><a href="/contact">Contact Us</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>� 2026 EduNexus. All rights reserved. Built with MERN Stack.</span>
          <div className="footer-socials">
            {["??", "in", "gh", "@"].map((icon) => (
              <a href="#" className="social-btn" key={icon}>{icon}</a>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}