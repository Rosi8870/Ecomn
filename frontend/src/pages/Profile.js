import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "firebase/firestore";
import {
  signInWithPhoneNumber
} from "firebase/auth";
import { auth, setupRecaptcha } from "../firebase";
import { successToast, errorToast } from "../utils/toast";

function Profile() {
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmation, setConfirmation] = useState(null);
  const [loading, setLoading] = useState(true);

  /* LOAD PROFILE */
  useEffect(() => {
    if (!user) return;

    const load = async () => {
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setProfile(snap.data());
      } else {
        // Create base profile
        await setDoc(ref, {
          email: user.email || null,
          phone: user.phoneNumber || null,
          phoneVerified: !!user.phoneNumber,
          provider: user.providerData[0]?.providerId,
          createdAt: serverTimestamp(),
        });
        setProfile({
          email: user.email,
          phone: user.phoneNumber,
          phoneVerified: !!user.phoneNumber,
        });
      }

      setLoading(false);
    };

    load();
  }, [user]);

  /* SEND OTP */
  const sendOtp = async () => {
    try {
      setupRecaptcha();
      const result = await signInWithPhoneNumber(
        auth,
        phone,
        window.recaptchaVerifier
      );
      setConfirmation(result);
      successToast("OTP sent");
    } catch (err) {
      errorToast(err.message);
    }
  };

  /* VERIFY OTP */
  const verifyOtp = async () => {
    try {
      await confirmation.confirm(otp);

      await setDoc(
        doc(db, "users", user.uid),
        {
          phone,
          phoneVerified: true,
        },
        { merge: true }
      );

      successToast("Phone verified");
      setProfile(prev => ({
        ...prev,
        phone,
        phoneVerified: true,
      }));
    } catch {
      errorToast("Invalid OTP");
    }
  };

  if (loading) {
    return <div className="text-white p-10">Loading profile…</div>;
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-10 text-white">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>

      <div className="glass p-6 space-y-4">

        <Field label="Email" value={profile.email} />

        {/* PHONE VERIFIED */}
        {profile.phoneVerified ? (
          <Field label="Phone" value={profile.phone} />
        ) : (
          <>
            {!confirmation ? (
              <>
                <label className="block text-sm text-gray-300">
                  Verify Phone Number
                </label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91XXXXXXXXXX"
                  className="w-full p-3 rounded bg-white/10 border border-white/20"
                />
                <button onClick={sendOtp} className="glass-btn w-full">
                  Send OTP
                </button>
              </>
            ) : (
              <>
                <input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter OTP"
                  className="w-full p-3 rounded bg-white/10 border border-white/20"
                />
                <button onClick={verifyOtp} className="glass-btn w-full">
                  Verify OTP
                </button>
              </>
            )}
          </>
        )}

        <div id="recaptcha-container" />
      </div>
    </div>
  );
}

/* READONLY FIELD */
function Field({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-lg font-medium">{value || "—"}</p>
    </div>
  );
}

export default Profile;
