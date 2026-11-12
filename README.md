# saturn-panel

A Home Assistant wall panel for an old Android phone in landscape. It shows the clock, the weather, one agenda merged from several calendars and your to-do lists. A strip of light and shutter tiles runs along the bottom.

![The panel in demo mode](docs/screenshots/panel.png)

Mine runs on a Sony Xperia XZ from 2016, taped to the door intercom next to the front door. [An old phone as a wall display](docs/old-phone.md) has the photos, a video and the cabling.

The panel is plain HTML, CSS and JavaScript with no build step. Home Assistant serves the files, and a small Android app in `android/` shows them full screen.

## Try it without Home Assistant

Demo mode replaces Home Assistant with a fake one that has made-up calendars, tasks, lights and shutters. Taps work, and nothing leaves the page.

```sh
python3 -m http.server 8000
```

Open <http://localhost:8000/index.html?demo>. Add `&locale=de-DE` to see the German text. The demo data itself stays English.

## What it shows

- Clock, date, weather and the indoor temperature and humidity on the left.
- The next seven days from all your calendars in one list. A coloured initial marks whose event it is.
- A line that marks the current time between today's events. It stays in the middle of the agenda, with what is over above it and what comes next below it. After you scroll, the agenda waits 45 seconds and then glides back.
- Your to-do lists behind a switch under the date that counts the open tasks. Tap it and the tasks slide in where the agenda was. After 30 seconds without a touch the agenda comes back. The switch shows only while a task is open or was ticked off in the last six hours. Tap a task to tick it off or back on.
- A swipeable strip with a welcome or goodbye tile first, then your lights, then your shutters. The arrow on a group tile slides its members out next to it. A colour light's tile glows in the colour the light shows.
- A night mode. From an evening hour until the morning the screen shows only a dim red clock on black, and the Android app turns the backlight down to 3 %. A tap brings the panel back, and the clock returns after 30 seconds without a touch. With the Android app, switching on the room light brings the panel back too: the phone's light sensor tells it the room is lit.
- A hidden screen to find a lost phone, tablet or watch. Tap the clock twice to open it, then tap a tile and that device rings. Back, or a minute without a touch, returns to the panel.

Every five minutes the panel asks Home Assistant to update the calendars and to-do lists. On its own, Home Assistant's Google integration fetches only every 15 to 30 minutes.

<img src="docs/screenshots/lights.png" width="49%" alt="The kitchen light group opened next to its tile"> <img src="docs/screenshots/shutters.png" width="49%" alt="The living room shutters opened next to their tile">

<img src="docs/screenshots/tasks.png" width="49%" alt="The task list in place of the agenda, opened from the switch under the date">

<img src="docs/screenshots/finder.png" width="49%" alt="The hidden find-a-device screen, one phone ringing"> <img src="docs/screenshots/night.png" width="49%" alt="The dim red night clock">

## Set it up

### Create a user for the panel

In Home Assistant, add a person under **Settings > People**, allow it to log in, and leave **Administrator** off. Limit it to the local network if the phone never leaves your home.

The panel only reads states and calls services, so it does not need an admin. Home Assistant has no per-device permissions, though. This user can still switch every light and move every shutter. Being a non-admin keeps it out of settings, users and add-ons.

### Copy the files to Home Assistant

1. Copy `config.example.js` to `config.js` and fill in your own entity IDs. Each key is explained in `config.example.js`.
2. Copy `index.html`, `styles.css`, `app.js`, `demo.js` and `config.js` into `www/panel/` inside your Home Assistant configuration folder.
3. If `www/` did not exist before, restart Home Assistant once.
4. Open `http://<your-home-assistant>:8123/local/panel/index.html`.

Home Assistant serves everything under `/local/` to anyone who can reach it, without a login. `config.js` holds entity IDs and names, so treat it as readable by everyone on your network. Never put a token in it.

### Sign in once

On first start the panel opens Home Assistant's login page. Sign in as the panel user. The device keeps the session in its local storage and stays signed in, also across restarts.

To sign the device out, log in as the panel user on another device and delete the panel's token under **Profile > Security**.

### Put it on the phone

The Android app shows the panel full screen, keeps the screen on, hides the system bars and buzzes on taps. It needs Android 8 or later.

Building it needs JDK 17 and the Android SDK:

```sh
cd android
./gradlew assembleDebug
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

On first start the app asks for the panel URL. To change it later from a computer, run the command below and confirm the new URL on the phone:

```sh
adb shell am start -n io.erginos.saturnpanel/.MainActivity --es url http://homeassistant.local:8123/local/panel/index.html
```

The app can also be the phone's home app. Pick **Saturn Panel** under **Settings > Apps > Default apps > Home app**, and the panel comes back by itself after a reboot.

Any browser works as well. You lose the haptics and the screen may turn off.

## Update

Copy all five files again. The panel checks `index.html`, `config.js`, `app.js` and `styles.css` every two minutes. When one has changed, it reloads as soon as nobody has touched the screen for 20 seconds.

## Configure

`config.example.js` documents every key. Leave out any section you do not need, and that part of the panel stays hidden.

| Key | What it sets |
|---|---|
| `locale` | Date format and panel language. Leave it out to follow the browser. |
| `weather` | The weather entity for the left column. |
| `room` | Indoor `temperature` and `humidity` sensors. |
| `calendars` | Calendars merged into the agenda, each with an initial, a name and a colour. |
| `agendaDays` | How many days the agenda shows. The default is 7. |
| `todoLists`, `todoSkip` | Which to-do lists show up in the task list. |
| `lights` | Light and switch tiles. A tile with `members` gets an arrow that slides them out. |
| `covers` | Shutter tiles. A group with several members moves them together. |
| `night` | When the dim night clock takes over, as `from` and `to` in `HH:MM`. Leave it out to keep the panel on all night. |
| `phones` | Tiles on the hidden find-a-device screen. Each names a script or a button entity that rings the device. |
| `scene` | Lights that the welcome tile turns on and the goodbye tile turns off. Welcome also opens every cover, and goodbye closes every cover. |

### Find a lost device

Each tile presses a button entity that plays a sound on the device, or runs a script that does.

- **Android:** the [GoogleFindMy-HA](https://github.com/BSkando/GoogleFindMy-HA) custom integration adds a play-sound button per device in Google Find My Device. Its token lasts until you change your Google password.
- **iPhone, iPad, Apple Watch:** the core **Apple iCloud** integration adds a play-sound button per device. Turn on family devices to get a child's watch. Apple drops the session after a few hours, so press the button from an automation that first runs `homeassistant.reload_config_entry` on the iCloud entry. That logs in again without a code. The reload needs an admin, so a non-admin panel account starts the automation through a script that fires an event.

The panel text exists in English and German. Any other language falls back to English. To add one, add a block next to `en` and `de` in the `TEXT` table at the top of `app.js`.

## Develop

- `npm install`, `npx playwright install chromium` and `npm run screenshots` render demo mode into `docs/screenshots/` at the Xperia XZ's screen size with a fixed clock.
- `git config core.hooksPath .githooks` runs `scripts/check-private.sh` before every commit. It fails on tokens, LAN addresses, email addresses, device MACs and coordinates. Put your own names, street or hostname into `.private-words`, one per line. That file is ignored by git.
- CI runs the same check on every push, plus gitleaks and a checksum of the Gradle wrapper.

[CONTRIBUTING.md](CONTRIBUTING.md) covers pull requests. [AGENTS.md](AGENTS.md) is the brief for coding agents.

## License

[MIT](LICENSE)
