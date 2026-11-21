/**
 * Route-mode resolution and client-side form validation helpers for Login and Sign Up pages.
 */

export function resolveInitialAuthMode(pathname = "", hash = "") {
  const target = `${pathname || ""} ${hash || ""}`.toLowerCase();
  if (target.includes("signup") || target.includes("sign-up") || target.includes("register")) {
    return "signup";
  }
  if (target.includes("login") || target.includes("signin") || target.includes("sign-in")) {
    return "login";
  }
  return "landing";
}

export function isValidPhone(phone = "") {
  const digits = (phone || "").replace(/\D/g, "");
  // Indian 10-digit mobile number starting with 6-9, or with +91/0 prefix
  if (digits.length === 10 && /^[6-9]\d{9}$/.test(digits)) return true;
  if (digits.length === 11 && digits.startsWith("0") && /^[6-9]/.test(digits.slice(1))) return true;
  if (digits.length === 12 && digits.startsWith("91") && /^[6-9]/.test(digits.slice(2))) return true;
  return digits.length >= 10 && digits.length <= 15;
}

export function isValidEmail(email = "") {
  const clean = (email || "").trim();
  if (!clean) return true; // Email is optional!
  const atIdx = clean.indexOf("@");
  if (atIdx <= 0 || clean.includes(" ")) return false;
  const domain = clean.slice(atIdx + 1);
  return domain.includes(".") && !domain.startsWith(".") && !domain.endsWith(".");
}

export function validateLoginForm({ identifier = "", email = "", phone = "", password = "" }) {
  const loginId = (identifier || phone || email || "").trim();
  if (!loginId) {
    return "Please enter your mobile number or email.";
  }
  if (loginId.includes("@")) {
    if (!isValidEmail(loginId)) {
      return "Please enter a valid email address.";
    }
  } else {
    if (!isValidPhone(loginId)) {
      return "Please enter a valid 10-digit mobile number.";
    }
  }
  if (!password) {
    return "Please enter your password.";
  }
  return "";
}

export function validateSignUpForm({
  name = "",
  phone = "",
  email = "",
  password = "",
  confirmPassword = "",
}) {
  if ((name || "").trim().length < 2) {
    return "Full name must be at least 2 characters.";
  }
  if (!phone || !isValidPhone(phone)) {
    return "Please enter a valid 10-digit mobile number (Mandatory).";
  }
  if (email && email.trim() && !isValidEmail(email)) {
    return "Please enter a valid email address or leave it empty.";
  }
  if ((password || "").length < 6) {
    return "Password must be at least 6 characters.";
  }
  if (password !== confirmPassword) {
    return "Passwords do not match.";
  }
  return "";
}

