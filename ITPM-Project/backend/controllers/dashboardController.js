const { sendSuccess } = require("./responseHelpers");

// =====================
// STUDENT DASHBOARD
// =====================
exports.studentDashboard = (req, res) => {
  return sendSuccess(res, { message: "Welcome Student Dashboard", user: req.user });
};

// =====================
// LECTURER DASHBOARD
// =====================
exports.lecturerDashboard = (req, res) => {
  return sendSuccess(res, { message: "Welcome Lecturer Dashboard", user: req.user });
};

// =====================
// ADMIN DASHBOARD
// =====================
exports.adminDashboard = (req, res) => {
  return sendSuccess(res, { message: "Welcome Admin Dashboard", user: req.user });
};
