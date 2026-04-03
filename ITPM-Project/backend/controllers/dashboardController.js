// =====================
// STUDENT DASHBOARD
// =====================
exports.studentDashboard = (req, res) => {
  res.json({ message: "Welcome Student Dashboard", user: req.user });
};

// =====================
// LECTURER DASHBOARD
// =====================
exports.lecturerDashboard = (req, res) => {
  res.json({ message: "Welcome Lecturer Dashboard", user: req.user });
};

// =====================
// ADMIN DASHBOARD
// =====================
exports.adminDashboard = (req, res) => {
  res.json({ message: "Welcome Admin Dashboard", user: req.user });
};
