import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleProtectedRoute from "./components/RoleProtectedRoute";
import Layout from "./components/Layout";

// Pages — lazy loaded for better performance
const Login        = React.lazy(() => import("./pages/Login"));
const Register     = React.lazy(() => import("./pages/Register"));
const Dashboard    = React.lazy(() => import("./pages/Dashboard"));
const Leaderboard  = React.lazy(() => import("./pages/Leaderboard"));
const HomePage     = React.lazy(() => import("./pages/HomePage"));
const Home2        = React.lazy(() => import("./pages/Home2"));

// Dewdunu — Feature pages
const AISummary         = React.lazy(() => import("./pages/AISummary"));
const SummaryPage       = React.lazy(() => import("./pages/SummaryPage"));
const RevisionNotesPage = React.lazy(() => import("./pages/RevisionNotesPage"));
const QuestionsPage     = React.lazy(() => import("./pages/QuestionsPage"));

// Mindula & Pamuditha — Admin Dashboards
const AcademicResources = React.lazy(() => import("./pages/AcademicResources"));
const AdminDashboard    = React.lazy(() => import("./pages/AdminDashboard"));

// Pamuditha — Group Features
const CreateGroup       = React.lazy(() => import("./pages/CreateGroup"));
const AllGroups         = React.lazy(() => import("./pages/AllGroups"));
const GroupDetail       = React.lazy(() => import("./pages/GroupDetail"));
const GroupJoined       = React.lazy(() => import("./pages/GroupJoined"));
const AdminReports      = React.lazy(() => import("./pages/AdminReports"));

// Admin / Lecturer only — lazy loaded
const UserManagement = React.lazy(() => import("./pages/UserManagement"));
const Admin          = React.lazy(() => import("./pages/admin"));

const LoadingFallback = () => (
  <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
    Loading...
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/"         element={<HomePage />} />
              <Route path="/login"    element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Authenticated — Home2 is the central hub after login */}
              <Route
                path="/home2"
                element={
                  <ProtectedRoute>
                    <Home2 />
                  </ProtectedRoute>
                }
              />
              <Route path="/home" element={<Navigate to="/home2" replace />} />

              {/* Goal Tracking */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/leaderboard"
                element={
                  <ProtectedRoute>
                    <Leaderboard />
                  </ProtectedRoute>
                }
              />

              {/* Pamuditha — Group Routes */}
              <Route
                path="/create-group"
                element={
                  <ProtectedRoute>
                    <CreateGroup />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/all-groups"
                element={
                  <ProtectedRoute>
                    <AllGroups />
                  </ProtectedRoute>
                }
              />
              <Route path="/groups" element={<Navigate to="/all-groups" replace />} />
              
              <Route
                path="/group/:id"
                element={
                  <ProtectedRoute>
                    <GroupDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/group-joined/:id"
                element={
                  <ProtectedRoute>
                    <GroupJoined />
                  </ProtectedRoute>
                }
              />

              {/* Mindula — Academic Resources (accessible to all logged users) */}
              <Route
                path="/academic-resources"
                element={
                  <ProtectedRoute>
                    <AcademicResources />
                  </ProtectedRoute>
                }
              />
              <Route path="/resources" element={<Navigate to="/academic-resources" replace />} />

              {/* Admin / Lecturer only routes */}
              <Route
                path="/users"
                element={
                  <RoleProtectedRoute allowedRoles={["admin", "lecturer"]}>
                    <UserManagement />
                  </RoleProtectedRoute>
                }
              />

              <Route
                path="/admin/reports"
                element={
                  <RoleProtectedRoute allowedRoles={["admin"]}>
                    <AdminReports />
                  </RoleProtectedRoute>
                }
              />

              <Route
                path="/admin"
                element={
                  <RoleProtectedRoute allowedRoles={["admin", "lecturer"]}>
                    <Admin />
                  </RoleProtectedRoute>
                }
              />

              <Route
                path="/admindashboard"
                element={
                  <RoleProtectedRoute allowedRoles={["admin", "lecturer"]}>
                    <AdminDashboard />
                  </RoleProtectedRoute>
                }
              />
              <Route path="/admin-dashboard" element={<Navigate to="/admindashboard" replace />} />

              {/* Dewdunu — AI Feature Pages */}
              <Route
                path="/ai-summary"
                element={
                  <ProtectedRoute>
                    <AISummary />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/summary"
                element={
                  <ProtectedRoute>
                    <SummaryPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/revision-notes"
                element={
                  <ProtectedRoute>
                    <RevisionNotesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/questions"
                element={
                  <ProtectedRoute>
                    <QuestionsPage />
                  </ProtectedRoute>
                }
              />

              {/* Fallback for unknown routes */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
