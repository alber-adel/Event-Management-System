(function () {
  const form = document.querySelector(".login-form");
  if (!form) return;

  const emailInput = form.querySelector('input[type="email"]');
  const passwordInput = form.querySelector('input[type="password"]');

  function showFieldError(inputEl, message) {
    // remove old error next to this input if exists
    let errEl = inputEl.nextElementSibling;
    if (!errEl || !errEl.classList.contains("input-error")) {
      errEl = document.createElement("div");
      errEl.className = "input-error";
      inputEl.parentNode.insertBefore(errEl, inputEl.nextSibling);
    }
    errEl.textContent = message;
  }

  function clearFieldErrors() {
    document.querySelectorAll(".input-error").forEach(el => el.remove());
  }

  function validateLoginForm() {
    clearFieldErrors();
    const errors = { email: [], password: [] };

    const email = (emailInput.value || "").trim();
    const password = passwordInput.value || "";

    if (!email) {
      errors.email.push("Email is required.");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email.push("Invalid email format.");
    }

    if (!password) {
      errors.password.push("Password is required.");
    }

    if (errors.email.length) showFieldError(emailInput, errors.email.join(" "));
    if (errors.password.length)
      showFieldError(passwordInput, errors.password.join(" "));

    return !Object.values(errors).some(arr => arr.length > 0);
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    if (!validateLoginForm()) return;

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    // Use API to login
    const result = await window.API.login(email, password);

    if (result.success) {
      // Redirect based on role
      if (result.user.is_admin) {
        window.location.href = "/frontend/pages/admin/dashboard.html";
      } else {
        window.location.href = "/frontend/index.html";
      }
    } else {
      // Show backend errors
      if (result.errors) {
        if (result.errors.email) {
          showFieldError(emailInput, result.errors.email.join(" "));
        }
        if (result.errors.password) {
          showFieldError(passwordInput, result.errors.password.join(" "));
        }
        if (result.errors.non_field_errors) {
          showFieldError(emailInput, result.errors.non_field_errors.join(" "));
        }
      } else {
        showFieldError(
          emailInput,
          result.message || "Invalid email or password."
        );
      }
    }
  });
})();
