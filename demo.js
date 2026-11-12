/**
 * Open index.html?demo to run the panel without Home Assistant. It swaps in a demo
 * config and a fake Home Assistant behind the WebSocket API, so app.js runs unchanged.
 */
(() => {
  const params = new URLSearchParams(location.search);
  if (!params.has("demo")) return;

  const ALEX = "calendar.alex";
  const SAM = "calendar.sam";
  const TODO = "todo.home";

  window.PANEL_CONFIG = {
    locale: params.get("locale") || "en-US",
    weather: "weather.home",
    room: { temperature: "sensor.living_room_temperature", humidity: "sensor.living_room_humidity" },
    calendars: [
      { id: ALEX, initial: "A", name: "Alex", color: "#7fd4c1" },
      { id: SAM, initial: "S", name: "Sam", color: "#c7a8ff" },
    ],
    todoLists: [TODO],
    lights: [
      {
        id: "light.kitchen",
        title: "Kitchen",
        members: [
          { id: "light.kitchen_counter", title: "Counter" },
          { id: "light.kitchen_ceiling", title: "Ceiling" },
        ],
      },
      { id: "light.living_room", title: "Living room" },
      { id: "switch.bedroom_lamp", title: "Bedroom" },
      { id: "light.desk", title: "Desk" },
    ],
    covers: [
      {
        key: "living",
        title: "Living room",
        members: [
          { id: "cover.living_room_left", title: "Left" },
          { id: "cover.living_room_right", title: "Right" },
        ],
      },
      { key: "office", title: "Office", members: [{ id: "cover.office", title: "Office" }] },
      { key: "bedroom", title: "Bedroom", members: [{ id: "cover.bedroom", title: "Bedroom" }] },
    ],
    scene: {
      welcome: ["light.kitchen", "light.living_room"],
      goodbye: ["light.kitchen", "light.living_room", "switch.bedroom_lamp", "light.desk"],
    },
    phones: [
      { id: "script.ring_alex_phone", title: "Alex's phone" },
      { id: "button.sam_phone_play_sound", title: "Sam's phone" },
      { id: "button.family_ipad_play_sound", title: "iPad" },
      { id: "button.sam_watch_play_sound", title: "Sam's watch" },
    ],
  };

  const GROUPS = { "light.kitchen": ["light.kitchen_counter", "light.kitchen_ceiling"] };

  const states = Object.fromEntries(
    Object.entries({
      "weather.home": ["partlycloudy", { temperature: 14 }],
      "sensor.living_room_temperature": ["21.4", {}],
      "sensor.living_room_humidity": ["48", {}],
      [ALEX]: ["off", {}],
      [SAM]: ["off", {}],
      [TODO]: ["6", {}],
      "light.kitchen": ["on", {}],
      "light.kitchen_counter": ["on", {}],
      "light.kitchen_ceiling": ["off", {}],
      "light.living_room": ["on", { color_mode: "hs", rgb_color: [255, 147, 79] }],
      "switch.bedroom_lamp": ["off", {}],
      "light.desk": ["off", { color_mode: "hs", rgb_color: [138, 116, 255] }],
      "cover.living_room_left": ["open", { current_position: 100 }],
      "cover.living_room_right": ["open", { current_position: 100 }],
      "cover.office": ["open", { current_position: 60 }],
      "cover.bedroom": ["closed", { current_position: 0 }],
    }).map(([entity_id, [state, attributes]]) => [entity_id, { entity_id, state, attributes }])
  );

  const pad = (n) => String(n).padStart(2, "0");
  const dayString = (offset) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };
  const at = (offset, time) => new Date(`${dayString(offset)}T${time}:00`).toISOString();

  const BOTH = [ALEX, SAM];
  const events = [
    [[ALEX], { summary: "Recycling pickup", start: dayString(0), end: dayString(1) }],
    [[ALEX], { summary: "Dentist", start: at(0, "08:30"), end: at(0, "09:15"), location: "Dr. Lee, 12 Elm Street" }],
    [[SAM], { summary: "Lunch with Jo", start: at(0, "12:30"), end: at(0, "13:30") }],
    [[SAM], { summary: "Football practice", start: at(0, "17:30"), end: at(0, "19:00"), location: "Riverside Park" }],
    [BOTH, { summary: "Dinner at Nina's", start: at(0, "19:30"), end: at(0, "22:00") }],
    [[ALEX], { summary: "Morning run", start: at(1, "07:00"), end: at(1, "07:45") }],
    [[SAM], { summary: "Team planning", start: at(1, "10:00"), end: at(1, "11:30") }],
    [[ALEX], { summary: "Piano lesson", start: at(1, "18:00"), end: at(1, "19:00") }],
    [BOTH, { summary: "Sam's birthday", start: dayString(2), end: dayString(3) }],
    [BOTH, { summary: "Parent-teacher meeting", start: at(2, "15:00"), end: at(2, "16:00"), location: "Riverside School" }],
    [[ALEX], { summary: "Car service", start: at(3, "09:00"), end: at(3, "10:00"), location: "City Garage" }],
    [[SAM], { summary: "Movie night", start: at(3, "20:00"), end: at(3, "22:30") }],
    [BOTH, { summary: "Farmers market", start: at(4, "10:00"), end: at(4, "12:00") }],
    [[SAM], { summary: "Swimming", start: at(5, "10:30"), end: at(5, "11:30") }],
    [BOTH, { summary: "Visit grandparents", start: at(6, "14:00"), end: at(6, "18:00") }],
  ];

  const tasks = [
    { uid: "1", summary: "Call the plumber", status: "needs_action", due: dayString(-2) },
    { uid: "2", summary: "Book summer flights", status: "needs_action", due: dayString(0) },
    { uid: "3", summary: "Order a birthday present for Sam", status: "needs_action", due: dayString(1) },
    { uid: "4", summary: "Return library books", status: "needs_action", due: dayString(3) },
    { uid: "5", summary: "Water the plants", status: "needs_action" },
    { uid: "6", summary: "Fix the bike light", status: "needs_action" },
    { uid: "7", summary: "Pay the electricity bill", status: "completed", completed: new Date(Date.now() - 20 * 60000).toISOString() },
  ];

  const ids = (target) => [].concat(target?.entity_id || []);

  window.WebSocket = class DemoHomeAssistant {
    static OPEN = 1;
    readyState = 1;
    stateSubscription = null;
    todoSubscriptions = [];
    coverTimers = {};

    constructor() {
      this.reply({ type: "auth_ok" });
    }

    reply(msg) {
      setTimeout(() => this.onmessage?.({ data: JSON.stringify(msg) }), 30);
    }

    result(id, result = null) {
      this.reply({ id, type: "result", success: true, result });
    }

    setState(id, state, attributes = {}) {
      const next = { ...states[id], state, attributes: { ...states[id].attributes, ...attributes } };
      states[id] = next;
      if (this.stateSubscription === null) return;
      this.reply({ id: this.stateSubscription, type: "event", event: { event_type: "state_changed", data: { entity_id: id, new_state: next } } });
    }

    pushTasks() {
      for (const id of this.todoSubscriptions) this.reply({ id, type: "event", event: { items: tasks } });
    }

    switchLight(id, on) {
      const members = GROUPS[id];
      for (const member of members || []) this.setState(member, on ? "on" : "off");
      this.setState(id, on ? "on" : "off");
      const group = Object.keys(GROUPS).find((g) => GROUPS[g].includes(id));
      if (group) this.setState(group, GROUPS[group].some((m) => states[m].state === "on") ? "on" : "off");
    }

    moveCover(id, service) {
      clearInterval(this.coverTimers[id]);
      const position = () => states[id].attributes.current_position;
      if (service === "stop_cover") {
        this.setState(id, position() > 0 ? "open" : "closed");
        return;
      }
      const step = service === "open_cover" ? 10 : -10;
      this.setState(id, step > 0 ? "opening" : "closing");
      this.coverTimers[id] = setInterval(() => {
        const next = Math.min(100, Math.max(0, position() + step));
        const done = next === 0 || next === 100;
        this.setState(id, done ? (next ? "open" : "closed") : states[id].state, { current_position: next });
        if (done) clearInterval(this.coverTimers[id]);
      }, 400);
    }

    calendarEvents(target, { start_date_time, end_date_time }) {
      const from = new Date(start_date_time);
      const to = new Date(end_date_time);
      const response = {};
      for (const cal of ids(target)) {
        response[cal] = {
          events: events
            .filter(([owners, e]) => owners.includes(cal) && new Date(e.end) > from && new Date(e.start) < to)
            .map(([, e]) => e),
        };
      }
      return { response };
    }

    send(raw) {
      const msg = JSON.parse(raw);
      if (msg.type === "get_states") return this.result(msg.id, Object.values(states));
      if (msg.type === "subscribe_events") {
        this.stateSubscription = msg.id;
        return this.result(msg.id);
      }
      if (msg.type === "todo/item/subscribe") {
        this.todoSubscriptions.push(msg.id);
        this.result(msg.id);
        return this.pushTasks();
      }
      if (msg.type !== "call_service") return this.result(msg.id);

      const { domain, service, target, service_data = {} } = msg;
      if (domain === "calendar") return this.result(msg.id, this.calendarEvents(target, service_data));
      if (domain === "light" || domain === "switch") {
        for (const id of ids(target)) this.switchLight(id, service === "turn_on");
      } else if (domain === "cover") {
        for (const id of ids(target)) this.moveCover(id, service);
      } else if (domain === "todo") {
        const task = tasks.find((t) => t.uid === service_data.item);
        task.status = service_data.status;
        task.completed = task.status === "completed" ? new Date().toISOString() : undefined;
        this.pushTasks();
      }
      this.result(msg.id);
    }

    close() {}
  };
})();
