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
      successToast("Profile updated successfully");
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
      successToast("OTP sent to your phone");
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
      successToast("Phone verified successfully");
    } catch {
      errorToast("Invalid OTP");
    }
  };

  if (loading) {
    return (
      <div className="w-full bg-[#f5f5f7] min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#0071e3] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full bg-[#f5f5f7] min-h-[calc(100vh-64px)] pt-12 pb-32 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-[#1d1d1f] mb-2">My Profile</h1>
          <p className="text-[15px] text-[#86868b]">Manage your account details and delivery addresses</p>
        </div>

        <div className="premium-card bg-white p-8 sm:p-10 space-y-6 animate-fade-in">

          {/* NAME */}
          <Input label="Full Name" value={form.name} placeholder="Enter your full name"
            onChange={(v) => setForm({ ...form, name: v })} />

          {/* GENDER */}
          <div>
            <label className="block text-[13px] font-medium text-[#1d1d1f] mb-1.5">Gender</label>
            <select
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
              className="
                w-full rounded-xl px-4 py-3 text-[15px]
                bg-[#fbfbfd] border border-[rgba(0,0,0,0.08)] text-[#1d1d1f]
                focus:outline-none focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3]
                transition-all appearance-none cursor-pointer
              "
            >
              <option value="" disabled>Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="h-px bg-[rgba(0,0,0,0.06)] my-2" />

          {/* EMAIL */}
          {profile.email ? (
            <ReadOnly label="Email Address" value={profile.email} />
          ) : (
            <div>
              <Input label="Email Address" value={emailInput} placeholder="Enter your email"
                onChange={setEmailInput} />
              <button onClick={saveEmail} className="outline-btn w-full mt-3 h-12">
                Save Email
              </button>
            </div>
          )}

          {/* PHONE */}
          {profile.phone ? (
            <ReadOnly label="Phone Number" value={profile.phone} />
          ) : (
            <div>
              {!confirmation ? (
                <>
                  <Input label="Phone Number" value={phoneInput} placeholder="+91 9876543210"
                    onChange={setPhoneInput} />
                  <button onClick={sendOtp} className="outline-btn w-full mt-3 h-12">
                    Send OTP
                  </button>
                </>
              ) : (
                <>
                  <Input label="Enter OTP" value={otp} placeholder="123456" onChange={setOtp} />
                  <button onClick={verifyOtp} className="outline-btn w-full mt-3 h-12">
                    Verify OTP
                  </button>
                </>
              )}
            </div>
          )}

          <div className="h-px bg-[rgba(0,0,0,0.06)] my-2" />

          {/* ADDRESS */}
          <Input label="Delivery Address" value={form.address} placeholder="Street address, building, company, etc."
            onChange={(v) => setForm({ ...form, address: v })} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Input label="City" value={form.city} placeholder="City name"
              onChange={(v) => setForm({ ...form, city: v })} />
            <Input label="Pincode" value={form.pincode} placeholder="123456"
              onChange={(v) => setForm({ ...form, pincode: v })} />
          </div>

          <div className="pt-4">
            <button onClick={saveProfile} className="primary-btn w-full h-14 text-[16px]">
              Save Changes
            </button>
          </div>

          <div id="recaptcha-container" className="flex justify-center mt-4" />
        </div>
      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function Input({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-[13px] font-medium text-[#1d1d1f] mb-1.5">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="
          w-full rounded-xl px-4 py-3 text-[15px]
          bg-[#fbfbfd] border border-[rgba(0,0,0,0.08)] text-[#1d1d1f]
          placeholder:text-[#86868b]
          focus:outline-none focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3]
          transition-all
        "
      />
    </div>
  );
}

function ReadOnly({ label, value }) {
  return (
    <div>
      <label className="block text-[13px] font-medium text-[#1d1d1f] mb-1.5">{label}</label>
      <div className="w-full rounded-xl px-4 py-3 text-[15px] bg-[#f5f5f7] border border-[rgba(0,0,0,0.04)] text-[#86868b]">
        {value}
      </div>
    </div>
  );
}

export default Profile;
