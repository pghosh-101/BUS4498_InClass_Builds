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
  const flyerInput = document.getElementById("flyer");
  const postButton = document.getElementById("post-button");
  const result = document.getElementById("post-result");
  const resultLabel = result.querySelector(".result-label");
  const resultMessage = result.querySelector(".result-message");
  const resultReasons = result.querySelector(".reasons");
  const board = document.getElementById("event-board");
  const boardStatus = document.getElementById("board-status");
  const refreshButton = document.getElementById("refresh-button");
  const filterButtons = Array.from(document.querySelectorAll("[data-filter]"));
  const moderatorPanel = document.getElementById("moderator-panel");
  const moderatorSigninForm = document.getElementById("moderator-signin-form");
  const moderatorEmail = document.getElementById("moderator-email");
  const moderatorPassword = document.getElementById("moderator-password");
  const moderatorSigninButton = document.getElementById("moderator-signin-button");
  const moderatorStatus = document.getElementById("moderator-status");
  const moderatorContent = document.getElementById("moderator-content");
  const moderatorSignout = document.getElementById("moderator-signout");
  const waitingBoard = document.getElementById("waiting-board");
  let events = [];
  let currentFilter = "all";
  let moderatorUser = null;

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
    const flyerPrefix = `${supabaseUrl}/storage/v1/object/public/flyers/`;
    if (typeof event.flyer_url === "string" && event.flyer_url.startsWith(flyerPrefix)) {
      const flyer = document.createElement("img");
      flyer.className = "flyer";
      flyer.src = event.flyer_url;
      flyer.alt = `${event.title || "Event"} flyer`;
      flyer.loading = "lazy";
      item.appendChild(flyer);
    }
    return item;
  }

  function moderatorCard(event) {
    const item = eventCard(event);
    const review = document.createElement("div");
    review.className = "review";
    addText(review, "p", "why", event.status_reason || "This post needs moderator review.");
    addText(review, "p", "original", event.announcement || "");
    const actions = document.createElement("p");
    actions.className = "actions";
    const approve = addText(actions, "button", "", "Approve");
    approve.type = "button";
    const reject = addText(actions, "button", "ghost", "Reject");
    reject.type = "button";
    approve.addEventListener("click", function () { updateReview(event, "published", approve, reject); });
    reject.addEventListener("click", function () { updateReview(event, "rejected", approve, reject); });
    review.appendChild(actions);
    item.appendChild(review);
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
      .select("id, created_at, status, title, club, event_date, start_time, end_time, place_name, place_detail, cost, free_food, summary, flyer_url")
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

  async function loadWaiting() {
    if (!database || !moderatorUser) return;
    const response = await database
      .from("events")
      .select("id, created_at, status, status_reason, announcement, title, club, event_date, start_time, end_time, place_name, place_detail, cost, free_food, summary, flyer_url")
      .eq("status", "waiting")
      .order("created_at", { ascending: false });
    if (response.error) {
      console.error(response.error);
      setText(moderatorStatus, "The waiting posts could not be loaded.");
      waitingBoard.replaceChildren();
      addText(waitingBoard, "li", "empty", "The moderator list is temporarily unavailable.");
      return;
    }
    waitingBoard.replaceChildren();
    const waiting = Array.isArray(response.data) ? response.data : [];
    if (!waiting.length) {
      addText(waitingBoard, "li", "empty", "No posts are waiting for review.");
      return;
    }
    waiting.forEach(function (event) { waitingBoard.appendChild(moderatorCard(event)); });
  }

  async function updateReview(event, status, approve, reject) {
    if (!database || !moderatorUser) return;
    approve.disabled = true;
    reject.disabled = true;
    const response = await database.from("events").update({
      status,
      status_reason: status === "published" ? "Approved by moderator." : "Rejected by moderator.",
      reviewed_at: new Date().toISOString(),
      reviewed_by: moderatorUser.id,
    }).eq("id", event.id).eq("status", "waiting");
    if (response.error) {
      console.error(response.error);
      setText(moderatorStatus, "That review could not be saved.");
      approve.disabled = false;
      reject.disabled = false;
      return;
    }
    setText(moderatorStatus, status === "published" ? "Post approved." : "Post rejected.");
    await Promise.all([loadWaiting(), loadEvents()]);
  }

  function updateModeratorView(session) {
    moderatorUser = session && session.user ? session.user : null;
    const signedIn = Boolean(moderatorUser);
    moderatorSigninForm.hidden = signedIn;
    moderatorContent.hidden = !signedIn;
    if (signedIn) {
      moderatorPanel.open = true;
      setText(moderatorStatus, `Signed in as ${moderatorUser.email || "moderator"}.`);
      loadWaiting();
    } else {
      setText(moderatorStatus, "Sign in to review waiting posts.");
      waitingBoard.replaceChildren();
    }
  }

  async function signInModerator(event) {
    event.preventDefault();
    if (!database) return;
    moderatorSigninButton.disabled = true;
    setText(moderatorStatus, "Signing in…");
    const response = await database.auth.signInWithPassword({
      email: moderatorEmail.value.trim(),
      password: moderatorPassword.value,
    });
    moderatorSigninButton.disabled = false;
    if (response.error) {
      setText(moderatorStatus, "Sign-in failed. Check the email and password.");
      return;
    }
    moderatorPassword.value = "";
    updateModeratorView(response.data.session);
  }

  async function signOutModerator() {
    if (!database) return;
    const response = await database.auth.signOut();
    if (response.error) {
      setText(moderatorStatus, "Sign-out failed. Try again.");
      return;
    }
    updateModeratorView(null);
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
    if (flyerInput.files && flyerInput.files[0]) formData.append("flyer", flyerInput.files[0]);
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
      if (body.ok) {
        announcementInput.value = "";
        flyerInput.value = "";
      }
      if (body.status === "published") {
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
  moderatorSigninForm.addEventListener("submit", signInModerator);
  moderatorSignout.addEventListener("click", signOutModerator);
  if (database) {
    database.auth.getSession().then(function (response) { updateModeratorView(response.data.session); });
    database.auth.onAuthStateChange(function (_event, session) { updateModeratorView(session); });
  } else {
    moderatorSigninForm.hidden = true;
    setText(moderatorStatus, "Add the Supabase configuration to sign in.");
  }
  loadEvents();
})();
