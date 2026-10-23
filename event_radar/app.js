(function () {
  "use strict";

  const config = window.EVENT_RADAR_CONFIG || {};
  const supabaseUrl = config.supabaseUrl || "";
  const publishableKey = config.publishableKey || "";
  const agentUrl = supabaseUrl ? `${supabaseUrl}/functions/v1/submit-event` : "";
  const database = window.supabase && supabaseUrl && publishableKey
    ? window.supabase.createClient(supabaseUrl, publishableKey)
    : null;

  const form = document.getElementById("post-form");
  const announcementInput = document.getElementById("announcement");
  const postButton = document.getElementById("post-button");
  const result = document.getElementById("post-result");
  const resultLabel = result.querySelector(".result-label");
  const resultMessage = result.querySelector(".result-message");
  const resultReasons = result.querySelector(".reasons");
  const board = document.getElementById("event-board");
  const boardStatus = document.getElementById("board-status");
  const refreshButton = document.getElementById("refresh-button");
  const filterButtons = Array.from(document.querySelectorAll("[data-filter]"));
  let events = [];
  let currentFilter = "all";

  function setText(element, value) {
    element.textContent = value == null ? "" : String(value);
  }

  function addText(parent, tagName, className, value) {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    setText(element, value);
    parent.appendChild(element);
    return element;
  }

  function formatDate(dateValue) {
    if (!dateValue) return null;
    const date = new Date(`${dateValue}T12:00:00`);
    if (Number.isNaN(date.getTime())) return null;
    return {
      month: new Intl.DateTimeFormat("en-US", { month: "short" }).format(date),
      day: new Intl.DateTimeFormat("en-US", { day: "numeric" }).format(date),
      full: new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" }).format(date),
    };
  }

  function formatTime(timeValue) {
    if (!timeValue) return "";
    const parts = timeValue.slice(0, 5).split(":");
    if (parts.length !== 2) return timeValue;
    const hour = Number(parts[0]);
    const minute = parts[1];
    if (Number.isNaN(hour)) return timeValue;
    const suffix = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minute} ${suffix}`;
  }

  function formatWhen(event) {
    const date = formatDate(event.event_date);
    if (!date) return "Date to be announced";
    const start = formatTime(event.start_time);
    const end = formatTime(event.end_time);
    let time = start;
    if (start && end) time = `${start} to ${end}`;
    else if (!start) time = "Time to be announced";
    return `${date.full} · ${time}`;
  }

  function setResult(status, label, message, reasons) {
    result.hidden = false;
    result.className = `result ${status}`;
    setText(resultLabel, label);
    setText(resultMessage, message);
    resultReasons.replaceChildren();
    (Array.isArray(reasons) ? reasons : []).forEach(function (reason) {
      addText(resultReasons, "li", "", reason);
    });
  }

  function showLoadingState() {
    board.replaceChildren();
    addText(board, "li", "empty", "Loading events…");
  }

  function eventCard(event) {
    const item = document.createElement("li");
    item.className = "event";

    const date = formatDate(event.event_date);
    const dateBox = document.createElement("div");
    dateBox.className = date ? "date" : "date tba";
    if (date) {
      addText(dateBox, "span", "mon", date.month);
      addText(dateBox, "span", "day", date.day);
    } else {
      addText(dateBox, "span", "day", "TBA");
    }
    item.appendChild(dateBox);

    const body = document.createElement("div");
    body.className = "event-body";
    addText(body, "p", "when", formatWhen(event));
    addText(body, "h3", "", event.title || "Untitled event");
    const meta = [event.club, event.place_name].filter(Boolean).join(" · ");
    addText(body, "p", "meta", meta || "Campus event");
    addText(body, "p", "summary", event.summary || "Details coming soon.");

    const tags = document.createElement("p");
    tags.className = "tags";
    if (event.cost) addText(tags, "span", "tag", event.cost);
    if (event.free_food) addText(tags, "span", "tag food", "🍕 Free food");
    body.appendChild(tags);
    item.appendChild(body);
    return item;
  }

  function renderEvents() {
    board.replaceChildren();
    const visibleEvents = currentFilter === "food"
      ? events.filter(function (event) { return event.free_food === true; })
      : events;
    if (!visibleEvents.length) {
      addText(board, "li", "empty", events.length ? "No events match this filter." : "No events yet. Post the first one!");
      return;
    }
    visibleEvents.forEach(function (event) {
      board.appendChild(eventCard(event));
    });
  }

  async function loadEvents() {
    if (!database) {
      setText(boardStatus, "Add the Supabase configuration to load events.");
      board.replaceChildren();
      addText(board, "li", "empty", "The event board is not configured yet.");
      return;
    }
    showLoadingState();
    setText(boardStatus, "Loading events…");
    const response = await database
      .from("events")
      .select("id, created_at, status, title, club, event_date, start_time, end_time, place_name, place_detail, cost, free_food, summary")
      .eq("status", "published")
      .order("event_date", { ascending: true, nullsFirst: false })
      .order("start_time", { ascending: true, nullsFirst: false });
    if (response.error) {
      console.error(response.error);
      events = [];
      setText(boardStatus, "The events could not be loaded.");
      board.replaceChildren();
      addText(board, "li", "empty", "The event board is temporarily unavailable.");
      return;
    }
    events = Array.isArray(response.data) ? response.data : [];
    setText(boardStatus, `${events.length} published event${events.length === 1 ? "" : "s"}`);
    renderEvents();
  }

  async function submitAnnouncement(event) {
    event.preventDefault();
    if (!agentUrl || !publishableKey) {
      setResult("error", "Not configured", "The event agent is not configured yet.", []);
      return;
    }
    postButton.disabled = true;
    setResult("waiting", "Working…", "The event agent is reading the announcement.", []);
    const formData = new FormData();
    formData.append("announcement", announcementInput.value.trim());
    try {
      const response = await fetch(agentUrl, {
        method: "POST",
        headers: { apikey: publishableKey },
        body: formData,
      });
      const body = await response.json().catch(function () { return {}; });
      if (!response.ok || body.ok === false) {
        setResult("error", "Could not post", body.message || "The event agent returned an error.", body.reasons);
        return;
      }
      const labels = {
        published: "Published",
        waiting: "Waiting for review",
        rejected: "Not posted",
        duplicate: "Already posted",
      };
      const status = labels[body.status] ? body.status : "error";
      setResult(status, labels[body.status] || "Response", body.message || "The agent responded.", body.reasons);
      if (body.status === "published") {
        announcementInput.value = "";
        await loadEvents();
      }
    } catch (error) {
      console.error(error);
      setResult("error", "Connection error", "The event agent could not be reached. Check your connection and try again.", []);
    } finally {
      postButton.disabled = false;
    }
  }

  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      currentFilter = button.dataset.filter || "all";
      filterButtons.forEach(function (otherButton) {
        otherButton.setAttribute("aria-pressed", String(otherButton === button));
      });
      renderEvents();
    });
  });

  form.addEventListener("submit", submitAnnouncement);
  refreshButton.addEventListener("click", loadEvents);
  loadEvents();
})();
