import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, TicketCheck, Eye, EyeOff, Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";
import api from "../../services/api";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const roleRedirect = (roleId, navigate) => {
  const r = Number(roleId);
  if (r === 1) navigate("/employee", { replace: true });
  else if (r === 2) navigate("/agent", { replace: true });
  else if (r === 3) navigate("/admin", { replace: true });
  else navigate("/login", { replace: true });
};

const saveAuth = (token, user) => {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
};

// ─── Google SVG Icon ─────────────────────────────────────────────────────────
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

// ─── Input Field ─────────────────────────────────────────────────────────────
function InputField({ id, label, type = "text", icon: Icon, value, onChange, placeholder, rightElement }) {
  return (
    <div className="login-field">
      <label htmlFor={id} className="login-label">{label}</label>
      <div className="login-input-wrap">
        <Icon size={16} className="login-input-icon" />
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="login-input"
          required
          autoComplete="off"
        />
        {rightElement}
      </div>
    </div>
  );
}

// ─── Password Field ───────────────────────────────────────────────────────────
function PasswordField({ id, label, value, onChange, placeholder }) {
  const [show, setShow] = useState(false);
  return (
    <InputField
      id={id}
      label={label}
      type={show ? "text" : "password"}
      icon={Lock}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rightElement={
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          className="login-eye-btn"
          tabIndex={-1}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      }
    />
  );
}

// ─── Login Form ───────────────────────────────────────────────────────────────
function LoginForm({ onSwitch }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      saveAuth(data.token, data.user);
      roleRedirect(data.user.role_id, navigate);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="login-form" noValidate>
      {error && <div className="login-error">{error}</div>}
      <InputField
        id="login-email"
        label="Email address"
        type="email"
        icon={Mail}
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="you@company.com"
      />
      <PasswordField
        id="login-password"
        label="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="Enter your password"
      />
      <button type="submit" className="login-submit-btn" disabled={loading}>
        {loading ? <Loader2 size={18} className="spin" /> : <ArrowRight size={18} />}
        {loading ? "Signing in…" : "Sign In"}
      </button>
      <p className="login-switch-text">
        Don't have an account?{" "}
        <button type="button" onClick={onSwitch} className="login-link-btn">
          Create one
        </button>
      </p>
    </form>
  );
}

// ─── Register Form ────────────────────────────────────────────────────────────
function RegisterForm({ onSwitch }) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", { name, email, password });
      saveAuth(data.token, data.user);
      roleRedirect(data.user.role_id, navigate);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="login-form" noValidate>
      {error && <div className="login-error">{error}</div>}
      <InputField
        id="reg-name"
        label="Full name"
        icon={User}
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="John Doe"
      />
      <InputField
        id="reg-email"
        label="Email address"
        type="email"
        icon={Mail}
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="you@company.com"
      />
      <PasswordField
        id="reg-password"
        label="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="Min. 6 characters"
      />
      <PasswordField
        id="reg-confirm"
        label="Confirm password"
        value={confirm}
        onChange={e => setConfirm(e.target.value)}
        placeholder="Repeat your password"
      />
      <button type="submit" className="login-submit-btn" disabled={loading}>
        {loading ? <Loader2 size={18} className="spin" /> : <ArrowRight size={18} />}
        {loading ? "Creating account…" : "Create Account"}
      </button>
      <p className="login-switch-text">
        Already have an account?{" "}
        <button type="button" onClick={onSwitch} className="login-link-btn">
          Sign in
        </button>
      </p>
    </form>
  );
}

