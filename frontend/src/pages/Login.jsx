import { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  login,
  loginWithGoogle,
} from "../services/authService";
import {
  sendOtp,
  verifyOtp,
} from "../services/phoneAuthService";
import { useAuth } from "../context/AuthContext";
import { successToast, errorToast } from "../utils/toast";

function Login() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // 🔁 Redirect destination
  const from = location.state?.from || "/";

  /* ================= STATES ================= */
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);

  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("email"); // email | phone

  /* ================= BLOCK LOGGED-IN USERS ================= */
  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  /* ================= EMAIL LOGIN ================= */
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await login(email, password);
      successToast("Welcome back 👋");
      navigate(from, { replace: true });
    } catch (err) {
      errorToast(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= GOOGLE LOGIN ================= */
  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await loginWithGoogle();
      successToast("Logged in with Google");
      navigate(from, { replace: true });
    } catch (err) {
      errorToast(err.message || "Google login failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= SEND OTP ================= */
  const handleSendOtp = async () => {
    if (!phone.startsWith("+")) {
      errorToast("Include country code (e.g. +91)");
      return;
    }

    try {
      setLoading(true);
      const result = await sendOtp(phone);
      setConfirmationResult(result);
      successToast("OTP sent");
    } catch (err) {
      errorToast(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  /* ================= VERIFY OTP ================= */
  const handleVerifyOtp = async () => {
    try {
      setLoading(true);
      await verifyOtp(confirmationResult, otp);
      successToast("Logged in successfully 🎉");
      navigate(from, { replace: true });
    } catch {
      errorToast("Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-6 py-12 bg-[#f5f5f7]">
      <div className="w-full max-w-[420px] premium-card p-10 bg-white">

        {/* REQUIRED FOR PHONE AUTH */}
        <div id="recaptcha-container"></div>

        {/* HEADER */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#1d1d1f] tracking-tight">Sojan's</h1>
          <p className="text-[#86868b] text-[15px] mt-2">
            Sign in to your account
          </p>
        </div>

        {/* MODE SWITCH */}
        <div className="relative flex mb-8 p-1 rounded-xl bg-[#f5f5f7] border border-[rgba(0,0,0,0.04)]">
          {/* Sliding Pill Indicator */}
          <div 
            className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-sm transition-transform duration-300 cubic-bezier(0.4, 0, 0.2, 1)"
            style={{ transform: mode === 'email' ? 'translateX(0)' : 'translateX(100%)' }}
          />

          <button
            onClick={() => setMode("email")}
            className={`relative z-10 flex-1 py-1.5 text-[14px] font-medium transition-colors duration-300 ${
              mode === "email" ? "text-[#1d1d1f]" : "text-[#86868b] hover:text-[#1d1d1f]"
            }`}
          >
            Email
          </button>
          <button
            onClick={() => setMode("phone")}
            className={`relative z-10 flex-1 py-1.5 text-[14px] font-medium transition-colors duration-300 ${
              mode === "phone" ? "text-[#1d1d1f]" : "text-[#86868b] hover:text-[#1d1d1f]"
            }`}
          >
            Phone
          </button>
        </div>

        {/* ================= FORM AREA WITH ANIMATION ================= */}
        <div key={mode} className="animate-fade-in">
          {/* ================= EMAIL LOGIN ================= */}
          {mode === "email" && (
            <>
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <Input
                  label="Email address"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full primary-btn mt-6"
                >
                  {loading ? "Signing in..." : "Sign In"}
                </button>
              </form>

              <div className="flex items-center gap-3 my-8">
                <div className="flex-1 h-px bg-[rgba(0,0,0,0.06)]" />
                <span className="text-[12px] font-medium text-[#86868b] uppercase tracking-wider">or</span>
                <div className="flex-1 h-px bg-[rgba(0,0,0,0.06)]" />
              </div>

              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full outline-btn flex items-center justify-center gap-2"
              >
                Continue with Google
              </button>
            </>
          )}

          {/* ================= PHONE LOGIN ================= */}
          {mode === "phone" && (
            <>
              <Input
                label="Phone Number"
                placeholder="+919999999999"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />

              {!confirmationResult ? (
                <button
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="w-full primary-btn mt-6"
                >
                  Send OTP
                </button>
              ) : (
                <>
                  <Input
                    label="Enter OTP"
                    placeholder="6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />

                  <button
                    onClick={handleVerifyOtp}
                    disabled={loading}
                    className="w-full primary-btn mt-6"
                  >
                    Verify & Sign In
                  </button>
                </>
              )}
            </>
          )}
        </div>

        {/* REGISTER */}
        <p className="text-center text-[14px] text-[#86868b] mt-8">
          Don't have an account?{" "}
          <Link to="/register" className="text-[#0071e3] font-medium hover:underline">
            Register now
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

export default Login;
