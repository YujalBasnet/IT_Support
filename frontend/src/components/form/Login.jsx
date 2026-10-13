
import { ShieldCheck, TicketCheck } from "lucide-react";

export default function Login() {
  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5000/auth/google";
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">

        <div className="flex justify-center mb-5">
          <div className="bg-blue-100 p-4 rounded-2xl">
            <TicketCheck className="text-blue-600" size={36} />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-slate-900 text-center">
          IT Support System
        </h1>

        <p className="text-slate-500 text-center mt-3">
          Manage support requests, track tickets,
          and collaborate with your IT team.
        </p>

        <div className="mt-8">
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3
                       border border-slate-300 rounded-xl py-3
                       font-semibold text-slate-700
                       hover:bg-slate-50 transition cursor-pointer"
          >
            <span className="text-xl font-bold text-blue-600">
              G
            </span>
            Continue with Google
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 mt-6 text-sm text-slate-400">
          <ShieldCheck size={16} />
          Secure Google Authentication
        </div>

        <p className="text-center text-xs text-slate-400 mt-8">
          IT Support Ticket Management System
        </p>
      </div>
    </div>
  );
}
