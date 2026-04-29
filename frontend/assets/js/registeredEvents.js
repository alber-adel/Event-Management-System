(function () {
  const listEl = document.getElementById("registeredEventsList");
  if (!listEl) return;

  function getCurrentUser() {
    try {
      const raw = sessionStorage.getItem("currentUser");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  const user = getCurrentUser();
  if (!user) {
    listEl.innerHTML = `<li style="padding:20px;">You must log in to view your registered events.</li>`;
    return;
  }

  async function loadRegistrations() {
    try {
      const result = await window.API.getUserRegistrations();

      if (!result.success) {
        listEl.innerHTML = `<li style="padding:20px;">${
          result.message || "Failed to load registrations"
        }</li>`;
        return;
      }

      const registrations = result.registrations;

      if (registrations.length === 0) {
        listEl.innerHTML = `<li style="padding:20px;">You have not registered for any events yet.</li>`;
        return;
      }

      // Sort by event date
      registrations.sort((a, b) => {
        const ad = new Date(a.event_date + "T" + a.event_time);
        const bd = new Date(b.event_date + "T" + b.event_time);
        return ad - bd;
      });

      // Render each registration
      registrations.forEach(reg => {
        const d = new Date(reg.event_date + "T" + reg.event_time);
        const month = d.toLocaleString("default", { month: "short" });
        const day = d.getDate();

        const statusClass =
          reg.status === "accepted"
            ? "status-accepted"
            : reg.status === "rejected"
            ? "status-rejected"
            : "status-pending";
        const statusText =
          reg.status.charAt(0).toUpperCase() + reg.status.slice(1);

        const li = document.createElement("li");
        li.className = "event";
        li.innerHTML = `
          <div class="event-image">
            <img src="${reg.image_url}" alt="${
              reg.event_title
            }">
          </div>
          <div>
            <div class="date">
              <div class="month">${month}</div>
              <div class="day">${day}</div>
            </div>
            <div class="event-info">
              <h3 class="event-title">
                <a href="/frontend/pages/event_details.html?id=${reg.event}">${
          reg.event_title
        }</a>
              </h3>
              <div class="event-location">${reg.event_location || "TBD"}</div>
              <div class="event-time">${reg.event_time}</div>
            </div>
          </div>
          <div class="event-status-bar ${statusClass}">
            <span class="status-label">Status:</span>
            <span class="status-value">${statusText}</span>
            ${
              reg.message
                ? `<span class="status-label" style="margin-left:12px;">Message:</span><span class="status-value">${reg.message}</span>`
                : ""
            }
          </div>
        `;
        listEl.appendChild(li);
      });
    } catch (error) {
      console.error("Error loading registrations:", error);
      listEl.innerHTML = `<li style="padding:20px;">Failed to load registrations. Please try again later.</li>`;
    }
  }

  // Load registrations on page load
  loadRegistrations();
})();
