import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register, loginWithGoogle } from "../services/authService";
import { successToast, errorToast } from "../utils/toast";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate(); // ✅ ADD THIS

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
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#0f2027]">
      <div className="w-full max-w-md rounded-2xl bg-white/5 border border-white/10 p-8 text-white">

        {/* BRAND */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold tracking-wide">
            MyStore
          </h1>
          <p className="text-gray-300 text-sm mt-1">
            Create your account
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
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
            className="
              w-full py-3 mt-2
              rounded-xl
              bg-cyan-400
              text-black
              font-semibold
              hover:bg-cyan-300
              disabled:opacity-60
            "
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        {/* DIVIDER */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-xs text-gray-400">OR</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* GOOGLE */}
        <button
          onClick={handleGoogleRegister}
          disabled={loading}
          className="
            w-full py-3
            rounded-xl
            border border-white/20
            bg-white/10
            hover:bg-white/20
            font-medium
            disabled:opacity-60
          "
        >
          Continue with Google
        </button>
      </div>
    </div>
  );
}

/* INPUT COMPONENT */
function Input({ label, ...props }) {
  return (
    <div>
      <label className="block text-sm text-gray-300 mb-1">
        {label}
      </label>
      <input
        {...props}
        required
        className="
          w-full
          rounded-lg
          bg-white/10
          border border-white/20
          px-3 py-2.5
          text-white
          placeholder:text-gray-400
          focus:outline-none
          focus:border-cyan-400
        "
      />
    </div>
  );
}

export default Register;
