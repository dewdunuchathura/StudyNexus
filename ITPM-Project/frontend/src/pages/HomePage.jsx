import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import '../styles/index.css';

const FEATURES = [
  {
    icon: '📚', bg: '#dbeafe', color: '#2563eb',
    title: 'AI Lecture Summaries',
    desc: 'Upload PDFs, PowerPoints, or Word docs and get intelligent AI-generated summaries with key concepts and bullet-point revision notes instantly.',
  },
  {
    icon: '👥', bg: '#dcfce7', color: '#16a34a',
    title: 'Study Group Management',
    desc: 'Create academic groups, send and manage join requests, assign group leader roles, and post announcements to your team effortlessly.',
  },
  {
    icon: '📁', bg: '#fce7f3', color: '#be185d',
    title: 'Resource Sharing Hub',
    desc: 'Upload and share study materials within groups, categorized by subject or module, with interactive commenting and interaction tools.',
  },
  {
    icon: '🏆', bg: '#fef3c7', color: '#b45309',
    title: 'Competitive Leaderboard',
    desc: 'Earn points for completed tasks, climb the academic ranks, and stay motivated through gamified peer competition across your institution.',
  },
  {
    icon: '🔒', bg: '#ede9fe', color: '#7c3aed',
    title: 'Enterprise Security',
    desc: 'JWT authentication, robust password hashing, and granular role-based permissions ensure your academic data stays private and protected.',
  },
  {
    icon: '📊', bg: '#e0f2fe', color: '#0284c7',
    title: 'Real-time Analytics',
    desc: 'Stay informed with instant visual metrics, progress bars, and high-level academic overviews to monitor your performance at a glance.',
  },
];

const AI_STEPS = [
  { num: '01', title: 'Upload Your Lecture Material', desc: 'Supports PDF, PPTX, DOCX – drag and drop or click to upload from any device.' },
  { num: '01', title: 'Upload Your Lecture Material', desc: 'Supports PDF, PPTX, DOCX � drag and drop or click to upload from any device.' },
  { num: '02', title: 'AI Processes & Extracts Key Concepts', desc: 'Our model analyzes structure, headings, and content to identify what matters most.' },
  { num: '03', title: 'Review, Save & Download', desc: 'Get a summary card with bullet-point notes you can save, search, or export instantly.' },
];

const HOW_STEPS = [
  { icon: '👤', title: 'Create Your Account', desc: 'Register as a Student, Lecturer, or Admin. Verify your email and set up your academic profile in under 2 minutes.' },
  { icon: '📤', title: 'Upload Study Materials', desc: 'Drop in lecture slides, PDFs, or notes. Our AI instantly processes and generates smart summaries for you.' },
  { icon: '🔗', title: 'Join or Create Groups', desc: 'Find study groups by module or subject, send a join request, and start sharing resources with peers.' },
  { icon: '📈', title: 'Track & Compete', desc: 'Monitor your progress dashboard, climb the leaderboard, and hit your academic goals with AI-powered insights.' },
];

