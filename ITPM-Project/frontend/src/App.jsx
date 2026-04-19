import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import HomePage from './pages/HomePage.jsx';
import Home2 from './pages/home2.jsx';
import CreateGroup from './pages/CreateGroup.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/register.jsx';
import AllGroups from './pages/AllGroups.jsx';
import GroupDetail from './pages/GroupDetail.jsx';
import GroupJoined from './pages/GroupJoined.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import AdminReports from './pages/AdminReports.jsx';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/home2" element={<Home2 />} />
          <Route path="/create-group" element={<CreateGroup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/groups" element={<AllGroups />} />
          <Route path="/group/:id" element={<GroupDetail />} />
          <Route path="/group-joined/:id" element={<GroupJoined />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/reports" element={<AdminReports />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
