import React from 'react';
import { BrowserRouter as Router, Routes,Navigate, Route, Link } from 'react-router-dom';
import AcademicResources from './pages/AcademicResources.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import HomePage from './pages/HomePage.jsx';
import Home2 from "./pages/Home2.jsx";
import AISummary from "./pages/AISummary.jsx";
import SummaryPage from "./pages/SummaryPage.jsx";
import RevisionNotesPage from "./pages/RevisionNotesPage.jsx";
import QuestionsPage from "./pages/QuestionsPage.jsx";

// Academic Resources Page with its own navigation
function AcademicResourcesPage() {
  return (
    <div>
      {/* Navigation for Academic Resources */}
      <nav style={{ backgroundColor: '#ffffff', boxShadow: '0 2px 24px rgba(15, 27, 107, 0.12)', borderBottom: '1px solid rgba(37, 99, 235, 0.12)', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: '1152px', margin: '0 auto', padding: '0 16px', paddingTop: '16px', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <Link to="/" style={{ fontSize: '20px', fontWeight: '800', color: '#111827', textDecoration: 'none', fontFamily: 'Sora, sans-serif' }}>StudyNexus</Link>
            <Link to="/resources" style={{ fontSize: '16px', color: '#2563eb', textDecoration: 'none', transition: 'color 0.2s', fontFamily: 'Sora, sans-serif', fontWeight: '600' }}
              onMouseEnter={(e) => e.target.style.color = '#1a2fa8'}
              onMouseLeave={(e) => e.target.style.color = '#2563eb'}
            >Academic Resources</Link>
          </div>
        </div>
      </nav>
      {/* Academic Resources Content */}
      <AcademicResources />
    </div>
  );
}

// Admin Dashboard Page with its own navigation
function AdminDashboardPage() {
  return (
    <div>
      {/* Navigation for Admin Dashboard */}
      <nav style={{ backgroundColor: '#0f1b6b', boxShadow: '0 2px 24px rgba(15, 27, 107, 0.25)', borderBottom: '1px solid rgba(37, 99, 235, 0.12)', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: '1152px', margin: '0 auto', padding: '0 16px', paddingTop: '16px', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <Link to="/" style={{ fontSize: '20px', fontWeight: '800', color: '#ffffff', textDecoration: 'none', fontFamily: 'Sora, sans-serif' }}>StudyNexus</Link>
              <Link to="/admin" style={{ fontSize: '16px', color: '#22d3ee', textDecoration: 'none', transition: 'color 0.2s', fontFamily: 'Sora, sans-serif', fontWeight: '600' }}
                onMouseEnter={(e) => e.target.style.color = '#67e8f9'}
                onMouseLeave={(e) => e.target.style.color = '#22d3ee'}
              >Admin Dashboard</Link>
            </div>
            <div>
              <Link to="/resources" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', transition: 'color 0.2s', fontFamily: 'Sora, sans-serif', fontWeight: '500' }}
                onMouseEnter={(e) => e.target.style.color = '#ffffff'}
                onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.7)'}
              >Academic Resources</Link>
            </div>
          </div>
        </div>
      </nav>
      {/* Admin Dashboard Content */}
      <AdminDashboard />
    </div>

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/resources" element={<AcademicResourcesPage />} />
        <Route path="/admin" element={<AdminDashboardPage />} />
          

        <Route path="/home2" element={<Home2 />} />
        <Route path="/ai-summary" element={<AISummary />} />
        <Route path="/summary" element={<SummaryPage />} />
        <Route path="/revision-notes" element={<RevisionNotesPage />} />
        <Route path="/questions" element={<QuestionsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}