const ROLES = [
  {
    title: 'Students',
    desc: 'Upload lecture materials, get AI summaries, join study groups, and track your academic progress.',
    features: ['AI Summaries', 'Group Collaboration', 'Progress Tracking', 'Leaderboard'],
  },
  {
    title: 'Lecturers',
    desc: 'Create and manage study groups, share resources, monitor student progress, and generate reports.',
    features: ['Group Management', 'Resource Sharing', 'Student Analytics', 'Report Generation'],
  },
  {
    title: 'Administrators',
    desc: 'Oversee the entire platform, manage users, view analytics, and ensure system security.',
    features: ['User Management', 'System Analytics', 'Security Oversight', 'Full Control'],
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
  const heroRef = useRef(null);

  useEffect(() => {
    // Smooth scroll animation
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SN</span>
              </div>
              <span className="font-bold text-xl text-gray-900">StudyNexus</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-gray-700 hover:text-blue-600 transition-colors">Home</Link>
              <Link to="/groups" className="text-gray-700 hover:text-blue-600 transition-colors">Groups</Link>
              <Link to="/create-group" className="text-gray-700 hover:text-blue-600 transition-colors">Create Group</Link>
              <Link to="/login" className="text-gray-700 hover:text-blue-600 transition-colors">Login</Link>
              <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Get Started
              </Link>
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
              <a href="/signup" className="btn-hero-primary">Start Learning Now</a>
              <a href="#how-it-works" className="btn-hero-ghost">? See How It Works</a>
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
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 animate-on-scroll" style={{ opacity: '0', transform: 'translateY(20px)', transition: 'all 0.6s ease-out' }}>
            Study Smarter with
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> AI-Powered</span>
            <br />
            Academic Excellence
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto animate-on-scroll" style={{ opacity: '0', transform: 'translateY(20px)', transition: 'all 0.6s ease-out 0.1s' }}>
            Transform your learning experience with intelligent lecture summaries, collaborative study groups, and real-time progress tracking.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-on-scroll" style={{ opacity: '0', transform: 'translateY(20px)', transition: 'all 0.6s ease-out 0.2s' }}>
            <Link
              to="/register"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              Start Free Trial
            </Link>
            <Link
              to="/groups"
              className="bg-white text-gray-700 px-8 py-4 rounded-lg font-semibold border border-gray-300 hover:border-gray-400 transition-all duration-200"
            >
              Browse Groups
            </Link>
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

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Powerful Features for Academic Success</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to excel in your studies, all in one platform
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 animate-on-scroll"
                style={{ opacity: '0', transform: 'translateY(20px)', transition: `all 0.6s ease-out ${0.1 * index}s` }}
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl mb-4`} style={{ backgroundColor: feature.bg, color: feature.color }}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Steps Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How AI Summaries Work</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get intelligent summaries in three simple steps

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
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {AI_STEPS.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl mb-4 mx-auto">
                  {step.num}

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
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How StudyNexus Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get started in minutes and transform your study routine

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
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {HOW_STEPS.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-2xl mb-4 mx-auto">
                  {step.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Built for Everyone</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Tailored features for students, lecturers, and administrators
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
          <div className="grid md:grid-cols-3 gap-8">
            {ROLES.map((role, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{role.title}</h3>
                <p className="text-gray-600 mb-6">{role.desc}</p>
                <ul className="space-y-2">
                  {role.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-gray-700">
                      <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Transform Your Study Experience?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of students already using StudyNexus to excel academically
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Get Started Free
            </Link>
            <Link
              to="/create-group"
              className="bg-transparent text-white px-8 py-4 rounded-lg font-semibold border border-white hover:bg-white hover:bg-opacity-10 transition-colors"
            >
              Create Study Group
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SN</span>
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
              <span className="font-bold text-xl text-white">StudyNexus</span>
            </div>
            <p className="text-gray-400">Empowering academic excellence through AI and collaboration.</p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-2">
              <li><Link to="/features" className="hover:text-white transition-colors">Features</Link></li>
              <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              <li><Link to="/api" className="hover:text-white transition-colors">API</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="hover:text-white transition-colors">About</Link></li>
              <li><Link to="/blog" className="hover:text-white transition-colors">Blog</Link></li>
              <li><Link to="/careers" className="hover:text-white transition-colors">Careers</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Support</h4>
            <ul className="space-y-2">
              <li><Link to="/help" className="hover:text-white transition-colors">Help Center</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link to="/status" className="hover:text-white transition-colors">Status</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-gray-800 text-center">
          <p>&copy; 2024 StudyNexus. All rights reserved.</p>

        <div className="footer-bottom">
          <span>2026 EduNexus. All rights reserved. Built with MERN Stack.</span>
          <div className="footer-socials">
            {["??", "in", "gh", "@"].map((icon) => (
              <a href="#" className="social-btn" key={icon}>{icon}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
