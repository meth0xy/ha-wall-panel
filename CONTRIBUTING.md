# Contributing

Issues and pull requests are welcome. The panel is small on purpose, so open an issue first for a bigger feature.

## Before you open a pull request

1. Run `git config core.hooksPath .githooks` once. The hook runs `scripts/check-private.sh` before every commit, so your own entity names, addresses and tokens stay out of the history.
2. Test your change in demo mode at 640 × 360. [README.md](README.md#try-it-without-home-assistant) shows how to start it.
3. If you added a config key, document it in `config.example.js` and add it to the demo config in `demo.js`.
4. If you added panel text, add it in English and German in `TEXT` in `app.js`. If you do not speak German, say so in the pull request and someone will fill it in.
5. If the panel looks different, run `npm run screenshots` and commit the new images.

Keep the panel free of build steps and runtime dependencies. It has to run as static files that Home Assistant serves.

## Commit messages

Use a type, an optional scope and what changed, as in `fix: keep the next event's countdown readable on small screens`.
