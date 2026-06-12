import { useState } from "react";
import { sendOtp, verifyOtp } from "../services/authService";
import { successToast, errorToast } from "../utils/toast";

function PhoneLogin() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmResult, setConfirmResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    try {
      setLoading(true);
      const res = await sendOtp(phone);
      setConfirmResult(res);
      successToast("OTP sent");
    } catch (err) {
      errorToast(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      await verifyOtp(confirmResult, otp);
      successToast("Logged in successfully 🎉");
    } catch {
      errorToast("Invalid OTP");
    }
  };

  return (
    <div className="max-w-sm mx-auto p-6 text-white">
      {/* REQUIRED */}
      <div id="recaptcha-container"></div>

      <input
        className="w-full p-3 mb-3 rounded bg-white/10"
        placeholder="+919999999999"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      <button
        onClick={handleSendOtp}
        disabled={loading}
        className="w-full bg-cyan-400 text-black py-2 rounded"
      >
        Send OTP
      </button>

      {confirmResult && (
        <>
          <input
            className="w-full p-3 mt-4 rounded bg-white/10"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />

          <button
            onClick={handleVerifyOtp}
            className="w-full mt-3 bg-green-400 text-black py-2 rounded"
          >
            Verify OTP
          </button>
        </>
      )}
    </div>
  );
}

export default PhoneLogin;
