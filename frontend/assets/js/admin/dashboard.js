(function () {
  const tbody = document.getElementById("eventsTbody");
  const modal = document.getElementById("eventModal");
  const modalTitle = document.getElementById("modalTitle");
  const form = document.getElementById("eventForm");
  const modalClose = document.getElementById("modalClose");
  const openCreateBtn = document.getElementById("openCreateModal");

  // Notification modal elements
  const notificationModal = document.getElementById("notificationModal");
  const notificationIcon = document.getElementById("notificationIcon");
  const notificationMessage = document.getElementById("notificationMessage");
  const notificationBtn = document.getElementById("notificationBtn");

  // Confirmation modal elements
  const confirmationModal = document.getElementById("confirmationModal");
  const confirmationMessage = document.getElementById("confirmationMessage");
  const confirmYes = document.getElementById("confirmYes");
  const confirmNo = document.getElementById("confirmNo");

  if (!tbody) return;

  let currentEditingEventId = null;
  let confirmCallback = null;

  // Modal helper functions
  function showNotification(message, type = "success") {
    notificationMessage.textContent = message;

    // Set icon based on type
    if (type === "success") {
      notificationIcon.textContent = "✅";
    } else if (type === "error") {
      notificationIcon.textContent = "❌";
    } else if (type === "warning") {
      notificationIcon.textContent = "⚠️";
    } else {
      notificationIcon.textContent = "ℹ️";
    }

    notificationModal.setAttribute("aria-hidden", "false");
  }

  function hideNotification() {
    notificationModal.setAttribute("aria-hidden", "true");
  }

  function showConfirmation(message) {
    return new Promise(resolve => {
      confirmationMessage.textContent = message;
      confirmationModal.setAttribute("aria-hidden", "false");
      confirmCallback = resolve;
    });
  }

  function hideConfirmation(result) {
    confirmationModal.setAttribute("aria-hidden", "true");
    if (confirmCallback) {
      confirmCallback(result);
      confirmCallback = null;
    }
  }

  // Event listeners for notification modal
  notificationBtn.addEventListener("click", hideNotification);

  // Event listeners for confirmation modal
  confirmYes.addEventListener("click", () => hideConfirmation(true));
  confirmNo.addEventListener("click", () => hideConfirmation(false));

  function openModal(mode, eventObj = null) {
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    if (mode === "create") {
      modalTitle.textContent = "Create Event";
      form.reset();
      document.getElementById("eventId").value = "";
      currentEditingEventId = null;
    } else {
      modalTitle.textContent = "Edit Event";
      fillForm(eventObj);
      currentEditingEventId = eventObj.id;
    }
  }

  function closeModal() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    currentEditingEventId = null;
  }

  modalClose.addEventListener("click", closeModal);
  modal.addEventListener("click", e => {
    if (e.target === modal) closeModal();
  });

  openCreateBtn.addEventListener("click", () => openModal("create"));

  function fillForm(e) {
    document.getElementById("eventId").value = e.id;
    document.getElementById("title").value = e.title;
    document.getElementById("date").value = e.date;
    document.getElementById("time").value = e.time;
    document.getElementById("category").value = e.category;
    document.getElementById("numberOfSeats").value =
      e.number_of_seats || e.numberOfSeats;
    document.getElementById("ticketPrice").value =
      e.ticket_price || e.ticketPrice;
    document.getElementById("locationName").value =
      e.location_name || e.location?.name || "";
    document.getElementById("image").value = e.image_url || e.image || "";
    document.getElementById("description").value = e.description || "";
  }

  function escapeHtml(str) {
    return String(str).replace(
      /[&<>"']/g,
      s =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        }[s])
    );
  }

  tbody.addEventListener("click", async e => {
    const editBtn = e.target.closest(".btn-edit");
    const delBtn = e.target.closest(".btn-delete");

    if (editBtn) {
      const id = parseInt(editBtn.dataset.id);
      try {
        const result = await window.API.getEvent(id);
        if (result.success) {
          openModal("edit", result.event);
        } else {
          showNotification("Failed to load event details.", "error");
        }
      } catch (error) {
        console.error("Error loading event:", error);
        showNotification("Failed to load event details.", "error");
      }
    } else if (delBtn) {
      const id = parseInt(delBtn.dataset.id);
      const confirmed = await showConfirmation(
        "Are you sure you want to delete this event?"
      );

      if (confirmed) {
        try {
          const result = await window.API.deleteEvent(id);
          if (result.success) {
            // Remove the row from DOM without reloading the entire page
            const row = delBtn.closest("tr");
            if (row) {
              row.remove();
            }
            showNotification("Event deleted successfully.", "success");
          } else {
            showNotification(
              result.message || "Failed to delete event.",
              "error"
            );
          }
        } catch (error) {
          console.error("Error deleting event:", error);
          showNotification("Failed to delete event.", "error");
        }
      }
    }
  });

  form.addEventListener("submit", async e => {
    e.preventDefault();

    const data = {
      title: document.getElementById("title").value.trim(),
      date: document.getElementById("date").value,
      time: document.getElementById("time").value,
      category: document.getElementById("category").value.trim(),
      number_of_seats: parseInt(document.getElementById("numberOfSeats").value),
      ticket_price: parseFloat(document.getElementById("ticketPrice").value),
      location_name: document.getElementById("locationName").value.trim(),
      image_url: document.getElementById("image").value.trim(),
      description: document.getElementById("description").value.trim(),
      status: "upcoming",
    };

    // Basic client-side validation
    if (
      !data.title ||
      !data.date ||
      !data.time ||
      !data.category ||
      !data.location_name ||
      !data.description
    ) {
      showNotification("Please fill all required fields.", "warning");
      return;
    }
    if (isNaN(data.number_of_seats) || data.number_of_seats < 1) {
      showNotification("Seat number must be >= 1.", "warning");
      return;
    }
    if (isNaN(data.ticket_price) || data.ticket_price < 0) {
      showNotification("Price must be >= 0.", "warning");
      return;
    }

    try {
      let result;
      if (currentEditingEventId) {
        // Update existing event
        result = await window.API.updateEvent(currentEditingEventId, data);
        if (result.success) {
          // Update the row in the table without reloading
          updateEventRow(currentEditingEventId, result.event);
          closeModal();
          showNotification("Event updated successfully.", "success");
        } else {
          if (result.errors) {
            const errorMsg = Object.entries(result.errors)
              .map(([field, msgs]) => `${field}: ${msgs.join(", ")}`)
              .join("\n");
            showNotification("Validation errors:\n" + errorMsg, "error");
          } else {
            showNotification(
              result.message || "Failed to update event.",
              "error"
            );
          }
          return;
        }
      } else {
        // Create new event
        result = await window.API.createEvent(data);
        if (result.success) {
          // Add the new event to the table without reloading
          addEventRow(result.event);
          closeModal();
          showNotification("Event created successfully.", "success");
        } else {
          if (result.errors) {
            const errorMsg = Object.entries(result.errors)
              .map(([field, msgs]) => `${field}: ${msgs.join(", ")}`)
              .join("\n");
            showNotification("Validation errors:\n" + errorMsg, "error");
          } else {
            showNotification(
              result.message || "Failed to create event.",
              "error"
            );
          }
          return;
        }
      }
    } catch (error) {
      console.error("Error saving event:", error);
      showNotification("Failed to save event. Please try again.", "error");
    }
  });

  // Helper function to update a specific event row
  function updateEventRow(eventId, eventData) {
    const rows = tbody.querySelectorAll("tr");
    rows.forEach(row => {
      const editBtn = row.querySelector(".btn-edit");
      if (editBtn && parseInt(editBtn.dataset.id) === eventId) {
        // Remove old row
        row.remove();
        // Add updated row
        addEventRow(eventData);
      }
    });
  }

  // Helper function to add a new event row
  function addEventRow(evt) {
    const tr = document.createElement("tr");

    function td(label, content) {
      const cell = document.createElement("td");
      cell.dataset.label = label;
      cell.innerHTML = content;
      return cell;
    }

    const seatsText = `${evt.booked_seats || 0}/${
      evt.number_of_seats || evt.numberOfSeats
    }`;
    const priceText =
      (evt.ticket_price || evt.ticketPrice) == 0
        ? "Free"
        : `$${parseFloat(evt.ticket_price || evt.ticketPrice)}`;

    tr.appendChild(td("ID", evt.id));
    tr.appendChild(td("Title", escapeHtml(evt.title)));
    tr.appendChild(
      td("Date / Time", `${evt.date}<br><small>${evt.time}</small>`)
    );
    tr.appendChild(
      td("Location", escapeHtml(evt.location_name || evt.location?.name || ""))
    );
    tr.appendChild(td("Category", escapeHtml(evt.category)));
    tr.appendChild(td("Seats", seatsText));
    tr.appendChild(td("Price", priceText));

    const actionsTd = td(
      "Actions",
      `<div class="actions">
         <button type="button" class="btn btn-edit" data-id="${evt.id}">Edit</button>
         <button type="button" class="btn btn-delete" data-id="${evt.id}">Delete</button>
       </div>`
    );
    tr.appendChild(actionsTd);

    tbody.appendChild(tr);
  }

  // Helper function to load and render all events (only called on initial page load)
  async function loadAndRenderEvents() {
    try {
      const result = await window.API.getEvents();

      if (result.success) {
        renderEvents(result.events);
      } else {
        console.error("Failed to load events:", result.message);
        tbody.innerHTML =
          '<tr><td colspan="8">Failed to load events. Please try again.</td></tr>';
      }
    } catch (error) {
      console.error("Error loading events:", error);
      tbody.innerHTML =
        '<tr><td colspan="8">Failed to load events. Please try again.</td></tr>';
    }
  }

  function renderEvents(events) {
    // Sort by date
    const sorted = [...events].sort((a, b) => {
      const ad = new Date(a.date + "T" + a.time);
      const bd = new Date(b.date + "T" + b.time);
      return ad - bd;
    });

    tbody.innerHTML = "";
    sorted.forEach(evt => {
      const tr = document.createElement("tr");

      function td(label, content) {
        const cell = document.createElement("td");
        cell.dataset.label = label;
        cell.innerHTML = content;
        return cell;
      }

      const seatsText = `${evt.booked_seats || 0}/${
        evt.number_of_seats || evt.numberOfSeats
      }`;
      const priceText =
        (evt.ticket_price || evt.ticketPrice) == 0
          ? "Free"
          : `$${parseFloat(evt.ticket_price || evt.ticketPrice)}`;

      tr.appendChild(td("ID", evt.id));
      tr.appendChild(td("Title", escapeHtml(evt.title)));
      tr.appendChild(
        td("Date / Time", `${evt.date}<br><small>${evt.time}</small>`)
      );
      tr.appendChild(
        td(
          "Location",
          escapeHtml(evt.location_name || evt.location?.name || "")
        )
      );
      tr.appendChild(td("Category", escapeHtml(evt.category)));
      tr.appendChild(td("Seats", seatsText));
      tr.appendChild(td("Price", priceText));

      const actionsTd = td(
        "Actions",
        `<div class="actions">
           <button type="button" class="btn btn-edit" data-id="${evt.id}">Edit</button>
           <button type="button" class="btn btn-delete" data-id="${evt.id}">Delete</button>
         </div>`
      );
      tr.appendChild(actionsTd);

      tbody.appendChild(tr);
    });
  }

  // Initial load - only called once when page loads
  loadAndRenderEvents();
})();
