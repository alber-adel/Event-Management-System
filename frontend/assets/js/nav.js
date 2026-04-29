document.addEventListener("DOMContentLoaded", async () => {
  // Handle mobile nav toggle
  document.querySelectorAll(".nav-toggle").forEach(btn => {
    const navLinks = btn.parentElement.querySelector(".nav-links");
    btn.addEventListener("click", () => {
      navLinks.classList.toggle("open");
      btn.setAttribute("aria-expanded", navLinks.classList.contains("open"));
    });
  });

  // Check if API is loaded (some pages might not have it)
  if (typeof window.API === "undefined") {
    return;
  }

  // Check current path
  const currentPath = window.location.pathname;
  const isAuthPage =
    currentPath.includes("login.html") || currentPath.includes("sign-up.html");
  const isAdminPage = currentPath.includes("/admin/");

  // Check current user and update navigation
  try {
    const response = await window.API.getCurrentUser();
    const user = response.user;

    // If user is logged in
    if (user && user.email) {
      // Redirect authenticated users away from login/signup pages
      if (isAuthPage) {
        if (user.is_admin) {
          window.location.href = "/frontend/pages/admin/dashboard.html";
        } else {
          window.location.href = "/frontend/index.html";
        }
        return;
      }

      // Protect admin pages - redirect non-admin users
      if (isAdminPage && !user.is_admin) {
        window.location.href = "/frontend/index.html";
        return;
      }

      // Update navigation based on role
      updateNavForAuthenticatedUser(user);
    } else {
      // If not logged in and trying to access admin pages, redirect to login
      if (isAdminPage) {
        window.location.href = "/frontend/pages/login.html";
        return;
      }
      // Update navigation for non-authenticated users
      updateNavForNonAuthenticatedUser();
    }
  } catch (error) {
    // User not logged in, navigation will remain as is (static HTML)
    // If trying to access admin pages, redirect to login
    if (isAdminPage) {
      window.location.href = "/frontend/pages/login.html";
      return;
    }
    // Update navigation for non-authenticated users
    updateNavForNonAuthenticatedUser();
    console.log("User not authenticated");
  }
});

function updateNavForAuthenticatedUser(user) {
  document.querySelectorAll(".nav-links").forEach(nav => {
    nav.innerHTML = "";

    if (user.is_admin) {
      // Admin navigation
      const dashboard = document.createElement("a");
      dashboard.href = "/frontend/pages/admin/dashboard.html";
      dashboard.textContent = "Dashboard";
      nav.appendChild(dashboard);

      const registrations = document.createElement("a");
      registrations.href = "/frontend/pages/admin/registerations.html";
      registrations.textContent = "Registrations";
      nav.appendChild(registrations);
    } else {
      // Regular user navigation
      const home = document.createElement("a");
      home.href = "/frontend/index.html";
      home.textContent = "Home";
      nav.appendChild(home);

      const myEvents = document.createElement("a");
      myEvents.href = "/frontend/pages/registered-events.html";
      myEvents.textContent = "My Events";
      nav.appendChild(myEvents);

      const about = document.createElement("a");
      about.href = "/frontend/pages/about.html";
      about.textContent = "About";
      nav.appendChild(about);

      const contact = document.createElement("a");
      contact.href = "/frontend/pages/contact.html";
      contact.textContent = "Contact";
      nav.appendChild(contact);
    }

    // Add logout button for all authenticated users
    const logout = document.createElement("a");
    logout.href = "#";
    logout.className = "nav-auth-btn";
    logout.textContent = "Logout";
    logout.addEventListener("click", async e => {
      e.preventDefault();
      try {
        await window.API.logout();
        window.location.href = "/frontend/index.html";
      } catch (error) {
        console.error("Logout error:", error);
        window.location.href = "/frontend/index.html";
      }
    });
    nav.appendChild(logout);
  });
}

function updateNavForNonAuthenticatedUser() {
  document.querySelectorAll(".nav-links").forEach(nav => {
    nav.innerHTML = "";

    const home = document.createElement("a");
    home.href = "/frontend/index.html";
    home.textContent = "Home";
    nav.appendChild(home);

    const about = document.createElement("a");
    about.href = "/frontend/pages/about.html";
    about.textContent = "About";
    nav.appendChild(about);

    const contact = document.createElement("a");
    contact.href = "/frontend/pages/contact.html";
    contact.textContent = "Contact";
    nav.appendChild(contact);

    const login = document.createElement("a");
    login.href = "/frontend/pages/login.html";
    login.className = "nav-auth-btn";
    login.textContent = "Login";
    nav.appendChild(login);

    const signup = document.createElement("a");
    signup.href = "/frontend/pages/sign-up.html";
    signup.className = "nav-auth-btn signup";
    signup.textContent = "Sign Up";
    nav.appendChild(signup);
  });
}
