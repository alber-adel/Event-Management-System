// import events from "./eventSample.js";

// Function to store events in local storage
export function storeEvents() {
  if (!localStorage.getItem("events")) {
    localStorage.setItem("events", JSON.stringify(events));
  }
}

export function getEvents() {
  const eventsData = localStorage.getItem("events");
  return eventsData ? JSON.parse(eventsData) : [];
}

// New registrations map: { [eventId]: [userIds] }
const REG_KEY = "eventRegistrations";

export function getAllRegistrations() {
  try {
    return JSON.parse(localStorage.getItem(REG_KEY)) || {};
  } catch {
    return {};
  }
}

export function getEventRegistrations(eventId) {
  const map = getAllRegistrations();
  return map[String(eventId)] || [];
}

export function registerUserForEvent(eventId, userId) {
  const map = getAllRegistrations();
  const key = String(eventId);
  const list = map[key] || [];
  if (!list.includes(userId)) {
    list.push(userId);
    map[key] = list;
    localStorage.setItem(REG_KEY, JSON.stringify(map));
  }
  return map[key];
}
