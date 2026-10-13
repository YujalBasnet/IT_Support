
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function AuthCallback() {
  const navigate = useNavigate();
  const started = useRef(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const code = new URLSearchParams(
      window.location.search
    ).get("code");

    // Remove the temporary code from browser history.
    window.history.replaceState(
      {},
      "",
      "/auth/callback"
    );

    if (!code) {
      setError("Login code is missing.");
      return;
    }

    const completeLogin = async () => {
      try {
        const { data } = await api.post("/auth/exchange", {
          code,
        });

        localStorage.setItem("token", data.token);
        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );

        const role = Number(data.user.role_id);

        if (role === 1) navigate("/employee", { replace: true });
        else if (role === 2) navigate("/agent", { replace: true });
        else if (role === 3) navigate("/admin", { replace: true });
        else {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setError("Unknown user role.");
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
          "Google login could not be completed."
        );
      }
    };

    completeLogin();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white rounded-xl shadow p-8 text-center">
        {error ? (
          <>
            <p className="text-red-600">{error}</p>
            <a href="/login" className="text-blue-600 underline mt-4 inline-block">
              Return to login
            </a>
          </>
        ) : (
          <p className="text-slate-700">
            Completing Google sign-in...
          </p>
        )}
      </div>
    </div>
  );
}
