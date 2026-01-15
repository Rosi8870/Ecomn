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
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#0f2027]">
      <div className="w-full max-w-md rounded-2xl bg-white/5 border border-white/10 p-8 text-white">

        {/* REQUIRED FOR PHONE AUTH */}
        <div id="recaptcha-container"></div>

        {/* HEADER */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">MyStore</h1>
          <p className="text-gray-300 text-sm mt-1">
            Sign in to continue
          </p>
        </div>

        {/* MODE SWITCH */}
        <div className="flex mb-6 rounded-xl overflow-hidden border border-white/10">
          <button
            onClick={() => setMode("email")}
            className={`flex-1 py-2 text-sm ${
              mode === "email"
                ? "bg-cyan-400 text-black"
                : "bg-white/10"
            }`}
          >
            Email
          </button>
          <button
            onClick={() => setMode("phone")}
            className={`flex-1 py-2 text-sm ${
              mode === "phone"
                ? "bg-cyan-400 text-black"
                : "bg-white/10"
            }`}
          >
            Phone (OTP)
          </button>
        </div>

        {/* ================= EMAIL LOGIN ================= */}
        {mode === "email" && (
          <>
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <Input
                label="Email"
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
                className="w-full py-3 rounded-xl bg-cyan-400 text-black font-semibold disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-gray-400">OR</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-3 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20"
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
                className="w-full py-3 mt-4 rounded-xl bg-cyan-400 text-black font-semibold"
              >
                Send OTP
              </button>
            ) : (
              <>
                <Input
                  label="OTP"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />

                <button
                  onClick={handleVerifyOtp}
                  disabled={loading}
                  className="w-full py-3 mt-4 rounded-xl bg-green-400 text-black font-semibold"
                >
                  Verify OTP
                </button>
              </>
            )}
          </>
        )}

        {/* REGISTER */}
        <p className="text-center text-sm text-gray-300 mt-6">
          Don’t have an account?{" "}
          <Link to="/register" className="text-cyan-300 hover:underline">
            Register
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
      <label className="block text-sm text-gray-300 mb-1">
        {label}
      </label>
      <input
        {...props}
        required
        className="
          w-full rounded-lg
          bg-white/10 border border-white/20
          px-3 py-2.5 text-white
          placeholder:text-gray-400
          focus:outline-none focus:border-cyan-400
        "
      />
    </div>
  );
}

export default Login;
