(function () {
  function ensureModal() {
    let modal = document.getElementById("globalNotificationModal");
    if (modal) return modal;
    modal = document.createElement("div");
    modal.id = "globalNotificationModal";
    modal.className = "notification-modal";
    modal.setAttribute("aria-hidden", "true");
    modal.innerHTML = `
      <div class="notification-modal-content">
        <div class="notification-icon" id="globalNotificationIcon">ℹ️</div>
        <p class="notification-message" id="globalNotificationMessage"></p>
        <button class="notification-btn" id="globalNotificationBtn" type="button">OK</button>
      </div>`;
    document.body.appendChild(modal);

    // wire up button
    const btn = modal.querySelector("#globalNotificationBtn");
    btn.addEventListener("click", function () {
      Notify.hide();
      const cb = modal._onClose;
      modal._onClose = null;
      if (typeof cb === "function") {
        try {
          cb();
        } catch (e) {}
      }
    });

    return modal;
  }

  function setIconForType(type) {
    if (type === "success") return "✅";
    if (type === "error") return "❌";
    if (type === "warning") return "⚠️";
    return "ℹ️";
  }

  const Notify = {
    show(message, type = "info", onClose = null) {
      const modal = ensureModal();
      const iconEl = modal.querySelector("#globalNotificationIcon");
      const msgEl = modal.querySelector("#globalNotificationMessage");
      iconEl.textContent = setIconForType(type);
      msgEl.textContent = message || "";
      modal._onClose = onClose || null;
      modal.setAttribute("aria-hidden", "false");
    },
    hide() {
      const modal = ensureModal();
      modal.setAttribute("aria-hidden", "true");
    },
  };

  window.Notify = Notify;
})();
