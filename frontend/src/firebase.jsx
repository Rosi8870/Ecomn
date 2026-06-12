import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, RecaptchaVerifier } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDyhCw-PIQM4at9PfC-fE3Va5sIPc6wHe4",
  authDomain: "e-commerce-e5b75.firebaseapp.com",
  projectId: "e-commerce-e5b75",
  storageBucket: "e-commerce-e5b75.firebasestorage.app",
  messagingSenderId: "747074448058",
  appId: "1:747074448058:web:efdefcd910b615a5fef083",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

/* reCAPTCHA */
export const setupRecaptcha = () => {
  if (window.recaptchaVerifier) {
    window.recaptchaVerifier.clear();
  }

  window.recaptchaVerifier = new RecaptchaVerifier(
    auth,
    "recaptcha-container",
    { size: "invisible" }
  );
};
