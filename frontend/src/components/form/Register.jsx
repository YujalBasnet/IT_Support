import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { TicketCheck, Eye, EyeOff, Mail, Lock, User, ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import api from "../../services/api";

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
      <path fill="none" d="M0 0h48v48H0z"/>
    </svg>
  );
}

function PasswordField({ id, label, value, onChange, placeholder }) {
  const [show, setShow] = useState(false);
  return (
    <div className="auth-field">
      <label htmlFor={id} className="auth-label">{label}</label>
      <div className="auth-input-wrap">
        <Lock size={16} className="auth-input-icon" />
        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="auth-input"
          required
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          className="auth-eye-btn"
          tabIndex={-1}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5000/auth/google";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", { name, email, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      const role = Number(data.user.role_id);
      if (role === 1) navigate("/employee", { replace: true });
      else if (role === 2) navigate("/agent", { replace: true });
      else if (role === 3) navigate("/admin", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page register-theme">
      <div className="auth-bg-orb auth-bg-orb-1" />
      <div className="auth-bg-orb auth-bg-orb-2" />

      <div className="auth-card">
        {/* Brand */}
        <div className="auth-brand">
          <div className="auth-brand-icon">
            <TicketCheck color="#fff" size={28} />
          </div>
          <div>
            <h1 className="auth-brand-title">Create Your Account</h1>
            <p className="auth-brand-sub">Join the IT Support System as an Employee</p>
          </div>
        </div>

        {/* Google */}
        <button className="auth-google-btn" onClick={handleGoogleLogin} id="google-register-btn">
          <GoogleIcon />
          Sign up with Google
        </button>

        <div className="auth-divider">or register with email</div>

        <h2 className="auth-form-title">Account Details</h2>

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {error && <div className="auth-error">{error}</div>}

          {/* Full Name */}
          <div className="auth-field">
            <label htmlFor="reg-name" className="auth-label">Full Name</label>
            <div className="auth-input-wrap">
              <User size={16} className="auth-input-icon" />
              <input
                id="reg-name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="John Doe"
                className="auth-input"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="auth-field">
            <label htmlFor="reg-email" className="auth-label">Email Address</label>
            <div className="auth-input-wrap">
              <Mail size={16} className="auth-input-icon" />
              <input
                id="reg-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="auth-input"
                required
              />
            </div>
          </div>

          {/* Password */}
          <PasswordField
            id="reg-password"
            label="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Min. 6 characters"
          />
          <p className="auth-hint">Must be at least 6 characters long.</p>

          {/* Confirm Password */}
          <PasswordField
            id="reg-confirm"
            label="Confirm Password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            placeholder="Repeat your password"
          />

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? <Loader2 size={18} className="spin" /> : <ArrowRight size={18} />}
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        {/* Switch to Login */}
        <p className="auth-switch">
          Already have an account?{" "}
          <Link to="/login">Sign in instead</Link>
        </p>

        <div className="auth-footer">
          <ShieldCheck size={13} />
          Secured with JWT · IT Support {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
}
