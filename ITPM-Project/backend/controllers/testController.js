const { sendSuccess } = require("./responseHelpers");

// =====================
// GENERAL DASHBOARD
// =====================
exports.dashboard = (req, res) => {
  return sendSuccess(res, {
    message: "Welcome to dashboard",
    user: req.user,
  });
};
