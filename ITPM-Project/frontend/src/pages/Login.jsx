import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, LogIn, Eye, EyeOff, X } from "lucide-react";
import "./Auth.css";

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const Login = () => {
    const { login, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate("/dashboard");
        }
    }, [user, navigate]);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!email.trim()) {
            return setError("Email address is required.");
        }
        if (!isValidEmail(email.trim())) {
            return setError("Please enter a valid email address.");
        }
        if (!password) {
            return setError("Password is required.");
        }

        setLoading(true);
        try {
            await login(email, password);
            navigate("/dashboard");
        } catch (err) {
            const msg = err.response?.data?.message
                || err.response?.data
                || "Failed to login. Please try again.";
            setError(typeof msg === "string" ? msg : "Failed to login. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-split-screen">
            {/* Left Banner */}
            <div className="auth-banner">
                <div className="auth-banner-content">
                    <h1>Welcome Back!</h1>
                    <p>Log in to your account and continue managing your academic goals.</p>
                </div>
            </div>

            {/* Right Form */}
            <div className="auth-form-container">
                <div className="auth-card">
                    <button className="auth-close" onClick={() => navigate("/")} aria-label="Close">
                        <X size={20} />
                    </button>

                    <div className="auth-header">
                        <h2>Welcome Back</h2>
                        <p>Please enter your credentials to continue.</p>
                    </div>

                    <form className="auth-form" onSubmit={handleSubmit}>
                        {error && (
                            <div className="auth-error">{error}</div>
                        )}

                        <div className="auth-field">
                            <div className="auth-field-icon">
                                <Mail size={18} />
                            </div>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="auth-input"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="auth-field">
                            <div className="auth-field-icon">
                                <Lock size={18} />
                            </div>
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                autoComplete="current-password"
                                required
                                className="auth-input"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                className="auth-password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        <div className="auth-forgot">
                            <Link to="#">Forgot password?</Link>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="auth-btn"
                        >
                            <span className="auth-btn-icon">
                                {loading ? (
                                    <div className="auth-spinner"></div>
                                ) : (
                                    <LogIn size={18} />
                                )}
                            </span>
                            {loading ? "Logging in..." : "Login"}
                        </button>

                        <div className="auth-footer-text">
                            Don't have an account?{" "}
                            <Link to="/register" className="auth-link">
                                Sign up
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
