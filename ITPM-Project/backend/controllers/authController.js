const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendError, sendSuccess } = require("./responseHelpers");

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// =====================
// REGISTER
// =====================
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Validate required fields
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

    // Duplicate email
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing)
      return sendError(res, "An account with this email already exists.", 409);

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: "student", // Self-registration is always student
    });

    await newUser.save();
    return sendSuccess(
      res,
      { message: "Account created successfully. Please log in." },
      201
    );
  } catch (err) {
    console.error(err);
    return sendError(res, "Server error. Please try again.");
  }
};

// =====================
// LOGIN
// =====================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !email.trim())
      return sendError(res, "Email is required.", 400);
    if (!password)
      return sendError(res, "Password is required.", 400);

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user)
      return sendError(res, "No account found with this email.", 404);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return sendError(res, "Incorrect password.", 400);

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return sendSuccess(res, {
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (err) {
    console.error(err);
    return sendError(res, "Server error. Please try again.");
  }
};

// =====================
// GET CURRENT USER
// =====================
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return sendError(res, "User not found.", 404);
    return sendSuccess(res, user);
  } catch (err) {
    console.error(err);
    return sendError(res, "Server error.");
  }
};
