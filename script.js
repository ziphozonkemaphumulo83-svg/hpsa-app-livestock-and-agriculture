// script.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail
} from "firebase/auth";
import {
  getFirestore,
  enableIndexedDbPersistence,
  doc,
  setDoc,
  getDoc
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCaOrMKZXZtJKD646bARehuTOxCe4DzsLk",
  authDomain: "hpsa-app-6b2d2.firebaseapp.com",
  projectId: "hpsa-app-6b2d2",
  storageBucket: "hpsa-app-6b2d2.appspot.com",
  messagingSenderId: "445389782453",
  appId: "1:445389782453:web:595647fa1038fab9886dfc"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

enableIndexedDbPersistence(db).catch(e =>
  console.warn("Offline persistence failed:", e.code)
);

// Keep all your login/register/reset logic here...
// (Move the Firebase code from your HTML here unchanged)


// LOGIN LOGIC
document.getElementById("loginForm")?.addEventListener("submit", function (e) {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const pass = document.getElementById("password").value.trim();
  const ref = document.getElementById("loginRef")?.value.trim() || document.getElementById("projectCode")?.value.trim();

  const savedEmail = localStorage.getItem("email");
  const savedPass = localStorage.getItem("password");

  if (email === savedEmail && pass === savedPass && ref) {
    localStorage.setItem("referenceId", ref.toUpperCase());
    window.location.href = "sales-summary.html";
  } else {
    showToast("Invalid login credentials or reference.");
  }
});

// REGISTER LOGIC
document.getElementById("registerForm")?.addEventListener("submit", function (e) {
  e.preventDefault();
  const email = document.getElementById("regEmail").value.trim();
  const pass = document.getElementById("regPassword").value.trim();

  if (!email || !pass) {
    showToast("Please enter all fields.");
    return;
  }

  localStorage.setItem("email", email);
  localStorage.setItem("password", pass);
  showToast("Registration successful!");
  showLogin();
});

// TOGGLE SCREENS
function showRegister() {
  document.getElementById("loginSection")?.classList.add("hidden");
  document.getElementById("registerSection")?.classList.remove("hidden");
}
function showLogin() {
  document.getElementById("registerSection")?.classList.add("hidden");
  document.getElementById("loginSection")?.classList.remove("hidden");
}
function goHome() {
  showLogin();
}

// PASSWORD VISIBILITY TOGGLE
function togglePassword(inputId, icon) {
  const input = document.getElementById(inputId);
  const isHidden = input.type === "password";
  input.type = isHidden ? "text" : "password";
  icon.textContent = isHidden ? "🚫" : "👁️";
}

// FORGOT PASSWORD MODAL
function showForgotPassword() {
  document.getElementById("forgotPasswordModal")?.classList.remove("hidden");
}
function closeForgotPassword() {
  document.getElementById("forgotPasswordModal")?.classList.add("hidden");
}
function sendResetLink() {
  const email = document.getElementById("resetEmail").value.trim();
  if (email) {
    showToast(`Reset link sent to ${email}`);
    closeForgotPassword();
  } else {
    showToast("Please enter your email.");
  }
}

// REPORT VIEW (optional use with saleDate selection)
function viewReport() {
  const selectedDate = document.getElementById("saleDate")?.value;
  if (!selectedDate) {
    showToast("Please select a date before viewing the report.");
    return;
  }
  window.location.href = `report.html?date=${encodeURIComponent(selectedDate)}`;
}

// TOAST NOTIFICATION
function showToast(message) {
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.className = "toast-message";
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add("show");
  toast.classList.remove("hidden");

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.classList.add("hidden"), 300);
  }, 2500);
}
