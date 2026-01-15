import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { auth, setupRecaptcha } from "../firebase";
import { db } from "../firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp
} from "firebase/firestore";
import { signInWithPhoneNumber } from "firebase/auth";
import { successToast, errorToast } from "../utils/toast";

function Profile() {
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    name: "",
    gender: "",
    address: "",
    city: "",
    pincode: "",
  });

  const [emailInput, setEmailInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmation, setConfirmation] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ================= LOAD PROFILE ================= */
  useEffect(() => {
    if (!user) return;

    const load = async () => {
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();
        setProfile(data);
        setForm({
          name: data.name || "",
          gender: data.gender || "",
          address: data.address || "",
          city: data.city || "",
          pincode: data.pincode || "",
        });
      } else {
        const baseProfile = {
          email: user.email || null,
          phone: user.phoneNumber || null,
          createdAt: serverTimestamp(),
        };
        await setDoc(ref, baseProfile);
        setProfile(baseProfile);
      }
      setLoading(false);
    };

    load();
  }, [user]);

  /* ================= SAVE BASIC DETAILS ================= */
  const saveProfile = async () => {
    try {
      await updateDoc(doc(db, "users", user.uid), {
        ...form,
        updatedAt: serverTimestamp(),
      });
      successToast("Profile updated");
    } catch {
      errorToast("Failed to update profile");
    }
  };

  /* ================= EMAIL SAVE (PHONE LOGIN USERS) ================= */
  const saveEmail = async () => {
    if (!emailInput) return errorToast("Email required");

    try {
      await updateDoc(doc(db, "users", user.uid), {
        email: emailInput,
        updatedAt: serverTimestamp(),
      });
      setProfile((p) => ({ ...p, email: emailInput }));
      successToast("Email saved");
    } catch {
      errorToast("Failed to save email");
    }
  };

  /* ================= PHONE OTP ================= */
  const sendOtp = async () => {
    try {
      setupRecaptcha();
      const result = await signInWithPhoneNumber(
        auth,
        phoneInput,
        window.recaptchaVerifier
      );
      setConfirmation(result);
      successToast("OTP sent");
    } catch (err) {
      errorToast(err.message);
    }
  };

  const verifyOtp = async () => {
    try {
      await confirmation.confirm(otp);
      await updateDoc(doc(db, "users", user.uid), {
        phone: phoneInput,
        updatedAt: serverTimestamp(),
      });
      setProfile((p) => ({ ...p, phone: phoneInput }));
      successToast("Phone verified");
    } catch {
      errorToast("Invalid OTP");
    }
  };

  if (loading) return <div className="p-10 text-white">Loading…</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 text-white">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>

      <div className="glass p-6 space-y-5">

        {/* NAME */}
        <Input label="Full Name" value={form.name}
          onChange={(v) => setForm({ ...form, name: v })} />

        {/* GENDER */}
        <div>
          <label className="text-sm text-gray-300">Gender</label>
          <select
            value={form.gender}
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
            className="w-full mt-1 p-3 rounded bg-white/10 border border-white/20"
          >
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* EMAIL */}
        {profile.email ? (
          <ReadOnly label="Email" value={profile.email} />
        ) : (
          <>
            <Input label="Email" value={emailInput}
              onChange={setEmailInput} />
            <button onClick={saveEmail} className="glass-btn w-full">
              Save Email
            </button>
          </>
        )}

        {/* PHONE */}
        {profile.phone ? (
          <ReadOnly label="Phone" value={profile.phone} />
        ) : (
          <>
            {!confirmation ? (
              <>
                <Input label="Phone" value={phoneInput}
                  onChange={setPhoneInput} />
                <button onClick={sendOtp} className="glass-btn w-full">
                  Send OTP
                </button>
              </>
            ) : (
              <>
                <Input label="OTP" value={otp} onChange={setOtp} />
                <button onClick={verifyOtp} className="glass-btn w-full">
                  Verify OTP
                </button>
              </>
            )}
          </>
        )}

        {/* ADDRESS */}
        <Input label="Address" value={form.address}
          onChange={(v) => setForm({ ...form, address: v })} />

        <div className="grid grid-cols-2 gap-4">
          <Input label="City" value={form.city}
            onChange={(v) => setForm({ ...form, city: v })} />
          <Input label="Pincode" value={form.pincode}
            onChange={(v) => setForm({ ...form, pincode: v })} />
        </div>

        <button onClick={saveProfile} className="glass-btn w-full">
          Save Profile
        </button>

        <div id="recaptcha-container" />
      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function Input({ label, value, onChange }) {
  return (
    <div>
      <label className="text-sm text-gray-300">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full mt-1 p-3 rounded bg-white/10 border border-white/20"
      />
    </div>
  );
}

function ReadOnly({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-lg font-medium">{value}</p>
    </div>
  );
}

export default Profile;
