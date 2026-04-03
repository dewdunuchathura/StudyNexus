const bcrypt = require("bcryptjs");
const jwt    = require("jsonwebtoken");
const User   = require("../models/User");

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// =====================
// REGISTER
// =====================
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Validate required fields
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

    // Duplicate email
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing)
      return res.status(409).json({ message: "An account with this email already exists." });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstName: firstName.trim(),
      lastName:  lastName.trim(),
      email:     email.toLowerCase().trim(),
      password:  hashedPassword,
      role:      "student",   // Self-registration is always student
    });

    await newUser.save();
    return res.status(201).json({ message: "Account created successfully. Please log in." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error. Please try again." });
  }
};

// =====================
// LOGIN
// =====================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !email.trim())
      return res.status(400).json({ message: "Email is required." });
    if (!password)
      return res.status(400).json({ message: "Password is required." });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user)
      return res.status(404).json({ message: "No account found with this email." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Incorrect password." });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({
      message: "Login successful.",
      token,
      user: {
        id:        user._id,
        firstName: user.firstName,
        lastName:  user.lastName,
        email:     user.email,
        role:      user.role,
        status:    user.status,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error. Please try again." });
  }
};

// =====================
// GET CURRENT USER
// =====================
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found." });
    return res.json(user);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error." });
  }
};
