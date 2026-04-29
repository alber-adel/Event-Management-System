/**
 * API Module for EventsHub
 * Handles all communication with Django backend API using AJAX techniques
 * Supports both XMLHttpRequest (traditional AJAX) and Fetch API (modern AJAX)
 */

const API_BASE_URL = "http://127.0.0.1:8000";

// ============ AJAX Configuration ============
// Set default to 'fetch' (modern). You can override per-call via options.ajax
// e.g. makeRequest(url, { ajax: 'xhr', ... }) to force traditional XHR
const AJAX_METHOD = "fetch"; // Default: 'xhr' or 'fetch'

// ============ AJAX Helper Functions ============

/**
 * Traditional AJAX using XMLHttpRequest
 * @param {string} url - The API endpoint URL
 * @param {Object} options - Request options
 * @returns {Promise} - Promise that resolves with response data
 */
function ajaxRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const method = options.method || "GET";
    const isAsync = true;

    xhr.open(method, url, isAsync);

    // Set request headers
    if (options.headers) {
      Object.keys(options.headers).forEach(key => {
        xhr.setRequestHeader(key, options.headers[key]);
      });
    }

    // Include credentials (cookies)
    xhr.withCredentials = options.credentials === "include";

    // Handle load event (successful response)
    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          resolve(data);
        } catch (error) {
          resolve(xhr.responseText);
        }
      } else {
        try {
          const errorData = JSON.parse(xhr.responseText);
          resolve(errorData); // Return error data instead of rejecting
        } catch (error) {
          reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
        }
      }
    };

    // Handle error event (network errors)
    xhr.onerror = function () {
      reject(new Error("Network error occurred"));
    };

    // Handle timeout
    if (options.timeout) {
      xhr.timeout = options.timeout;
      xhr.ontimeout = function () {
        reject(new Error("Request timeout"));
      };
    }

    // Send request with body if provided
    if (options.body) {
      xhr.send(options.body);
    } else {
      xhr.send();
    }
  });
}

/**
 * Modern AJAX using Fetch API
 * @param {string} url - The API endpoint URL
 * @param {Object} options - Request options
 * @returns {Promise} - Promise that resolves with response data
 */
