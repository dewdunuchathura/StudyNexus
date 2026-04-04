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
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {AI_STEPS.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl mb-4 mx-auto">
                  {step.num}
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
        </div>
      </footer>
    </div>
  );
}
