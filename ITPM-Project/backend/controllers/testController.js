// =====================
// GENERAL DASHBOARD
// =====================
exports.dashboard = (req, res) => {
  res.json({
    message: "Welcome to dashboard",
    user: req.user
  });
};
