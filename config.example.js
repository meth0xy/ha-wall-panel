// Copy to config.js and fill in your own entities. config.js is ignored by git.
// Entity IDs are under Settings > Devices & services > Entities in Home Assistant.
// Leave out any section you do not need; its part of the panel then stays hidden.
// No token goes here: Home Assistant serves /local/ to anyone, so the panel signs in through
// Home Assistant's login page on first start instead. Use a dedicated, non-admin user.
window.PANEL_CONFIG = {
  // Date format and panel language. Text exists in English and German; other languages
  // fall back to English. Leave it out to follow the browser.
  locale: "en-US",

  weather: "weather.home",
  room: {
    temperature: "sensor.living_room_temperature",
    humidity: "sensor.living_room_humidity",
  },

  // Merged into one agenda. Empty shows every calendar, without initials.
  // color is "#rrggbb".
  calendars: [
    { id: "calendar.alex", initial: "A", name: "Alex", color: "#7fd4c1" },
    { id: "calendar.sam", initial: "S", name: "Sam", color: "#c7a8ff" },
  ],
  agendaDays: 7,

  // Empty shows every to-do list except the ones in todoSkip.
  todoLists: ["todo.my_tasks"],
  todoSkip: ["todo.shopping_list"],

  // A tile with members gets an arrow that slides the single lights out.
  lights: [
    {
      id: "light.kitchen",
      title: "Kitchen",
      members: [
        { id: "light.kitchen_counter", title: "Counter" },
        { id: "light.kitchen_ceiling", title: "Ceiling" },
      ],
    },
    { id: "switch.bedroom_lamp", title: "Bedroom" },
  ],

  // key is any unique word. A group with several members moves them together.
  covers: [
    {
      key: "living",
      title: "Living room",
      members: [
        { id: "cover.living_room_left", title: "Left" },
        { id: "cover.living_room_right", title: "Right" },
      ],
    },
    { key: "bedroom", title: "Bedroom", members: [{ id: "cover.bedroom", title: "Bedroom" }] },
  ],

  // First tile of the strip. Welcome opens every cover and turns these on,
  // goodbye closes every cover and turns these off.
  scene: {
    welcome: ["light.kitchen"],
    goodbye: ["light.kitchen", "switch.bedroom_lamp"],
  },

  // Tiles at the end of the strip that make a lost phone ring. id is a script or a button
  // entity that rings it, such as a script that calls icloud.play_sound.
  phones: [
    { id: "script.ring_alex_phone", title: "Alex" },
    { id: "button.sam_phone_play_sound", title: "Sam" },
  ],
};
