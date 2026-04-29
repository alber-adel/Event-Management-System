const nameEl = document.getElementById("name");
const emailEl = document.getElementById("email");
const passwordEl = document.getElementById("password");
const confirmPasswordEl = document.getElementById("confirmPassword");
const isAdminEl = document.getElementById("isAdmin");

function validateSignUpForm() {
  // Remove previous per-field errors
  document.querySelectorAll(".input-error").forEach(el => el.remove());

  const fieldErrors = {
    password: [],
    confirmPassword: [],
    name: [],
    email: [],
  };

  const nameVal = nameEl.value.trim();
  if (!nameVal) {
    fieldErrors.name.push("Name is required.");
  } else if (nameVal.length < 2) {
    fieldErrors.name.push("Name must be at least 2 characters.");
  } else if (!/^[A-Za-z\s]+$/.test(nameVal)) {
    fieldErrors.name.push("Name must contain only letters and spaces.");
  }

  const emailVal = emailEl.value.trim();
  if (!emailVal) {
    fieldErrors.email.push("Email is required.");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
    fieldErrors.email.push("Invalid email format.");
  }

  const password = passwordEl.value;
  const confirmPassword = confirmPasswordEl.value;

  // Password validations
  if (password.length < 8) {
    fieldErrors.password.push("Password must be at least 8 characters.");
  }
  const complexityRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/;
  if (!complexityRegex.test(password)) {
    fieldErrors.password.push("Include upper, lower, number, special.");
  }

  // Confirm password
  if (password !== confirmPassword) {
    fieldErrors.confirmPassword.push("Passwords do not match.");
  }

  // Render errors under each input
  const elementMap = {
    name: nameEl,
    email: emailEl,
    password: passwordEl,
    confirmPassword: confirmPasswordEl,
  };
  Object.keys(fieldErrors).forEach(key => {
    if (fieldErrors[key].length) {
      showFieldError(elementMap[key], fieldErrors[key].join(" "));
    }
  });

  // Prevent submit if any errors
  return !Object.values(fieldErrors).some(arr => arr.length > 0);
}

function showFieldError(inputEl, message) {
  let errEl = inputEl.nextElementSibling;
  if (!errEl || !errEl.classList.contains("input-error")) {
    errEl = document.createElement("div");
    errEl.className = "input-error";
    inputEl.parentNode.insertBefore(errEl, inputEl.nextSibling);
  }
  errEl.textContent = message;
}

const formEl = document.getElementById("signUpForm");
formEl.addEventListener("submit", async function (e) {
  e.preventDefault();
  const isValid = validateSignUpForm();
  if (!isValid) return;

  const name = nameEl.value.trim();
  const email = emailEl.value.trim();
  const password = passwordEl.value;
  const isAdmin = !!isAdminEl.checked;

  // Use API to signup
  const result = await window.API.signup(email, name, password, isAdmin);

  if (result.success) {
    window.Notify?.show("Account created successfully.", "success", () => {
      // Redirect based on role
      if (result.user.is_admin) {
        window.location.href = "/frontend/pages/admin/dashboard.html";
      } else {
        window.location.href = "/frontend/index.html";
      }
    });
  } else {
    // Show backend errors
    if (result.errors) {
      if (result.errors.email) {
        showFieldError(emailEl, result.errors.email.join(" "));
      }
      if (result.errors.first_name) {
        showFieldError(nameEl, result.errors.first_name.join(" "));
      }
      if (result.errors.password1) {
        showFieldError(passwordEl, result.errors.password1.join(" "));
      }
      if (result.errors.password2) {
        showFieldError(confirmPasswordEl, result.errors.password2.join(" "));
      }
    } else {
      showFieldError(
        emailEl,
        result.message || "Signup failed. Please try again."
      );
    }
  }
});
