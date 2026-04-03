const bcrypt  = require("bcryptjs");
const User    = require("../models/User");

// Helper — basic email format check
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// =====================
// ADD USER
// =====================
exports.addUser = async (req, res) => {
  const { firstName, lastName, email, password, role, status } = req.body;

  // Validation
  if (!firstName || !firstName.trim())
    return res.status(400).json({ message: "First name is required." });
  if (!lastName || !lastName.trim())
    return res.status(400).json({ message: "Last name is required." });
  if (!email || !email.trim())
    return res.status(400).json({ message: "Email is required." });
  if (!isValidEmail(email))
    return res.status(400).json({ message: "Please enter a valid email address." });
  if (!password || password.length < 6)
    return res.status(400).json({ message: "Password must be at least 6 characters." });
  if (!role || !["student", "lecturer", "admin"].includes(role))
    return res.status(400).json({ message: "Role must be student, lecturer, or admin." });

  try {
    // Duplicate email check
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing)
      return res.status(409).json({ message: "A user with this email already exists." });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstName: firstName.trim(),
      lastName:  lastName.trim(),
      email:     email.toLowerCase().trim(),
      password:  hashedPassword,
      role,
      status:    status || "Active",
    });

    const saved = await newUser.save();
    const { password: _pw, ...userWithoutPassword } = saved.toObject();
    return res.status(201).json({ message: "User added successfully.", user: userWithoutPassword });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error adding user." });
  }
};

// =====================
// GET ALL USERS
// =====================
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 }).lean();
    return res.json(users);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error fetching users." });
  }
};

// =====================
// UPDATE USER
// =====================
exports.updateUser = async (req, res) => {
  const { firstName, lastName, email, role, status } = req.body;

  // Validate email if provided
  if (email && !isValidEmail(email))
    return res.status(400).json({ message: "Please enter a valid email address." });

  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found." });

    // Only update the fields that were sent
    if (firstName && firstName.trim()) user.firstName = firstName.trim();
    if (lastName  && lastName.trim())  user.lastName  = lastName.trim();
    if (email     && email.trim())     user.email     = email.toLowerCase().trim();
    if (role      && ["student", "lecturer", "admin"].includes(role)) user.role = role;
    if (status)                        user.status    = status;

    const updated = await user.save();
    const { password: _pw, ...userWithoutPassword } = updated.toObject();
    return res.json({ message: "User updated successfully.", user: userWithoutPassword });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error updating user." });
  }
};

// =====================
// DELETE USER
// =====================
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found." });

    await user.deleteOne();
    return res.json({ message: "User deleted successfully." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error deleting user." });
  }
};
