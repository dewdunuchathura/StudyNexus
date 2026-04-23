const router = require("express").Router();
const authMiddleware = require("../middleware/authMiddleware");
const { register, login, getCurrentUser } = require("../controllers/authController");

// =====================
// REGISTER
// =====================
router.post("/register", register);

// =====================
// LOGIN
// =====================
router.post("/login", login);

// =====================
// GET CURRENT USER
// =====================
router.get("/me", authMiddleware, getCurrentUser);

module.exports = router;