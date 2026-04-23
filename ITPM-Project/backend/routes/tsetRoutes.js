const router = require("express").Router();
const authMiddleware = require("../middleware/authMiddleware");
const { dashboard } = require("../controllers/testController");

router.get("/dashboard", authMiddleware, dashboard);

module.exports = router;