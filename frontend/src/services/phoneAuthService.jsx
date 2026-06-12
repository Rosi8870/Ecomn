import {
  getAuth,
  signInWithPhoneNumber,
  RecaptchaVerifier
} from "firebase/auth";

const auth = getAuth();

/* INIT reCAPTCHA */
export const setupRecaptcha = () => {
  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(
      auth,
      "recaptcha-container",
      {
        size: "invisible",
        callback: () => {
          console.log("reCAPTCHA solved");
        },
      }
    );
  }
};

/* SEND OTP */
export const sendOtp = async (phoneNumber) => {
  setupRecaptcha();
  const appVerifier = window.recaptchaVerifier;

  return signInWithPhoneNumber(auth, phoneNumber, appVerifier);
};

/* VERIFY OTP */
export const verifyOtp = async (confirmationResult, code) => {
  return confirmationResult.confirm(code);
};
