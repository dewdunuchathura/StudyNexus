const router = require("express").Router();
const verifyToken = require("../middleware/verifyToken");
const allowRoles = require("../middleware/roleMiddleware");
const { studentDashboard, lecturerDashboard, adminDashboard } = require("../controllers/dashboardController");

// Student dashboard
router.get("/student-dashboard", verifyToken, allowRoles("student"), studentDashboard);

// Lecturer dashboard
router.get("/lecturer-dashboard", verifyToken, allowRoles("lecturer"), lecturerDashboard);

// Admin dashboard
router.get("/admin-dashboard", verifyToken, allowRoles("admin"), adminDashboard);

module.exports = router;