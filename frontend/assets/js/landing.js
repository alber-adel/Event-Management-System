// Landing page - Fetch and display events from API with Ajax filtering

let allEvents = [];

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
    // Refresh events to update registration status
    await loadEvents();
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

// Render events to the page
function renderEvents(events) {
  const eventsContainer = document.getElementById("eventsContainer");
  if (!eventsContainer) return;

  eventsContainer.innerHTML = "";
  const ul = document.createElement("ul");
  ul.classList.add("events-list");

  const loggedIn = isLoggedIn();
  const currentUser = getCurrentUser();

  events.forEach(event => {
    const li = document.createElement("li");
    li.classList.add("event");

    // Parse date
    const eventDate = new Date(event.date + "T" + event.time);
    const month = eventDate.toLocaleString("default", { month: "short" });
    const day = eventDate.getDate();

    // Check if user is registered (from event data if available)
    const isRegistered = event.is_registered || false;

    li.innerHTML = `
      <div class="event-image">
        <img src="${
          event.image_url ||
          event.image ||
          "https://via.placeholder.com/400x200"
        }" alt="${event.title}">
      </div>
      <div>
        <div class="date">
          <div class="month">${month}</div>
          <div class="day">${day}</div>
        </div>
        <div class="event-info">
          <h3 class="event-title">
            <a href="/frontend/pages/event_details.html?id=${event.id}">${
      event.title
    }</a>
          </h3>
          <div class="event-location">${
            event.location_name || event.location?.name || "Location TBA"
          }</div>
          <div class="event-time">${event.time} | Seats: ${
      event.number_of_seats || event.numberOfSeats
    }</div>
          <div class="event-time">Category: ${event.category}</div>
        </div>
      </div>
      <div class="event-action">
        <button>${isRegistered ? "View Details" : "Register Now"}</button>
      </div>
    `;

    const btn = li.querySelector(".event-action button");
    if (isRegistered) {
      btn.addEventListener("click", () => {
        window.location.href = `/frontend/pages/event_details.html?id=${event.id}`;
      });
    } else {
      btn.addEventListener("click", () => registerEvent(event.id));
    }

    ul.appendChild(li);
  });

  eventsContainer.appendChild(ul);
}

// Load events from API with optional filters (Ajax)
async function loadEvents(filters = {}) {
  try {
    const result = await window.API.getEvents(filters);

    if (result.success) {
      allEvents = result.events;
      renderEvents(allEvents);
    } else {
      console.error("Failed to load events:", result.message);
      // Show error message to user
      const eventsContainer = document.getElementById("eventsContainer");
      if (eventsContainer) {
        eventsContainer.innerHTML =
          '<p class="error-message">Failed to load events. Please try again later.</p>';
      }
    }
  } catch (error) {
    console.error("Error loading events:", error);
    const eventsContainer = document.getElementById("eventsContainer");
    if (eventsContainer) {
      eventsContainer.innerHTML =
        '<p class="error-message">Failed to load events. Please try again later.</p>';
    }
  }
}

// Populate category select with available categories
async function populateCategorySelect() {
  const select = document.getElementById("categorySelect");
  if (!select) return;

  try {
    const result = await window.API.getCategories();

    if (result.success && result.categories) {
      // Clear existing options except "All Categories"
      select
        .querySelectorAll("option:not(:first-child)")
        .forEach(o => o.remove());

      result.categories.forEach(category => {
        const opt = document.createElement("option");
        opt.value = category;
        opt.textContent = category;
        select.appendChild(opt);
      });
    }
  } catch (error) {
    console.error("Error loading categories:", error);
  }
}

// Apply filters and reload events (Ajax)
function applyFilters() {
  const searchInput = document.getElementById("searchInput");
  const dateInput = document.getElementById("searchDate");
  const categorySelect = document.getElementById("categorySelect");

  const filters = {};

  if (searchInput && searchInput.value.trim()) {
    filters.search = searchInput.value.trim();
  }

  if (dateInput && dateInput.value) {
    filters.date = dateInput.value;
  }

  if (categorySelect && categorySelect.value) {
    filters.category = categorySelect.value;
  }

  // Load events with filters (Ajax call)
  loadEvents(filters);
}

// Initialize search functionality
function initSearch() {
  const searchInput = document.getElementById("searchInput");
  const dateInput = document.getElementById("searchDate");
  const categorySelect = document.getElementById("categorySelect");

  // Add event listeners for real-time filtering (Ajax)
  if (searchInput) {
    searchInput.addEventListener("input", applyFilters);
  }

  if (dateInput) {
    dateInput.addEventListener("change", applyFilters);
  }

  if (categorySelect) {
    categorySelect.addEventListener("change", applyFilters);
  }
}

// Initialize page
async function init() {
  await populateCategorySelect();
  await loadEvents();
  initSearch();
}

// Start when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
