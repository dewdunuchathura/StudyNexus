const router = require("express").Router();
const authMiddleware = require("../middleware/authMiddleware");
const allowRoles   = require("../middleware/roleMiddleware");
const { addUser, getAllUsers, updateUser, deleteUser } = require("../controllers/userController");

// All user-management routes require:
//   1. valid JWT              → authMiddleware
//   2. role = admin OR lecturer → allowRoles(...)
const guard = [authMiddleware, allowRoles("admin", "lecturer")];

router.post("/add",   ...guard, addUser);
router.get("/",       ...guard, getAllUsers);
router.put("/:id",    ...guard, updateUser);
router.delete("/:id", ...guard, deleteUser);

module.exports = router;