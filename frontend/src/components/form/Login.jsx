import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, TicketCheck, Eye, EyeOff, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
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

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5000/auth/google";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      const role = Number(data.user.role_id);
      if (role === 1) navigate("/employee", { replace: true });
      else if (role === 2) navigate("/agent", { replace: true });
      else if (role === 3) navigate("/admin", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        .auth-page {
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
        .auth-bg-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
        }
        .auth-bg-orb-1 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%);
          top: -100px; left: -100px;
        }
        .auth-bg-orb-2 {
          width: 350px; height: 350px;
          background: radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%);
          bottom: -80px; right: -80px;
        }
        .auth-card {
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
        .auth-brand {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 28px;
          gap: 12px;
        }
        .auth-brand-icon {
          width: 56px; height: 56px;
          background: linear-gradient(135deg, #3b82f6, #6366f1);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 24px rgba(99,102,241,0.4);
        }
        .auth-brand-title {
          font-size: 22px;
          font-weight: 800;
          color: #f8fafc;
          letter-spacing: -0.5px;
          margin: 0;
          text-align: center;
        }
        .auth-brand-sub {
          font-size: 13px;
          color: #94a3b8;
          margin: 0;
          text-align: center;
        }
        .auth-google-btn {
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
        .auth-google-btn:hover {
          background: rgba(255,255,255,0.12);
          border-color: rgba(255,255,255,0.22);
          transform: translateY(-1px);
        }
        .auth-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
          color: #475569;
          font-size: 12px;
          font-weight: 500;
        }
        .auth-divider::before, .auth-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.08);
        }
        .auth-form-title {
          font-size: 16px;
          font-weight: 700;
          color: #e2e8f0;
          margin: 0 0 18px 0;
        }
        .auth-form { display: flex; flex-direction: column; gap: 16px; }
        .auth-field { display: flex; flex-direction: column; gap: 6px; }
        .auth-label {
          font-size: 12.5px;
          font-weight: 600;
          color: #94a3b8;
          letter-spacing: 0.02em;
        }
        .auth-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .auth-input-icon {
          position: absolute;
          left: 13px;
          color: #475569;
          pointer-events: none;
        }
        .auth-input {
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
        .auth-input::placeholder { color: #475569; }
        .auth-input:focus {
          border-color: #6366f1;
          background: rgba(255,255,255,0.09);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.15);
        }
        .auth-eye-btn {
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
        .auth-eye-btn:hover { color: #94a3b8; }
        .auth-submit-btn {
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
          margin-top: 2px;
          box-shadow: 0 4px 16px rgba(99,102,241,0.35);
        }
        .auth-submit-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(99,102,241,0.45);
        }
        .auth-submit-btn:disabled { opacity: 0.65; cursor: not-allowed; }
        .auth-error {
          padding: 10px 14px;
          background: rgba(239,68,68,0.12);
          border: 1px solid rgba(239,68,68,0.3);
          border-radius: 10px;
          color: #fca5a5;
          font-size: 13px;
          font-weight: 500;
        }
        .auth-switch {
          text-align: center;
          font-size: 13px;
          color: #64748b;
          margin-top: 20px;
        }
        .auth-switch a {
          color: #818cf8;
          font-weight: 600;
          text-decoration: none;
          transition: color 0.2s;
        }
        .auth-switch a:hover { color: #a5b4fc; text-decoration: underline; }
        .auth-footer {
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

      <div className="auth-page">
        <div className="auth-bg-orb auth-bg-orb-1" />
        <div className="auth-bg-orb auth-bg-orb-2" />

        <div className="auth-card">
          {/* Brand */}
          <div className="auth-brand">
            <div className="auth-brand-icon">
              <TicketCheck color="#fff" size={28} />
            </div>
            <div>
              <h1 className="auth-brand-title">Welcome Back</h1>
              <p className="auth-brand-sub">Sign in to your IT Support account</p>
            </div>
          </div>

          {/* Google */}
          <button className="auth-google-btn" onClick={handleGoogleLogin} id="google-login-btn">
            <GoogleIcon />
            Continue with Google
          </button>

          <div className="auth-divider">or sign in with email</div>

          <h2 className="auth-form-title">Email & Password</h2>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            {error && <div className="auth-error">{error}</div>}

            <div className="auth-field">
              <label htmlFor="login-email" className="auth-label">Email Address</label>
              <div className="auth-input-wrap">
                <Mail size={16} className="auth-input-icon" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="auth-input"
                  required
                />
              </div>
            </div>

            <PasswordField
              id="login-password"
              label="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
            />

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? <Loader2 size={18} className="spin" /> : <ArrowRight size={18} />}
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          {/* Switch to Register */}
          <p className="auth-switch">
            Don't have an account?{" "}
            <Link to="/register">Create one</Link>
          </p>

          <div className="auth-footer">
            <ShieldCheck size={13} />
            Secured with JWT · IT Support {new Date().getFullYear()}
          </div>
        </div>
      </div>
    </>
  );
}
