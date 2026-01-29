document.addEventListener("DOMContentLoaded", () => {
  const authModal = document.getElementById("authModal");
  const authContainer = document.getElementById("authContainer");
  const loginBtn = document.querySelector(".nav-btn");

  // Toggle Elements
  const toSignup = document.getElementById("toSignup");
  const toLogin = document.getElementById("toLogin");
  const closeAuth = document.getElementById("closeAuth");

  // 1. OPEN MODAL (Added e.preventDefault to stop page refresh)
  if (loginBtn) {
    loginBtn.addEventListener("click", (e) => {
      e.preventDefault();
      authModal.classList.add("active");
    });
  }

  // 2. CLOSE MODAL
  if (closeAuth) {
    closeAuth.addEventListener("click", () => {
      authModal.classList.remove("active");
    });
  }

  // Close modal if user clicks outside the white box
  window.addEventListener("click", (e) => {
    if (e.target === authModal) {
      authModal.classList.remove("active");
    }
  });
  // Switch to Signup
  toSignup.addEventListener("click", () => {
    authContainer.classList.add("show-signup");
  });

  // Switch to Login
  toLogin.addEventListener("click", () => {
    authContainer.classList.remove("show-signup");
  });
  // 4. REAL-TIME PASSWORD VALIDATION
  const regPass = document.getElementById("regPass");
  const req8 = document.getElementById("req8");
  const reqNum = document.getElementById("reqNum");

  if (regPass) {
    regPass.addEventListener("input", () => {
      const val = regPass.value;
      const hasNum = /\d/.test(val);
      const hasSpecial = /[!@#$%^&*]/.test(val);

      // Check length
      if (val.length >= 8) {
        req8.classList.add("valid");
      } else {
        req8.classList.remove("valid");
      }

      // Check number and special char
      if (hasNum && hasSpecial) {
        reqNum.classList.add("valid");
      } else {
        reqNum.classList.remove("valid");
      }
    });
  }

  // 5. SIGNUP SUBMISSION
  document.getElementById("signupForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("regName").value;
    const phone = document.getElementById("regPhone").value;

    if (name.trim().length < 3) {
      alert("Please enter a valid full name.");
      return;
    }
    if (phone.length !== 10) {
      alert("Phone number must be exactly 10 digits.");
      return;
    }

    alert(
      "Registration Request Sent! An administrator will verify your credentials.",
    );
    authModal.classList.remove("active");
  });

  // 6. LOGIN SUBMISSION (Optional but helpful)
  document.getElementById("loginForm").addEventListener("submit", (e) => {
    e.preventDefault();
    alert("Login successful! Redirecting to dashboard...");
    authModal.classList.remove("active");
  });
});
