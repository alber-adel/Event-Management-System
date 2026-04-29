document.addEventListener("DOMContentLoaded", async () => {
  const modalOverlay = document.getElementById("message-modal-overlay");
  const closeBtn = document.querySelector(".close-btn");
  const triggerBtnsSelector = ".trigger-modal";
  const modalTitle = document.getElementById("modal-title");
  const sendActionBtn = document.getElementById("send-action-btn");
  const actionText = document.getElementById("action-text");
  const modalEventTitle = document.getElementById("modal-event-title");
  const modalRecipientName = document.getElementById("modal-recipient-name");
  const messageInput = document.getElementById("message-input");

  const eventSelect = document.getElementById("eventSelect");
  const loadBtn = document.getElementById("loadRegistrations");
  const listContainer = document.getElementById("registrationsContainer");

  let allEvents = [];
  let allRegistrations = [];

  // Load events from API
  async function loadEvents() {
    try {
      const response = await window.API.getEvents();
      allEvents = response.events || [];
      populateEventSelect();
    } catch (error) {
      console.error("Error loading events:", error);
      window.Notify?.show("Failed to load events. Please try again.", "error");
    }
  }

  // Load all registrations from API
  async function loadAllRegistrations() {
    try {
      const response = await window.API.getAdminRegistrations();
      allRegistrations = response.registrations || [];
    } catch (error) {
      console.error("Error loading registrations:", error);
      window.Notify?.show(
        "Failed to load registrations. Please try again.",
        "error"
      );
    }
  }

  // Populate event selector
  function populateEventSelect() {
    const sortedEvents = [...allEvents].sort((a, b) => a.id - b.id);
    eventSelect.innerHTML = "";
    sortedEvents.forEach(evt => {
      const opt = document.createElement("option");
      opt.value = String(evt.id);
      opt.textContent = `${evt.id} — ${evt.title}`;
      eventSelect.appendChild(opt);
    });
  }

  // Render registrations for selected event
  function renderRegistrations(eventId) {
    listContainer.innerHTML = "";

    if (!allEvents.length) {
      listContainer.innerHTML = "<p>No events found.</p>";
      return;
    }

    const evt = allEvents.find(e => e.id === parseInt(eventId));
    if (!evt) {
      listContainer.innerHTML = "<p>Selected event not found.</p>";
      return;
    }

    // Match serializer shape: `event` is the event ID
    const regs = allRegistrations.filter(r => r.event === parseInt(eventId));
    if (!regs.length) {
      listContainer.innerHTML = "<p>No registrations for this event yet.</p>";
      return;
    }

    regs.forEach(reg => {
      const card = document.createElement("div");
      card.className = `card ${
        reg.status === "accepted"
          ? "accepted"
          : reg.status === "rejected"
          ? "rejected"
          : "pending"
      }`;
      card.innerHTML = `
        <div class="date-box">
          <span class="month">${new Date(
            evt.date + "T" + evt.time
          ).toLocaleString("default", { month: "short" })}</span>
          <span class="day">${new Date(
            evt.date + "T" + evt.time
          ).getDate()}</span>
        </div>
        <div class="info-area">
          <div class="event-title">${evt.title}</div>
          <div class="details">
            <p>Registered by: ${reg.user_email}</p>
            <p>Status: <strong>${reg.status.toUpperCase()}</strong></p>
            ${reg.message ? `<p>Message: ${reg.message}</p>` : ""}
          </div>
        </div>
        <div class="actions">
          <button class="accept-btn trigger-modal" data-action="Accept" data-reg-id="${
            reg.id
          }">Accept</button>
          <button class="reject-btn trigger-modal" data-action="Reject" data-reg-id="${
            reg.id
          }">Reject</button>
        </div>
      `;
      listContainer.appendChild(card);
    });

    // Bind triggers
    listContainer.querySelectorAll(triggerBtnsSelector).forEach(button => {
      button.addEventListener("click", e => {
        e.preventDefault();
        const action = e.currentTarget.getAttribute("data-action");
        const card = e.currentTarget.closest(".card");
        const regId = parseInt(e.currentTarget.getAttribute("data-reg-id"));
        const reg = allRegistrations.find(r => r.id === regId);
        openModal(action, card, evt, reg);
      });
    });
  }

  function closeModal() {
    modalOverlay.classList.remove("active");
    setTimeout(() => {
      modalOverlay.style.display = "none";
    }, 300);
  }

  function openModal(action, card, evt, reg) {
    let title, btnText, btnClass;
    if (action === "Accept") {
      title = "Confirm Event Acceptance";
      btnText = "Accept";
      btnClass = "accept-style";
    } else if (action === "Reject") {
      title = "Confirm Event Rejection";
      btnText = "Reject";
      btnClass = "reject-style";
    } else {
      return;
    }

    // Extract current status from card
    const statusTextEl = card.querySelector(".details p:nth-child(2) strong");
    const currentStatus = (
      statusTextEl?.textContent || "PENDING"
    ).toLowerCase();

    // Prevent action if not pending
    if (currentStatus !== "pending") {
      window.Notify?.show(
        "Only registrations with status 'pending' can be processed.",
        "warning"
      );
      return;
    }

    modalTitle.textContent = title;
    actionText.textContent = btnText;
    sendActionBtn.classList.remove("accept-style", "reject-style");
    sendActionBtn.classList.add(btnClass);
    messageInput.value = "";

    modalEventTitle.textContent = evt.title;
    modalRecipientName.textContent = reg.user_email;

    // Store context on the button
    sendActionBtn.dataset.registrationId = String(reg.id);
    sendActionBtn.dataset.status =
      btnText.toLowerCase() === "accept" ? "accepted" : "rejected";
    sendActionBtn.dataset.eventId = String(evt.id);

    modalOverlay.style.display = "flex";
    setTimeout(() => {
      modalOverlay.classList.add("active");
    }, 10);
  }

  closeBtn.addEventListener("click", closeModal);
  modalOverlay.addEventListener("click", e => {
    if (e.target === modalOverlay) closeModal();
  });

  sendActionBtn.addEventListener("click", async () => {
    const message = messageInput.value || "";
    const status = sendActionBtn.dataset.status; // 'accepted' | 'rejected'
    const registrationId = parseInt(sendActionBtn.dataset.registrationId);
    const eventId = sendActionBtn.dataset.eventId;

    try {
      await window.API.updateRegistrationStatus(
        registrationId,
        status,
        message
      );
      window.Notify?.show(
        `Request to ${
          status === "accepted" ? "accept" : "reject"
        } sent successfully!`,
        "success"
      );
      closeModal();

      // Reload registrations data
      await loadAllRegistrations();
      renderRegistrations(eventId);
    } catch (error) {
      console.error("Error updating registration:", error);
      window.Notify?.show(
        "Failed to update registration. Please try again.",
        "error"
      );
    }
  });

  loadBtn.addEventListener("click", () =>
    renderRegistrations(eventSelect.value)
  );

  // Initialize
  await loadEvents();
  await loadAllRegistrations();
  if (eventSelect.value) renderRegistrations(eventSelect.value);
});
