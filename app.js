/** Everything specific to one home lives in config.js; config.example.js documents each key. */
const CONFIG = window.PANEL_CONFIG || {};

const WEATHER = CONFIG.weather || null;
const ROOM_TEMP = CONFIG.room?.temperature || null;
const ROOM_HUM = CONFIG.room?.humidity || null;
const CALENDARS = CONFIG.calendars || [];
const TODO_LISTS = CONFIG.todoLists || [];
const TODO_SKIP = CONFIG.todoSkip || [];
const LOCALE = CONFIG.locale || navigator.language || "en-US";
const AGENDA_DAYS = CONFIG.agendaDays || 7;
const LIGHTS = CONFIG.lights || [];
const COVERS = CONFIG.covers || [];
const SCENE = CONFIG.scene || null;
/** Home Assistant asks Google only every 15 to 30 minutes on its own, so the panel nudges it. */
const GOOGLE_REFRESH_MS = 5 * 60 * 1000;
/** Ticked-off tasks stay in the column this long; with nothing open, the column then goes away. */
const DONE_VISIBLE_MS = 6 * 60 * 60 * 1000;
/** A tap that Home Assistant has not confirmed yet wins over the server state for this long. */
const PENDING_TAP_MS = 60 * 1000;
/** Pressed feedback waits this long, so a finger that starts a swipe never squeezes a tile. */
const PRESS_DELAY_MS = 90;
/** After a manual scroll the agenda waits this long, then glides back to the now line. */
const AGENDA_HOLD_MS = 45 * 1000;
/** The panel reloads itself when a deploy changes these files. */
const UPDATE_FILES = ["index.html", "app.js", "styles.css"];
const UPDATE_CHECK_MS = 2 * 60 * 1000;
const IDLE_BEFORE_RELOAD_MS = 20 * 1000;

const LIGHT_IDS = LIGHTS.flatMap((l) => [l.id, ...(l.members || []).map((m) => m.id)]);
const COVER_IDS = COVERS.flatMap((c) => c.members.map((m) => m.id));
const STRIP_IDS = new Set([...LIGHT_IDS, ...COVER_IDS, ...(SCENE?.welcome || []), ...(SCENE?.goodbye || [])]);

/** Panel text per language. The locale's language picks one; anything else falls back to English. */
const TEXT = {
  en: {
    title: "Home",
    calendar: "Calendar",
    tasks: "Tasks",
    strip: "Lights and shutters",
    indoor: (t) => `Inside ${t}°`,
    today: "Today",
    tomorrow: (weekday) => `Tomorrow, ${weekday}`,
    nothingElse: "Nothing else planned.",
    nothing: "Nothing planned.",
    noEvents: (days) => `No events in the next ${days} days.`,
    noCalendar: "No calendar found in Home Assistant.",
    calendarError: "Events can't be loaded right now.",
    untitled: "Untitled",
    now: "now",
    nowOn: "now on",
    inMinutes: (m) => `in ${m} min`,
    inHours: (h, m) => (m ? `in ${h} h ${m} min` : `in ${h} h`),
    until: (time) => `until ${time}`,
    overdue: (days) => `${days} days overdue`,
    yesterday: "since yesterday",
    dueToday: "today",
    dueTomorrow: "tomorrow",
    open: (n) => `${n} open`,
    allDone: "all done",
    on: "On",
    off: "Off",
    offline: "Offline",
    opening: "Opening …",
    closing: "Closing …",
    coverOpen: "Open",
    coverClosed: "Closed",
    coverPartly: (p) => `${p} % closed`,
    welcome: "Welcome",
    welcomeHint: "Shutters up, lights on",
    goodbye: "Goodbye",
    goodbyeHint: "All closed & off",
    expand: "Show each",
    conditions: {
      "clear-night": "Clear",
      clear: "Clear",
      cloudy: "Cloudy",
      exceptional: "Extreme",
      fog: "Fog",
      hail: "Hail",
      lightning: "Thunderstorm",
      "lightning-rainy": "Thunderstorm",
      partlycloudy: "Partly cloudy",
      pouring: "Heavy rain",
      rainy: "Rain",
      snowy: "Snow",
      "snowy-rainy": "Sleet",
      sunny: "Sunny",
      windy: "Windy",
      "windy-variant": "Windy",
    },
  },
  de: {
    title: "Zuhause",
    calendar: "Termine",
    tasks: "Aufgaben",
    strip: "Licht und Rollos",
    indoor: (t) => `Innen ${t}°`,
    today: "Heute",
    tomorrow: (weekday) => `Morgen, ${weekday}`,
    nothingElse: "Sonst nichts geplant.",
    nothing: "Nichts geplant.",
    noEvents: (days) => `Keine Termine in den nächsten ${days} Tagen.`,
    noCalendar: "Kein Kalender in Home Assistant gefunden.",
    calendarError: "Termine lassen sich gerade nicht laden.",
    untitled: "Ohne Titel",
    now: "jetzt",
    nowOn: "läuft",
    inMinutes: (m) => `in ${m} Min.`,
    inHours: (h, m) => (m ? `in ${h} Std. ${m} Min.` : `in ${h} Std.`),
    until: (time) => `bis ${time}`,
    overdue: (days) => `seit ${days} Tagen`,
    yesterday: "seit gestern",
    dueToday: "heute",
    dueTomorrow: "morgen",
    open: (n) => `${n} offen`,
    allDone: "alles erledigt",
    on: "An",
    off: "Aus",
    offline: "Offline",
    opening: "Öffnet …",
    closing: "Schließt …",
    coverOpen: "Offen",
    coverClosed: "Zu",
    coverPartly: (p) => `${p} % zu`,
    welcome: "Willkommen",
    welcomeHint: "Rollos auf, Licht an",
    goodbye: "Tschüss",
    goodbyeHint: "Alles zu & aus",
    expand: "Einzeln",
    conditions: {
      "clear-night": "Klar",
      clear: "Klar",
      cloudy: "Bewölkt",
      exceptional: "Extrem",
      fog: "Nebel",
      hail: "Hagel",
      lightning: "Gewitter",
      "lightning-rainy": "Gewitter",
      partlycloudy: "Teilweise bewölkt",
      pouring: "Starkregen",
      rainy: "Regen",
      snowy: "Schnee",
      "snowy-rainy": "Schneeregen",
      sunny: "Sonnig",
      windy: "Windig",
      "windy-variant": "Windig",
    },
  },
};
const LANG = LOCALE.slice(0, 2) in TEXT ? LOCALE.slice(0, 2) : "en";
const T = TEXT[LANG];

