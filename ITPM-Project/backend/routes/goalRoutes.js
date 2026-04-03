const router = require("express").Router();
const authMiddleware = require("../middleware/authMiddleware");
const { getAllGoals, createGoal, updateGoal, deleteGoal, getLeaderboard } = require("../controllers/goalController");

router.get("/leaderboard", authMiddleware, getLeaderboard);
router.get("/", authMiddleware, getAllGoals);
router.post("/", authMiddleware, createGoal);
router.put("/:id", authMiddleware, updateGoal);
router.delete("/:id", authMiddleware, deleteGoal);

module.exports = router;
