# Agent brief

saturn-panel is a Home Assistant wall panel for an old Android phone in landscape. [README.md](README.md) explains what it shows and how people install it.

## Files

- `index.html` is the page skeleton. It loads `config.js`, `demo.js` and `app.js` in that order.
- `app.js` holds all panel logic: the WebSocket connection, the login, rendering and the panel text in English and German (`TEXT`).
- `styles.css` is the only stylesheet.
- `demo.js` runs only with `?demo`. It sets a demo config and replaces the WebSocket with a fake Home Assistant, so `app.js` runs unchanged.
- `config.example.js` documents every config key. Each user copies it to `config.js`.
- `android/` is the WebView app (Java, no dependencies).
- `scripts/check-private.sh` is the privacy check. `scripts/screenshots.mjs` renders the README screenshots.

## Rules

- Never open, print or quote `config.js` or `.private-words`. Both are ignored by git and hold a real home's entity names. Work from `config.example.js` and `?demo`.
- Nothing that identifies a home goes into a tracked file: tokens, IP addresses, email addresses, real names, street names, device MACs or coordinates. Use the placeholders that `config.example.js` and `demo.js` already use.
- No build step and no runtime dependencies. The panel is plain browser JavaScript that Home Assistant serves as static files. `package.json` exists only for the screenshot script.
- The panel runs in Android System WebView on phones with Android 8 or later and a 640 × 360 CSS pixel screen. Check layout changes at that size.
- A new config key goes into `config.example.js` with a comment and into the demo config in `demo.js`, so demo mode shows it.
- New panel text goes into both the `en` and the `de` block of `TEXT` in `app.js`.
- Do not switch real lights or move real shutters on someone's setup. Test against `?demo`.

## Check your work

1. Serve the repo with `python3 -m http.server 8000` and open <http://localhost:8000/index.html?demo> at 640 × 360. Add `&locale=de-DE` for German.
2. After a visible change, run `npm run screenshots` and commit the changed PNGs in `docs/screenshots/`.
3. Run `scripts/check-private.sh`. The pre-commit hook runs it too once `git config core.hooksPath .githooks` is set.
4. For changes in `android/`, run `./gradlew assembleDebug` in `android/`.

## Commits

Commit messages follow the existing history: a type, an optional scope and what changed, such as `feat: show the panel in English or German` or `fix(android): accept only http(s) panel URLs`.