const svg = (cls, body, stroke = 1.7) =>
  `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;

const BULB = svg("ico", '<path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/>');
const SHUTTER = svg("ico", '<rect x="3" y="3" width="18" height="18" rx="2.5"/><path d="M3 8h18M3 12h18M3 16h18"/>', 1.6);
const HI = svg("ico hi", '<path d="M15 21h4a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1h-4"/><path d="M10 8l-4 4 4 4"/><path d="M15 12H6"/>', 1.8);
const BYE = svg("ico bye", '<path d="M9 21H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h4"/><path d="M14 16l4-4-4-4"/><path d="M9 12h9"/>', 1.8);
const CHEVRON = svg("", '<path d="M6 9l6 6 6-6"/>', 2.4);
const CHECK = svg("", '<path d="M5 12.5l4.5 4.5L19 7.5"/>', 3.2);

const NEXT_ICON = {
  open_cover: svg("", '<path d="M12 19V5"/><path d="M5.5 11.5L12 5l6.5 6.5"/>', 2.2),
  close_cover: svg("", '<path d="M12 5v14"/><path d="M18.5 12.5L12 19l-6.5-6.5"/>', 2.2),
  stop_cover: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="2.5" fill="currentColor"/></svg>',
};

const state = {};
const lastAction = {};
const pending = new Map();
let ws;
let msgId = 1;
let expandedKey = null;

const strip = document.getElementById("strip");
const agendaEl = document.getElementById("agenda");
const tasksEl = document.getElementById("tasks");

function pad(n) {
  return String(n).padStart(2, "0");
}

function esc(text) {
  return String(text ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

function startOfDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function addDays(d, n) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
}

/** Reads "2026-11-09" as local midnight; new Date() would read it as UTC. */
function parseDay(text) {
  const [y, m, d] = text.slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d);
}

function dayDiff(from, to) {
  return Math.round((startOfDay(to) - startOfDay(from)) / 86400000);
}

function hhmm(d) {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Sets text and replays a short fade only when the value actually changed. */
function setText(el, text) {
  if (el.textContent === text) return;
  el.textContent = text;
  el.classList.remove("swap");
  void el.offsetWidth;
  el.classList.add("swap");
}

/** Fades a list's top or bottom edge only while content hides behind it. */
function updateFade(el) {
  const max = el.scrollHeight - el.clientHeight;
  el.classList.toggle("more-start", el.scrollTop > 2);
  el.classList.toggle("more-end", el.scrollTop < max - 2);
}

function haptic(kind) {
  if (window.Haptics) window.Haptics.play(kind);
  else if (navigator.vibrate) navigator.vibrate(kind === "heavy" ? [70, 45, 90] : 80);
}

let lastMinute = -1;

function tickClock() {
  const now = new Date();
  document.getElementById("time").textContent = hhmm(now);
  document.getElementById("date").textContent = now.toLocaleDateString(LOCALE, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  if (now.getMinutes() !== lastMinute) {
    lastMinute = now.getMinutes();
    renderAgenda();
    renderTasks();
  }
}

function preparePage() {
  document.documentElement.lang = LANG;
  document.title = T.title;
  agendaEl.setAttribute("aria-label", T.calendar);
  tasksEl.setAttribute("aria-label", T.tasks);
  strip.setAttribute("aria-label", T.strip);
  document.querySelector(".weather-temp").hidden = !WEATHER;
  document.getElementById("condition").hidden = !WEATHER;
  document.getElementById("room").hidden = !ROOM_TEMP;
}

function renderWeather() {
  const w = state[WEATHER];
  if (w) {
    const t = w.attributes?.temperature;
    document.getElementById("temp").textContent = typeof t === "number" ? Math.round(t) : "—";
    document.getElementById("condition").textContent = T.conditions[w.state] || w.state || "—";
  }
  const rt = state[ROOM_TEMP];
  const rh = state[ROOM_HUM];
  if (rt) {
    const bits = [T.indoor(Number(rt.state).toLocaleString(LOCALE, { minimumFractionDigits: 1, maximumFractionDigits: 1 }))];
    if (rh) bits.push(`${Number(rh.state).toFixed(0)} %`);
    document.getElementById("room").textContent = bits.join(" · ");
  }
}

function isOn(id) {
  return state[id]?.state === "on";
}

function coverPosition(id) {
  const s = state[id];
  const pos = s?.attributes?.current_position;
  if (typeof pos === "number" && pos >= 0 && pos <= 100) return pos;
  if (s?.state === "closed") return 0;
  return null;
}

/** Percent the shutter is down. No reading means fully down, not fully up. */
function downReading(id) {
  const open = coverPosition(id);
  if (open !== null) return 100 - open;
  return isMoving(id) ? null : 100;
}

function isMoving(id) {
  const s = state[id]?.state;
  return s === "opening" || s === "closing";
}

// A shutter without a position reading alternates by its last command.
function nextAction(ids) {
  if (ids.some(isMoving)) return "stop_cover";
  const positions = ids.map(coverPosition);
  if (positions.every((p) => p === 0)) return "open_cover";
  if (positions.every((p) => p === 100)) return "close_cover";
  return lastAction[ids[0]] === "open_cover" ? "close_cover" : "open_cover";
}

/** Average closed share of a set of shutters, or null when none reports one. */
function averageDown(ids) {
  const known = ids.map(downReading).filter((p) => p !== null);
  return known.length ? Math.round(known.reduce((sum, p) => sum + p, 0) / known.length) : null;
}

function expandButton(key) {
  return `<button type="button" class="expand" data-expand="${key}" aria-label="${T.expand}">${CHEVRON}</button>`;
}

function lightTile(item, i, groupKey) {
  return `<div class="dev light${groupKey ? " member" : ""}" data-light="${item.id}"${groupKey ? ` data-of="${groupKey}"` : ""} style="--i:${i}">
    <span class="glow"></span>
    ${BULB}
    ${item.members ? expandButton(item.id) : ""}
    <span class="label"><span class="name">${esc(item.title)}</span><span class="state"></span></span>
  </div>`;
}

function coverTile(ids, title, i, groupKey, expandKey) {
  return `<div class="dev cover${groupKey ? " member" : ""}" data-covers="${ids.join(" ")}"${groupKey ? ` data-of="${groupKey}"` : ""} style="--i:${i}">
    <span class="slats"></span>
    ${SHUTTER}
    ${expandKey ? expandButton(expandKey) : ""}
    <span class="label"><span class="name">${esc(title)}</span><span class="state"></span></span>
    <span class="action"></span>
  </div>`;
}

function buildStrip() {
  let i = 0;
  const tiles = [];
  if (SCENE) {
    tiles.push(`<div class="dev scene" id="scene" style="--i:${i++}">
      ${HI}${BYE}
      <span class="label"><span class="name"></span><span class="state"></span></span>
    </div>`);
  }
  for (const light of LIGHTS) {
    tiles.push(lightTile(light, i++));
    for (const member of light.members || []) tiles.push(lightTile(member, 0, light.id));
  }
  for (const cover of COVERS) {
    const grouped = cover.members.length > 1;
    tiles.push(coverTile(cover.members.map((m) => m.id), cover.title, i++, null, grouped ? cover.key : null));
    if (grouped) {
      for (const member of cover.members) tiles.push(coverTile([member.id], member.title, 0, cover.key, null));
    }
  }
  strip.innerHTML = tiles.join("");
  strip.hidden = !tiles.length;
}

function setNext(el, action) {
  const slot = el.querySelector(".action");
  if (slot.dataset.action === action) return;
  slot.dataset.action = action;
  slot.innerHTML = NEXT_ICON[action];
}

function paintCover(el, ids) {
  const travel = ids.map((id) => state[id]?.state);
  const opening = travel.includes("opening");
  const closing = travel.includes("closing");
  const down = averageDown(ids);
  let label = "—";
  if (opening) label = T.opening;
  else if (closing) label = T.closing;
  else if (travel.every((s) => s === "unavailable")) label = T.offline;
  else if (down !== null) label = down <= 0 ? T.coverOpen : down >= 100 ? T.coverClosed : T.coverPartly(down);
  el.classList.toggle("moving", opening || closing);
  el.classList.toggle("opening", opening);
  el.classList.toggle("closing", closing);
  el.querySelector(".slats").style.height = down === null ? "0%" : `${down}%`;
  setText(el.querySelector(".state"), label);
  setNext(el, nextAction(ids));
}

/** The colour a colour light is showing, or null for white or colour-temperature light. */
function lightColor(entity) {
  const a = entity?.attributes;
  if (!a || !Array.isArray(a.rgb_color) || !["rgb", "rgbw", "rgbww", "hs", "xy"].includes(a.color_mode)) return null;
  return a.rgb_color;
}

function updateLights() {
  for (const el of strip.querySelectorAll("[data-light]")) {
    const id = el.dataset.light;
    const s = state[id]?.state;
    el.classList.toggle("on", s === "on");
    // A colour light glows in its own colour; the icon gets a lighter shade so it stays readable.
    const rgb = s === "on" ? lightColor(state[id]) : null;
    el.classList.toggle("tinted", !!rgb);
    if (rgb) {
      el.style.setProperty("--tint", rgb.join(", "));
      el.style.setProperty("--tint-soft", rgb.map((c) => Math.round(c + (255 - c) * 0.45)).join(", "));
    }
    setText(el.querySelector(".state"), s === "on" ? T.on : s === "unavailable" ? T.offline : s ? T.off : "—");
  }
}

function updateCovers() {
  for (const el of strip.querySelectorAll("[data-covers]")) paintCover(el, el.dataset.covers.split(" "));
}

function updateExpanded() {
  for (const el of strip.querySelectorAll("[data-of]")) el.classList.toggle("shown", el.dataset.of === expandedKey);
  for (const el of strip.querySelectorAll("[data-expand]")) el.classList.toggle("open", el.dataset.expand === expandedKey);
}

function refresh() {
  updateLights();
  updateCovers();
  updateScene();
}

const GLIDE_MS = 440;
let glide = 0;

/**
 * Scrolls the strip while members are still growing. A smooth scrollTo would stop
 * at the old, narrower end, so each frame re-applies the eased position.
 */
function glideTo(target) {
  const from = strip.scrollLeft;
  const start = performance.now();
  const run = ++glide;
  const step = (t) => {
    if (run !== glide) return;
    const p = Math.min(1, (t - start) / GLIDE_MS);
    strip.scrollLeft = from + (target - from) * (1 - Math.pow(1 - p, 3));
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function toggleGroup(key, tile) {
  expandedKey = expandedKey === key ? null : key;
  updateExpanded();
  if (expandedKey) {
    const pad = parseFloat(getComputedStyle(strip).paddingLeft) || 0;
    glideTo(tile.offsetLeft - pad);
  }
}

function send(msg, onResult, onEvent) {
  if (!ws || ws.readyState !== WebSocket.OPEN) return false;
  const id = msgId++;
  if (onResult || onEvent) pending.set(id, { onResult, onEvent });
  ws.send(JSON.stringify({ ...msg, id }));
  return true;
}

function callService(domain, service, entity_id, service_data) {
  send({ type: "call_service", domain, service, target: { entity_id }, service_data });
}

function houseAway() {
  if ((SCENE.goodbye || []).some(isOn)) return false;
  return COVER_IDS.every((id) => !isMoving(id) && downReading(id) >= 100);
}

function updateScene() {
  const tile = document.getElementById("scene");
  if (!tile) return;
  const welcome = houseAway();
  tile.classList.toggle("welcome", welcome);
  tile.classList.toggle("goodbye", !welcome);
  setText(tile.querySelector(".name"), welcome ? T.welcome : T.goodbye);
  setText(tile.querySelector(".state"), welcome ? T.welcomeHint : T.goodbyeHint);
}

/** Shows the new state at once; Home Assistant confirms it through state_changed. */
function switchEntity(id, on) {
  if (state[id]) state[id] = { ...state[id], state: on ? "on" : "off" };
  callService(id.split(".")[0], on ? "turn_on" : "turn_off", id);
}

/** Welcome opens every shutter and turns scene.welcome on. Goodbye closes them and turns scene.goodbye off. */
function setScene(welcome) {
  for (const id of (welcome ? SCENE.welcome : SCENE.goodbye) || []) switchEntity(id, welcome);
  for (const id of COVER_IDS) runCover(id, welcome ? "open_cover" : "close_cover");
  updateLights();
  updateScene();
}

function toggleLight(id) {
  switchEntity(id, !isOn(id));
  updateLights();
}

function runCover(id, action) {
  if (action !== "stop_cover") lastAction[id] = action;
  callService("cover", action, id);
}

function tapCovers(ids) {
  const action = nextAction(ids);
  for (const id of ids) runCover(id, action);
}

let calendar = { status: "loading", events: [] };
let calendarTimer = null;

function calendarIds() {
  return CALENDARS.length ? CALENDARS.map((c) => c.id) : Object.keys(state).filter((id) => id.startsWith("calendar."));
}

function badges(owners, small = false) {
  if (!owners.length) return "";
  const marks = owners.map(
    (o) => `<span class="badge" style="--who:${o.color};--who-bg:${o.color}2e" aria-label="${o.name}">${o.initial}</span>`
  );
  return `<span class="who${small ? " small" : ""}">${marks.join("")}</span>`;
}

const FULL_DAY_MS = (24 * 60 - 1) * 60000;

function toEvent(raw, owner) {
  const dated = !String(raw.start).includes("T");
  const start = dated ? parseDay(raw.start) : new Date(raw.start);
  let end = dated ? parseDay(raw.end) : new Date(raw.end);
  // "00:00 to 23:59" is how some people enter a whole day; show it like an all-day event.
  const wholeDay = !dated && start.getHours() === 0 && start.getMinutes() === 0 && end - start >= FULL_DAY_MS;
  if (wholeDay) end = addDays(startOfDay(new Date(end.getTime() - 1)), 1);
  return {
    title: raw.summary || T.untitled,
    place: String(raw.location || "").split(/[,\n]/)[0].trim(),
    allDay: dated || wholeDay,
    start,
    end,
    owners: owner ? [owner] : [],
  };
}

function loadCalendar() {
  const ids = calendarIds();
  if (!ids.length) {
    calendar = { status: "missing", events: [] };
    renderAgenda();
    return;
  }
  const from = startOfDay(new Date());
  send(
    {
      type: "call_service",
      domain: "calendar",
      service: "get_events",
      target: { entity_id: ids },
      service_data: { start_date_time: from.toISOString(), end_date_time: addDays(from, AGENDA_DAYS).toISOString() },
      return_response: true,
    },
    (msg) => {
      if (!msg.success) {
        calendar = { status: calendar.events.length ? "ok" : "error", events: calendar.events };
      } else {
        const response = msg.result?.response || {};
        const byKey = new Map();
        for (const [id, cal] of Object.entries(response)) {
          for (const raw of cal.events || []) {
            const e = toEvent(raw, CALENDARS.find((c) => c.id === id));
            // An event both people are invited to comes back once per calendar: keep one, mark both.
            const key = `${e.title}|${e.start.getTime()}|${e.end.getTime()}`;
            const twin = byKey.get(key);
            if (!twin) byKey.set(key, e);
            else for (const o of e.owners) if (!twin.owners.includes(o)) twin.owners.push(o);
          }
        }
        const order = (o) => CALENDARS.indexOf(o);
        const events = [...byKey.values()];
        for (const e of events) e.owners.sort((a, b) => order(a) - order(b));
        events.sort((a, b) => a.start - b.start);
        calendar = { status: "ok", events };
      }
      renderAgenda();
    }
  );
}

/** Coalesces the bursts of calendar state changes Home Assistant sends at event boundaries. */
function scheduleCalendar(delay = 1500) {
  clearTimeout(calendarTimer);
  calendarTimer = setTimeout(loadCalendar, delay);
}

function dayTitle(day, today) {
  const diff = dayDiff(today, day);
  if (diff === 0) return T.today;
  if (diff === 1) return T.tomorrow(day.toLocaleDateString(LOCALE, { weekday: "long" }));
  return day.toLocaleDateString(LOCALE, { weekday: "long", day: "numeric", month: "short" });
}

function untilText(start, now) {
  const minutes = Math.round((start - now) / 60000);
  if (minutes < 1) return T.now;
  if (minutes < 60) return T.inMinutes(minutes);
  if (minutes < 180) return T.inHours(Math.floor(minutes / 60), minutes % 60);
  return "";
}

function eventRow(e, day, now, isNext) {
  const startsToday = e.start >= day;
  const past = e.end <= now;
  const bits = [];
  if (isNext || !startsToday) bits.push(T.until(hhmm(e.end)));
  if (!isNext && e.place) bits.push(esc(e.place));
  const until = isNext && (e.start <= now ? T.nowOn : untilText(e.start, now));
  if (until) bits.push(`<span class="soon">${until}</span>`);
  const sub = bits.length ? `<span class="sub">${bits.join(" · ")}</span>` : "";
  const cls = isNext ? " next" : past ? " past" : "";
  return `<li class="ev${cls}"><span class="t">${startsToday ? hhmm(e.start) : ""}</span><span class="what"><span class="title">${esc(e.title)}</span>${sub}</span>${badges(e.owners)}</li>`;
}

let agendaHoldUntil = 0;
let agendaRecenter = 0;
let agendaPlaced = false;

/**
 * Keeps the now line in the middle of the agenda as the day goes on: what is over sits above it,
 * what comes next below. Once today's last appointment is past, tomorrow fills the lower half.
 */
function centerNow() {
  if (Date.now() < agendaHoldUntil) return;
  const line = agendaEl.querySelector(".now");
  if (!line) return;
  const max = agendaEl.scrollHeight - agendaEl.clientHeight;
  const target = Math.round(Math.max(0, Math.min(max, line.offsetTop + line.offsetHeight / 2 - agendaEl.clientHeight / 2)));
  if (Math.abs(agendaEl.scrollTop - target) < 3) return;
  agendaEl.scrollTo({ top: target, behavior: agendaPlaced ? "smooth" : "auto" });
  agendaPlaced = true;
}

function holdAgenda() {
  agendaHoldUntil = Date.now() + AGENDA_HOLD_MS;
  clearTimeout(agendaRecenter);
  agendaRecenter = setTimeout(centerNow, AGENDA_HOLD_MS + 200);
}

function renderAgenda() {
  const { status, events } = calendar;
  if (status === "loading") {
    agendaEl.innerHTML = "";
    return;
  }
  if (status === "missing" || status === "error") {
    agendaEl.innerHTML = `<h2 class="head">${T.calendar}</h2><p class="empty">${status === "missing" ? T.noCalendar : T.calendarError}</p>`;
    updateFade(agendaEl);
    return;
  }
  const now = new Date();
  const today = startOfDay(now);
  const next = events.find((e) => !e.allDay && e.end > now && e.start < addDays(today, 1));
  const days = [];
  for (let d = 0; d < AGENDA_DAYS; d++) {
    const day = addDays(today, d);
    const dayEnd = addDays(day, 1);
    const allDay = events.filter((e) => e.allDay && e.start < dayEnd && e.end > day);
    const timed = events.filter((e) => !e.allDay && (d === 0 ? e.start < dayEnd && e.end > day : e.start >= day && e.start < dayEnd));
    if (d > 0 && !allDay.length && !timed.length) continue;
    const chips = allDay.length
      ? `<span class="chips">${allDay.map((e) => `<span class="chip">${badges(e.owners, true)}<span class="chip-text">${esc(e.title)}</span></span>`).join("")}</span>`
      : "";
    const rowList = timed.map((e) => eventRow(e, day, now, e === next));
    if (d === 0) {
      const upcoming = timed.findIndex((e) => e.start > now);
      const nowRow = `<li class="now" aria-label="${T.now}"><span class="t">${hhmm(now)}</span><span class="rule"></span></li>`;
      rowList.splice(upcoming === -1 ? rowList.length : upcoming, 0, nowRow);
    }
    const rows = rowList.join("");
    const quiet = d === 0 && !timed.length ? `<p class="empty">${allDay.length ? T.nothingElse : T.nothing}</p>` : "";
    days.push(`<div class="day"><h2 class="head"><span>${dayTitle(day, today)}</span>${chips}</h2>${quiet}<ul>${rows}</ul></div>`);
  }
  if (days.length === 1 && !events.length) {
    days[0] = `<div class="day"><h2 class="head">${T.today}</h2><p class="empty">${T.noEvents(AGENDA_DAYS)}</p></div>`;
  }
  agendaEl.innerHTML = days.join("");
  centerNow();
  updateFade(agendaEl);
}

const todoItems = {};
const todoSubscribed = new Set();
/** Taps not yet confirmed by Home Assistant, and when they happened. */
const taps = new Map();

function todoIds() {
  if (TODO_LISTS.length) return TODO_LISTS;
  return Object.keys(state).filter((id) => id.startsWith("todo.") && !TODO_SKIP.includes(id));
}

function subscribeTodos() {
  for (const id of todoIds()) {
    if (todoSubscribed.has(id)) continue;
    const sent = send({ type: "todo/item/subscribe", entity_id: id }, null, (event) => {
      todoItems[id] = event.items || [];
      renderTasks();
    });
    if (sent) todoSubscribed.add(id);
  }
}

function dueLabel(due) {
  if (!due) return null;
  const diff = dayDiff(new Date(), parseDay(due));
  if (diff < -1) return { text: T.overdue(-diff), cls: "over" };
  if (diff === -1) return { text: T.yesterday, cls: "over" };
  if (diff === 0) return { text: T.dueToday, cls: "today" };
  if (diff === 1) return { text: T.dueTomorrow, cls: "" };
  return { text: parseDay(due).toLocaleDateString(LOCALE, { weekday: "short", day: "numeric", month: "short" }), cls: "" };
}

function taskStatus(item) {
  const tap = taps.get(item.uid);
  if (tap && tap.status !== item.status && Date.now() - tap.at < PENDING_TAP_MS) return tap.status;
  return item.status;
}

/** When the task was ticked off: Google's timestamp, or the local tap if Google has none. */
function completedAt(item) {
  if (item.completed) return new Date(item.completed).getTime();
  const tap = taps.get(item.uid);
  return tap && tap.status === "completed" ? tap.at : 0;
}

/** The column only exists while something is open or was ticked off in the last hours. */
function showTasks(visible) {
  const top = tasksEl.parentElement;
  if (top.classList.contains("no-tasks") !== visible) return;
  top.classList.toggle("no-tasks", !visible);
  centerNow();
  updateFade(agendaEl);
}

function renderTasks() {
  const now = Date.now();
  for (const [uid, tap] of taps) if (now - tap.at > DONE_VISIBLE_MS) taps.delete(uid);
  const items = todoIds().flatMap((list) =>
    (todoItems[list] || []).map((item, order) => ({ ...item, list, order, status: taskStatus(item), doneAt: completedAt(item) }))
  );
  const open = items.filter((t) => t.status === "needs_action");
  const done = items.filter((t) => t.status === "completed" && now - t.doneAt < DONE_VISIBLE_MS);
  showTasks(open.length + done.length > 0);
  if (!open.length && !done.length) {
    tasksEl.innerHTML = "";
    return;
  }
  open.sort((a, b) => {
    if (!a.due !== !b.due) return a.due ? -1 : 1;
    if (a.due && b.due && a.due !== b.due) return a.due < b.due ? -1 : 1;
    return a.order - b.order;
  });
  done.sort((a, b) => b.doneAt - a.doneAt);
  const rows = [...open, ...done].map((t) => {
    const finished = t.status === "completed";
    const due = finished ? null : dueLabel(t.due);
    return `<li class="task${finished ? " done" : ""}" data-task="${esc(t.uid)}" data-list="${t.list}">
      <span class="box">${CHECK}</span>
      <span><span class="what">${esc(t.summary)}</span>${due ? `<span class="due ${due.cls}">${due.text}</span>` : ""}</span>
    </li>`;
  });
  const aside = open.length ? T.open(open.length) : T.allDone;
  tasksEl.innerHTML = `<h2 class="head"><span>${T.tasks}</span><span class="aside">${aside}</span></h2><ul>${rows.join("")}</ul>`;
  updateFade(tasksEl);
}

/** Ticks a task off or back on at once; Home Assistant confirms through the subscription. */
function toggleTask(list, uid) {
  const item = (todoItems[list] || []).find((i) => i.uid === uid);
  if (!item) return;
  const next = taskStatus(item) === "completed" ? "needs_action" : "completed";
  taps.set(uid, { status: next, at: Date.now() });
  renderTasks();
  callService("todo", "update_item", list, { item: uid, status: next });
}

/** Asks Home Assistant to fetch Google now, so new tasks and events appear within minutes. */
function refreshGoogle() {
  const ids = [...calendarIds(), ...todoIds()].filter((id) => state[id]);
  if (!ids.length) return;
  send({ type: "call_service", domain: "homeassistant", service: "update_entity", target: { entity_id: ids } }, () => scheduleCalendar(3000));
}

function onStateChanged(event) {
  const n = event.data.new_state;
  const id = event.data.entity_id;
  if (!n) {
    delete state[id];
    return;
  }
  state[id] = n;
  if ([WEATHER, ROOM_TEMP, ROOM_HUM].includes(id)) renderWeather();
  if (STRIP_IDS.has(id)) refresh();
  if (id.startsWith("calendar.") && calendarIds().includes(id)) scheduleCalendar();
  if (id.startsWith("todo.") && !todoSubscribed.has(id)) subscribeTodos();
}

/**
 * The panel signs in through Home Assistant's own login page, the way its frontend does, because
 * everything under /local/ is served without authentication and must not hold a token.
 * The session lives in this device's storage.
 */
const AUTH_KEY = "panel-auth";
const AUTH_STATE_KEY = "panel-auth-state";
const CLIENT_ID = `${location.origin}/`;
const REDIRECT_URI = location.origin + location.pathname;

function storedAuth() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_KEY));
  } catch {
    return null;
  }
}

function storeAuth(auth) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
}

function authFrom(token, refresh) {
  return { access: token.access_token, refresh, expires: Date.now() + token.expires_in * 1000 };
}

/** Resolves to null when Home Assistant rejects the code or refresh token. */
async function requestToken(params) {
  const res = await fetch("/auth/token", { method: "POST", body: new URLSearchParams({ client_id: CLIENT_ID, ...params }) });
  if (res.status === 400 || res.status === 403) return null;
  if (!res.ok) throw new Error(`auth/token: ${res.status}`);
  return res.json();
}

function signIn() {
  const state = Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, "0")).join("");
  sessionStorage.setItem(AUTH_STATE_KEY, state);
  const query = new URLSearchParams({ response_type: "code", client_id: CLIENT_ID, redirect_uri: REDIRECT_URI, state });
  location.assign(`/auth/authorize?${query}`);
  return null;
}

async function finishSignIn() {
  const params = new URLSearchParams(location.search);
  const code = params.get("code");
  if (!code) return;
  history.replaceState(null, "", REDIRECT_URI);
  if (params.get("state") !== sessionStorage.getItem(AUTH_STATE_KEY)) return;
  const token = await requestToken({ grant_type: "authorization_code", code });
  if (token) storeAuth(authFrom(token, token.refresh_token));
}

/** Null means the login page is opening. */
async function accessToken() {
  const auth = storedAuth();
  if (!auth) return signIn();
  if (auth.expires - Date.now() > 60 * 1000) return auth.access;
  const token = await requestToken({ grant_type: "refresh_token", refresh_token: auth.refresh });
  if (!token) {
    localStorage.removeItem(AUTH_KEY);
    return signIn();
  }
  storeAuth(authFrom(token, auth.refresh));
  return token.access_token;
}

function connect() {
  ws = new WebSocket(`${location.origin.replace(/^http/, "ws")}/api/websocket`);
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.type === "auth_required") {
      accessToken()
        .then((token) => token && ws.send(JSON.stringify({ type: "auth", access_token: token })))
        .catch(() => ws.close());
      return;
    }
    if (msg.type === "auth_invalid") {
      const auth = storedAuth();
      if (auth) storeAuth({ ...auth, expires: 0 });
      return;
    }
    if (msg.type === "auth_ok") {
      send({ type: "get_states" }, (res) => {
        for (const s of res.result || []) state[s.entity_id] = s;
        renderWeather();
        refresh();
        loadCalendar();
        subscribeTodos();
        renderTasks();
      });
      send({ type: "subscribe_events", event_type: "state_changed" }, null, onStateChanged);
      return;
    }
    const handler = pending.get(msg.id);
    if (!handler) return;
    if (msg.type === "result") {
      handler.onResult?.(msg);
      if (!handler.onEvent || !msg.success) pending.delete(msg.id);
    } else if (msg.type === "event") {
      handler.onEvent?.(msg.event);
    }
  };
  ws.onclose = () => {
    pending.clear();
    todoSubscribed.clear();
    setTimeout(connect, 2000);
  };
}

let loadedVersion = null;
let lastTouch = 0;

/** ETags of the panel files; Home Assistant changes them whenever a file changes. */
async function deployedVersion() {
  const tags = await Promise.all(
    UPDATE_FILES.map(async (file) => {
      const res = await fetch(file, { method: "HEAD", cache: "no-store" });
      if (!res.ok) throw new Error(`${file}: ${res.status}`);
      return res.headers.get("etag") || res.headers.get("last-modified") || "";
    })
  );
  return tags.join("|");
}

/** Reloads after a deploy, but waits until nobody has touched the screen for a while. */
async function checkForUpdate() {
  try {
    const version = await deployedVersion();
    if (loadedVersion === null) loadedVersion = version;
    else if (version !== loadedVersion && Date.now() - lastTouch > IDLE_BEFORE_RELOAD_MS) location.reload();
  } catch {
    // Home Assistant is restarting or the Wi-Fi dropped; the next tick tries again.
  }
}

function ripple(tile, ev) {
  const r = tile.getBoundingClientRect();
  const size = Math.max(r.width, r.height) * 2;
  const dot = document.createElement("span");
  dot.className = "ripple";
  dot.style.width = dot.style.height = `${size}px`;
  dot.style.left = `${ev.clientX - r.left - size / 2}px`;
  dot.style.top = `${ev.clientY - r.top - size / 2}px`;
  tile.appendChild(dot);
  dot.addEventListener("animationend", () => dot.remove());
}

let pressed = null;
let pressTimer = 0;

function release() {
  clearTimeout(pressTimer);
  if (pressed) pressed.classList.remove("pressed");
  pressed = null;
}

/*
 * Switching, buzzing and the ripple wait for the click, and the squeeze waits a moment:
 * a finger that starts a swipe is cancelled by the browser before any of it shows.
 */
document.body.addEventListener("pointerdown", (ev) => {
  lastTouch = Date.now();
  release();
  if (ev.target.closest("[data-expand]")) return;
  const target = ev.target.closest(".dev, .task");
  if (!target) return;
  pressTimer = setTimeout(() => {
    pressed = target;
    target.classList.add("pressed");
  }, PRESS_DELAY_MS);
});
document.body.addEventListener("pointerup", release);
document.body.addEventListener("pointercancel", release);

strip.addEventListener("click", (ev) => {
  const expand = ev.target.closest("[data-expand]");
  if (expand) {
    haptic("tick");
    toggleGroup(expand.dataset.expand, expand.closest(".dev"));
    return;
  }
  const tile = ev.target.closest(".dev");
  if (!tile) return;
  ripple(tile, ev);
  if (tile.id === "scene") {
    haptic("heavy");
    setScene(tile.classList.contains("welcome"));
  } else if (tile.dataset.light) {
    haptic("click");
    toggleLight(tile.dataset.light);
  } else {
    haptic("heavy");
    tapCovers(tile.dataset.covers.split(" "));
  }
});

agendaEl.addEventListener("pointerdown", holdAgenda);

tasksEl.addEventListener("click", (ev) => {
  const row = ev.target.closest("[data-task]");
  if (!row) return;
  haptic("click");
  toggleTask(row.dataset.list, row.dataset.task);
});

for (const el of [agendaEl, tasksEl]) el.addEventListener("scroll", () => updateFade(el), { passive: true });
window.addEventListener("resize", () => [agendaEl, tasksEl].forEach(updateFade));

preparePage();
buildStrip();
refresh();
tickClock();
setInterval(tickClock, 1000);
setInterval(refreshGoogle, GOOGLE_REFRESH_MS);
checkForUpdate();
setInterval(checkForUpdate, UPDATE_CHECK_MS);
finishSignIn().catch(() => {}).then(connect);
