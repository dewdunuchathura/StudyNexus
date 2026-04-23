const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { sendError, sendSuccess } = require("./responseHelpers");

// Helper — basic email format check
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// =====================
// ADD USER
// =====================
exports.addUser = async (req, res) => {
  const { firstName, lastName, email, password, role, status } = req.body;

  // Validation
  if (!firstName || !firstName.trim())
    return sendError(res, "First name is required.", 400);
  if (!lastName || !lastName.trim())
    return sendError(res, "Last name is required.", 400);
  if (!email || !email.trim())
    return sendError(res, "Email is required.", 400);
  if (!isValidEmail(email))
    return sendError(res, "Please enter a valid email address.", 400);
  if (!password || password.length < 6)
    return sendError(res, "Password must be at least 6 characters.", 400);
  if (!role || !["student", "lecturer", "admin"].includes(role))
    return sendError(res, "Role must be student, lecturer, or admin.", 400);

  try {
    // Duplicate email check
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing)
      return sendError(res, "A user with this email already exists.", 409);

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role,
      status: status || "Active",
    });

    const saved = await newUser.save();
    const { password: _pw, ...userWithoutPassword } = saved.toObject();
    return sendSuccess(
      res,
      { message: "User added successfully.", user: userWithoutPassword },
      201
    );
  } catch (err) {
    console.error(err);
    return sendError(res, "Error adding user.");
  }
};

// =====================
// GET ALL USERS
// =====================
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 }).lean();
    return sendSuccess(res, users);
  } catch (err) {
    console.error(err);
    return sendError(res, "Error fetching users.");
  }
};

// =====================
// UPDATE USER
// =====================
exports.updateUser = async (req, res) => {
  const { firstName, lastName, email, role, status } = req.body;

  // Validate email if provided
  if (email && !isValidEmail(email))
    return sendError(res, "Please enter a valid email address.", 400);

  try {
    const user = await User.findById(req.params.id);
    if (!user) return sendError(res, "User not found.", 404);

    // Only update the fields that were sent
    if (firstName && firstName.trim()) user.firstName = firstName.trim();
    if (lastName && lastName.trim()) user.lastName = lastName.trim();
    if (email && email.trim()) user.email = email.toLowerCase().trim();
    if (role      && ["student", "lecturer", "admin"].includes(role)) user.role = role;
    if (status) user.status = status;

    const updated = await user.save();
    const { password: _pw, ...userWithoutPassword } = updated.toObject();
    return sendSuccess(res, {
      message: "User updated successfully.",
      user: userWithoutPassword,
    });
  } catch (err) {
    console.error(err);
    return sendError(res, "Error updating user.");
  }
};

// =====================
// DELETE USER
// =====================
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return sendError(res, "User not found.", 404);

    await user.deleteOne();
    return sendSuccess(res, { message: "User deleted successfully." });
  } catch (err) {
    console.error(err);
    return sendError(res, "Error deleting user.");
  }
};