async function fetchRequest(url, options = {}) {
  try {
    const response = await fetch(url, options);

    // Parse JSON response
    const contentType = response.headers.get("content-type");
    let data;

    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    return data;
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
}

/**
 * Universal AJAX request handler
 * Automatically uses the configured AJAX method (XHR or Fetch)
 */
async function makeRequest(url, options = {}) {
  const chosen = options && options.ajax ? options.ajax : AJAX_METHOD;
  // Shallow-clone options without the custom `ajax` field
  const { ajax: _omitAjax, ...cleanOptions } = options || {};
  if (chosen === "xhr") {
    return ajaxRequest(url, cleanOptions);
  } else {
    return fetchRequest(url, cleanOptions);
  }
}

// CSRF Token Helper
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

// Initialize CSRF token
async function initializeCSRF() {
  try {
    await makeRequest(`${API_BASE_URL}/api/auth/csrf/`, {
      credentials: "include",
    });
  } catch (error) {
    console.error("Failed to get CSRF token:", error);
  }
}

// Call this immediately
initializeCSRF();

// API Object with all endpoint methods
const API = {
  // ============ Authentication ============

  async signup(email, name, password, isAdmin = false) {
    try {
      const data = await makeRequest(`${API_BASE_URL}/api/auth/signup/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken"),
        },
        credentials: "include",
        body: JSON.stringify({
          email: email,
          first_name: name,
          password1: password,
          password2: password,
          is_admin: isAdmin,
        }),
      });

      if (data.success) {
        // Store user in sessionStorage
        sessionStorage.setItem("currentUser", JSON.stringify(data.user));
      }

      return data;
    } catch (error) {
      console.error("Signup error:", error);
      return { success: false, message: "Network error. Please try again." };
    }
  },

  async login(email, password) {
    try {
      const data = await makeRequest(`${API_BASE_URL}/api/auth/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken"),
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (data.success) {
        // Store user in sessionStorage
        sessionStorage.setItem("currentUser", JSON.stringify(data.user));
      }

      return data;
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, message: "Network error. Please try again." };
    }
  },

  async logout() {
    try {
      const data = await makeRequest(`${API_BASE_URL}/api/auth/logout/`, {
        method: "POST",
        headers: {
          "X-CSRFToken": getCookie("csrftoken"),
        },
        credentials: "include",
      });

      if (data.success) {
        sessionStorage.removeItem("currentUser");
      }

      return data;
    } catch (error) {
      console.error("Logout error:", error);
      return { success: false, message: "Network error. Please try again." };
    }
  },

  async getCurrentUser() {
    try {
      const data = await makeRequest(`${API_BASE_URL}/api/auth/current-user/`, {
        credentials: "include",
      });

      if (data.success) {
        sessionStorage.setItem("currentUser", JSON.stringify(data.user));
      } else {
        sessionStorage.removeItem("currentUser");
      }

      return data;
    } catch (error) {
      console.error("Get current user error:", error);
      return { success: false, message: "Network error. Please try again." };
    }
  },

  // ============ Events (Ajax support) ============

  async getEvents(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append("search", filters.search);
      if (filters.category) params.append("category", filters.category);
      if (filters.date) params.append("date", filters.date);
      if (filters.page) params.append("page", filters.page);

      // Use Fetch API explicitly for listing (AJAX scenario 1)
      return await makeRequest(`${API_BASE_URL}/api/events/?${params}`, {
        credentials: "include",
        ajax: "fetch",
      });
    } catch (error) {
      console.error("Get events error:", error);
      return { success: false, message: "Failed to fetch events" };
    }
  },

  async getEvent(eventId) {
    try {
      return await makeRequest(`${API_BASE_URL}/api/events/${eventId}/`, {
        credentials: "include",
      });
    } catch (error) {
      console.error("Get event error:", error);
      return { success: false, message: "Failed to fetch event details" };
    }
  },

  async createEvent(eventData) {
    try {
      return await makeRequest(`${API_BASE_URL}/api/events/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken"),
        },
        credentials: "include",
        body: JSON.stringify(eventData),
      });
    } catch (error) {
      console.error("Create event error:", error);
      return { success: false, message: "Failed to create event" };
    }
  },

  async updateEvent(eventId, eventData) {
    try {
      return await makeRequest(`${API_BASE_URL}/api/events/${eventId}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken"),
        },
        credentials: "include",
        body: JSON.stringify(eventData),
      });
    } catch (error) {
      console.error("Update event error:", error);
      return { success: false, message: "Failed to update event" };
    }
  },

  async deleteEvent(eventId) {
    try {
      return await makeRequest(`${API_BASE_URL}/api/events/${eventId}/`, {
        method: "DELETE",
        headers: {
          "X-CSRFToken": getCookie("csrftoken"),
        },
        credentials: "include",
      });
    } catch (error) {
      console.error("Delete event error:", error);
      return { success: false, message: "Failed to delete event" };
    }
  },

  async getCategories() {
    try {
      return await makeRequest(`${API_BASE_URL}/api/events/categories/`, {
        credentials: "include",
      });
    } catch (error) {
      console.error("Get categories error:", error);
      return { success: false, categories: [] };
    }
  },

  // ============ Registrations ============

  async registerForEvent(eventId) {
    try {
      return await makeRequest(
        `${API_BASE_URL}/api/events/${eventId}/register/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCookie("csrftoken"),
          },
          credentials: "include",
        }
      );
    } catch (error) {
      console.error("Register for event error:", error);
      return { success: false, message: "Failed to register for event" };
    }
  },

  async getUserRegistrations() {
    try {
      return await makeRequest(`${API_BASE_URL}/api/registrations/`, {
        credentials: "include",
      });
    } catch (error) {
      console.error("Get user registrations error:", error);
      return { success: false, message: "Failed to fetch registrations" };
    }
  },

  async getAdminRegistrations(eventId = null) {
    try {
      const url = eventId
        ? `${API_BASE_URL}/api/admin/registrations/?event_id=${eventId}`
        : `${API_BASE_URL}/api/admin/registrations/`;

      return await makeRequest(url, {
        credentials: "include",
      });
    } catch (error) {
      console.error("Get admin registrations error:", error);
      return { success: false, message: "Failed to fetch registrations" };
    }
  },

  async updateRegistrationStatus(registrationId, status, message = "") {
    try {
      return await makeRequest(
        `${API_BASE_URL}/api/admin/registrations/${registrationId}/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCookie("csrftoken"),
          },
          credentials: "include",
          body: JSON.stringify({ status, message }),
          // Use traditional XHR explicitly for status updates (AJAX scenario 2)
          ajax: "xhr",
        }
      );
    } catch (error) {
      console.error("Update registration status error:", error);
      return {
        success: false,
        message: "Failed to update registration status",
      };
    }
  },
};

// Export for use in other files
window.API = API;
