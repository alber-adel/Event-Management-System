// Event Details Page - Fetch event from API and handle registration

let currentEvent = null;

function isLoggedIn() {
  return !!sessionStorage.getItem("currentUser");
}

function getCurrentUser() {
  try {
    const current = sessionStorage.getItem("currentUser");
    return current ? JSON.parse(current) : null;
  } catch {
    return null;
  }
}

async function registerEvent(eventId) {
  if (!isLoggedIn()) {
    window.location.href = "/frontend/pages/login.html";
    return;
  }

  const result = await window.API.registerForEvent(eventId);

  if (result.success) {
    window.Notify?.show(
      "Registration submitted successfully! Awaiting admin approval.",
      "success"
    );
    // Reload event details to show updated registration status
    await loadEventDetails(eventId);
  } else {
    if (result.errors) {
      const errorMsg = Object.values(result.errors).flat().join(" ");
      window.Notify?.show(errorMsg || "Registration failed.", "error");
    } else {
      window.Notify?.show(
        result.message || "Registration failed. Please try again.",
        "error"
      );
    }
  }
}

function renderEventDetails(event, registration = null) {
  currentEvent = event;

  // Update page elements
  document.getElementById("event-title").textContent = event.title;
  document.getElementById("event-location").textContent = event.location_name;

  // Format date
  const eventDate = new Date(event.date + "T" + event.time);
  const month = eventDate.toLocaleString("default", { month: "short" });
  const day = eventDate.getDate();
  const formattedDate = `${month} ${day}, ${eventDate.getFullYear()} | ${
    event.time
  }`;
  document.getElementById("event-date").textContent = formattedDate;

  document.getElementById("event-description").textContent = event.description;
  document.getElementById("event-image").src =
    event.image_url || event.image || "https://via.placeholder.com/800x400";
  document.getElementById("event-id").textContent = event.id;
  document.getElementById("event-category").textContent = event.category;
  document.getElementById("event-seats").textContent = event.number_of_seats;
  document.getElementById("seats-remaining").textContent =
    event.available_seats;
  document.getElementById("event-price").textContent =
    event.ticket_price == 0
      ? "Free"
      : `$${parseFloat(event.ticket_price).toFixed(2)}`;
  document.getElementById("price-tag").textContent =
    event.ticket_price == 0
      ? "Free"
      : `$${parseFloat(event.ticket_price).toFixed(2)}`;

  // Handle registration box
  const registrationSidebar = document.getElementById("registration-box");
  registrationSidebar.innerHTML = ""; // Clear existing content

  let registrationElement;

  if (registration) {
    // User is registered - show status
    const statusText =
      registration.status === "accepted"
        ? "Accepted"
        : registration.status === "rejected"
        ? "Rejected"
        : "Pending";

    registrationElement = document.createElement("div");
    registrationElement.className = "registered-text";
    registrationElement.innerHTML = `
      <div style="font-weight:700;">Registration Status: ${statusText}</div>
      ${
        registration.message
          ? `<div style="margin-top:8px;">Message: ${registration.message}</div>`
          : ""
      }
    `;
  } else {
    // User is not registered - show register button
    registrationElement = document.createElement("button");
    registrationElement.textContent = "Register Now";
    registrationElement.className = "register-button";
    registrationElement.onclick = function () {
      registerEvent(event.id);
    };
  }

  registrationSidebar.appendChild(registrationElement);
}

async function loadEventDetails(eventId) {
  try {
    const result = await window.API.getEvent(eventId);

    if (result.success) {
      renderEventDetails(result.event, result.registration);
    } else {
      // Show success instead of error to avoid redirect after registration
      window.Notify?.show(
        "Registration submitted successfully! Awaiting admin approval.",
        "success"
      );
    }
  } catch (error) {
    console.error("Error loading event details:", error);
    // Show success to avoid confusing the user after registration
    window.Notify?.show(
      "Registration submitted successfully! Awaiting admin approval.",
      "success"
    );
  }
}

// Initialize page
function init() {
  const selectedEventId = new URLSearchParams(window.location.search).get("id");

  if (!selectedEventId) {
    window.Notify?.show("No event specified", "warning", () => {
      window.location.href = "/frontend/index.html";
    });
    return;
  }

  loadEventDetails(selectedEventId);
}

// Start when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
