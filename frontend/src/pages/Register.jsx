import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register, loginWithGoogle } from "../services/authService";
import { successToast, errorToast } from "../utils/toast";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await register(email, password);
      successToast("Account created successfully 🎉");

      navigate("/"); // ✅ REDIRECT TO HOME
    } catch (err) {
      errorToast(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    try {
      setLoading(true);
      await loginWithGoogle();
      successToast("Signed up with Google");

      navigate("/"); // ✅ REDIRECT TO HOME
    } catch (err) {
      errorToast(err.message || "Google signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-6 py-12 bg-[#f5f5f7]">
      <div className="w-full max-w-[420px] premium-card p-10 bg-white">

        {/* BRAND */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#1d1d1f] tracking-tight">Sojan's</h1>
          <p className="text-[#86868b] text-[15px] mt-2">
            Create your account
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />

          <Input
            label="Password"
            type="password"
            placeholder="Create a strong password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full primary-btn mt-6"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        {/* DIVIDER */}
        <div className="flex items-center gap-3 my-8">
          <div className="flex-1 h-px bg-[rgba(0,0,0,0.06)]" />
          <span className="text-[12px] font-medium text-[#86868b] uppercase tracking-wider">or</span>
          <div className="flex-1 h-px bg-[rgba(0,0,0,0.06)]" />
        </div>

        {/* GOOGLE */}
        <button
          onClick={handleGoogleRegister}
          disabled={loading}
          className="w-full outline-btn flex items-center justify-center gap-2"
        >
          Continue with Google
        </button>

        {/* LOGIN LINK */}
        <p className="text-center text-[14px] text-[#86868b] mt-8">
          Already have an account?{" "}
          <Link to="/login" className="text-[#0071e3] font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

/* ================= INPUT ================= */
function Input({ label, ...props }) {
  return (
    <div className="mt-4">
      <label className="block text-[13px] font-medium text-[#1d1d1f] mb-1.5">
        {label}
      </label>
      <input
        {...props}
        required
        className="
          w-full rounded-xl
          bg-[#fbfbfd] border border-[rgba(0,0,0,0.08)]
          px-4 py-3 text-[#1d1d1f] text-[15px]
          placeholder:text-[#86868b]
          focus:outline-none focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3]
          transition-all
        "
      />
    </div>
  );
}

export default Register;
