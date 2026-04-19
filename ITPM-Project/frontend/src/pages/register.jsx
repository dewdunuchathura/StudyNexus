import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, UserPlus, Eye, EyeOff, X } from "lucide-react";
import "./Auth.css";

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidName = (name) => /^[a-zA-Z\s]+$/.test(name);

const Register = () => {
    const { register, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate("/dashboard");
        }
    }, [user, navigate]);

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!formData.firstName.trim()) {
            return setError("First name is required.");
        }
        if (!isValidName(formData.firstName.trim())) {
            return setError("First name can only contain letters and spaces.");
        }
        if (!formData.lastName.trim()) {
            return setError("Last name is required.");
        }
        if (!isValidName(formData.lastName.trim())) {
            return setError("Last name can only contain letters and spaces.");
        }
        if (!formData.email.trim()) {
            return setError("Email address is required.");
        }
        if (!isValidEmail(formData.email.trim())) {
            return setError("Please enter a valid email address.");
        }
        if (!formData.password) {
            return setError("Password is required.");
        }
        if (formData.password.length < 6) {
            return setError("Password must be at least 6 characters.");
        }
        if (formData.password !== formData.confirmPassword) {
            return setError("Passwords do not match.");
        }
        if (!agreedToTerms) {
            return setError("You must agree to the Terms & Conditions.");
        }

        setLoading(true);
        try {
            // We omit confirmPassword when sending to the backend
            const { confirmPassword, ...dataToSubmit } = formData;
            await register(dataToSubmit);
            navigate("/login");
        } catch (err) {
            const msg = err.response?.data?.message
                || err.response?.data
                || "Failed to register. Please try again.";
            setError(typeof msg === "string" ? msg : "Failed to register. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="auth-split-screen">
            {/* Left Banner */}
            <div className="auth-banner">
                <div className="auth-banner-content">
                    <h1>Join EduCore</h1>
                    <p>Create your account today and start managing your academic journey with a modern and secure experience.</p>
                </div>
            </div>

            {/* Right Form */}
            <div className="auth-form-container">
                <div className="auth-card">
                    <button className="auth-close" onClick={() => navigate("/")} aria-label="Close">
                        <X size={20} />
                    </button>

                    <div className="auth-header">
                        <h2>Create Account</h2>
                        <p>Join us today! Fill in your details to get started.</p>
                    </div>

                    <form className="auth-form" onSubmit={handleSubmit}>
                        {error && (
                            <div className="auth-error">{error}</div>
                        )}

                        <div className="auth-name-row">
                            <div className="auth-field">
                                <div className="auth-field-icon"><User size={18} /></div>
                                <input
                                    id="firstName"
                                    name="firstName"
                                    type="text"
                                    required
                                    className="auth-input"
                                    placeholder="First Name"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="auth-field">
                                <div className="auth-field-icon"><User size={18} /></div>
                                <input
                                    id="lastName"
                                    name="lastName"
                                    type="text"
                                    required
                                    className="auth-input"
                                    placeholder="Last Name"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="auth-field">
                            <div className="auth-field-icon"><Mail size={18} /></div>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="auth-input"
                                placeholder="Email Address"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="auth-field">
                            <div className="auth-field-icon"><Lock size={18} /></div>
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                autoComplete="new-password"
                                required
                                className="auth-input"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                            />
                            <button
                                type="button"
                                className="auth-password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        <div className="auth-field">
                            <div className="auth-field-icon"><Lock size={18} /></div>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                autoComplete="new-password"
                                required
                                className="auth-input"
                                placeholder="Confirm Password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                            />
                            <button
                                type="button"
                                className="auth-password-toggle"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        <label className="terms-checkbox">
                            <input
                                type="checkbox"
                                required
                                checked={agreedToTerms}
                                onChange={(e) => setAgreedToTerms(e.target.checked)}
                            />
                            <span>I agree to the <Link to="#">Terms & Conditions</Link></span>
                        </label>

                        <button
                            type="submit"
                            disabled={loading}
                            className="auth-btn"
                        >
                            <span className="auth-btn-icon">
                                {loading ? (
                                    <div className="auth-spinner"></div>
                                ) : (
                                    <UserPlus size={18} />
                                )}
                            </span>
                            {loading ? "Creating..." : "Create My Account"}
                        </button>

                        <div className="auth-footer-text">
                            Already have an account?{" "}
                            <Link to="/login" className="auth-link">
                                Sign In
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;