// ─── Main Login Page ──────────────────────────────────────────────────────────
export default function Login() {
  const [tab, setTab] = useState("login"); // "login" | "register"

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5000/auth/google";
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px 16px;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
          font-family: 'Inter', sans-serif;
          position: relative;
          overflow: hidden;
        }

        .login-bg-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
        }
        .login-bg-orb-1 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%);
          top: -100px; left: -100px;
        }
        .login-bg-orb-2 {
          width: 350px; height: 350px;
          background: radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%);
          bottom: -80px; right: -80px;
        }

        .login-card {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 420px;
          background: rgba(255,255,255,0.05);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 24px;
          padding: 36px 32px;
          box-shadow: 0 32px 64px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05);
        }

        .login-brand {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 28px;
          gap: 12px;
        }
        .login-brand-icon {
          width: 56px; height: 56px;
          background: linear-gradient(135deg, #3b82f6, #6366f1);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 24px rgba(99,102,241,0.4);
        }
        .login-brand-title {
          font-size: 22px;
          font-weight: 800;
          color: #f8fafc;
          letter-spacing: -0.5px;
          margin: 0;
        }
        .login-brand-sub {
          font-size: 13px;
          color: #94a3b8;
          margin: 0;
        }

        .login-tabs {
          display: flex;
          background: rgba(255,255,255,0.06);
          border-radius: 12px;
          padding: 4px;
          margin-bottom: 24px;
        }
        .login-tab {
          flex: 1;
          padding: 9px;
          border: none;
          border-radius: 9px;
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          background: transparent;
          color: #64748b;
        }
        .login-tab.active {
          background: linear-gradient(135deg, #3b82f6, #6366f1);
          color: #fff;
          box-shadow: 0 4px 12px rgba(99,102,241,0.35);
        }

        .login-google-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 12px;
          border: 1px solid rgba(255,255,255,0.14);
          border-radius: 12px;
          background: rgba(255,255,255,0.07);
          color: #e2e8f0;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: 'Inter', sans-serif;
          margin-bottom: 20px;
        }
        .login-google-btn:hover {
          background: rgba(255,255,255,0.12);
          border-color: rgba(255,255,255,0.22);
          transform: translateY(-1px);
        }

        .login-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
          color: #475569;
          font-size: 12px;
          font-weight: 500;
        }
        .login-divider::before,
        .login-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.08);
        }

        .login-form { display: flex; flex-direction: column; gap: 16px; }

        .login-field { display: flex; flex-direction: column; gap: 6px; }
        .login-label {
          font-size: 12.5px;
          font-weight: 600;
          color: #94a3b8;
          letter-spacing: 0.02em;
        }
        .login-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .login-input-icon {
          position: absolute;
          left: 13px;
          color: #475569;
          pointer-events: none;
        }
        .login-input {
          width: 100%;
          padding: 11px 40px 11px 36px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          color: #f1f5f9;
          font-size: 14px;
          font-family: 'Inter', sans-serif;
          outline: none;
          transition: all 0.2s;
          box-sizing: border-box;
        }
        .login-input::placeholder { color: #475569; }
        .login-input:focus {
          border-color: #6366f1;
          background: rgba(255,255,255,0.09);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.15);
        }
        .login-eye-btn {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          color: #475569;
          cursor: pointer;
          padding: 2px;
          display: flex;
          align-items: center;
          transition: color 0.2s;
        }
        .login-eye-btn:hover { color: #94a3b8; }

        .login-submit-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px;
          background: linear-gradient(135deg, #3b82f6, #6366f1);
          color: #fff;
          border: none;
          border-radius: 12px;
          font-size: 14.5px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: 'Inter', sans-serif;
          margin-top: 4px;
          box-shadow: 0 4px 16px rgba(99,102,241,0.35);
        }
        .login-submit-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(99,102,241,0.45);
        }
        .login-submit-btn:disabled { opacity: 0.65; cursor: not-allowed; }

        .login-error {
          padding: 10px 14px;
          background: rgba(239,68,68,0.12);
          border: 1px solid rgba(239,68,68,0.3);
          border-radius: 10px;
          color: #fca5a5;
          font-size: 13px;
          font-weight: 500;
        }

        .login-switch-text {
          text-align: center;
          font-size: 13px;
          color: #64748b;
          margin: 0;
        }
        .login-link-btn {
          background: none;
          border: none;
          color: #818cf8;
          font-weight: 600;
          cursor: pointer;
          font-size: 13px;
          font-family: 'Inter', sans-serif;
          padding: 0;
          transition: color 0.2s;
        }
        .login-link-btn:hover { color: #a5b4fc; text-decoration: underline; }

        .login-footer {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin-top: 24px;
          color: #334155;
          font-size: 12px;
        }

        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 0.8s linear infinite; }
      `}</style>

      <div className="login-page">
        <div className="login-bg-orb login-bg-orb-1" />
        <div className="login-bg-orb login-bg-orb-2" />

        <div className="login-card">
          {/* Brand */}
          <div className="login-brand">
            <div className="login-brand-icon">
              <TicketCheck color="#fff" size={28} />
            </div>
            <div style={{ textAlign: "center" }}>
              <h1 className="login-brand-title">IT Support System</h1>
              <p className="login-brand-sub">Manage tickets, track issues, collaborate with your team</p>
            </div>
          </div>

          {/* Google */}
          <button className="login-google-btn" onClick={handleGoogleLogin} id="google-login-btn">
            <GoogleIcon />
            Continue with Google
          </button>

          <div className="login-divider">or use email</div>

          {/* Tabs */}
          <div className="login-tabs">
            <button
              className={`login-tab ${tab === "login" ? "active" : ""}`}
              onClick={() => setTab("login")}
              id="tab-login"
              type="button"
            >
              Sign In
            </button>
            <button
              className={`login-tab ${tab === "register" ? "active" : ""}`}
              onClick={() => setTab("register")}
              id="tab-register"
              type="button"
            >
              Create Account
            </button>
          </div>

          {/* Form */}
          {tab === "login" ? (
            <LoginForm onSwitch={() => setTab("register")} />
          ) : (
            <RegisterForm onSwitch={() => setTab("login")} />
          )}

          {/* Footer */}
          <div className="login-footer">
            <ShieldCheck size={13} />
            Secured with JWT · IT Support {new Date().getFullYear()}
          </div>
        </div>
      </div>
    </>
  );
}
