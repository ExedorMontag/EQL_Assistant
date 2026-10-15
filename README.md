# EQL Assistant

**EQL Assistant is a fork of [EQ Legends Companion](https://github.com/jmoyers/everquest-companion)
by Josh Moyers.** Nearly all of this app is his work, and the credit belongs to him. This
version adds its own tweaks, new features and cosmetic changes, and is here to make sure the
app stays available to EverQuest Legends players now that the original is no longer being
maintained.

A Windows desktop companion for **EverQuest Legends**. It reads the log file the game
already writes and turns it into live, useful views — a DPS meter, floating overlays,
quest and loot tracking, alerts.

**It only reads your log.** Nothing is injected into EverQuest, no game files are
touched, no memory is read, and nothing is automated or played for you. If you turned
off logging, the app simply has nothing to show.

## What it does

- **Live DPS meter** — per-fight and per-zone numbers with fight history, drill-down
  into each attack and spell, and a timeline of the pull.
- **Floating overlays** — small always-on-top meters you can leave on top of the game:
  damage or healing, scoped to the current fight or the whole zone. Lock one and it
  becomes click-through.
- **Plane of Sky tracker** — every class's Test quests with "have / need" chips per
  item, item stats on hover, and sorting by closest-to-done.
- **Loot + item knowledge** — a running history of what you looted, and what each item
  is actually *for*: which quests use it, what it turns in for, which recipes consume it.
- **Leveling & AA** — XP and AA progress per character, with history.
- **Raid targets** — which named/raid mobs you've killed and when.
- **Buff timers** — remaining time on buffs, learned from the log *(early — still rough)*.
- **Sound alerts** — play a sound when something happens: a charm break, a buff fading,
  a raid target dying, or any log line you write a rule for. Voice packs included.

Everything is per-character; switch characters and the app re-reads that log.

## Getting started

**Requires 64-bit Windows 10 or 11.** Windows 8.1 and older can't run it — the installer
checks and stops with a message rather than leaving you an app that won't start.

1. Download `eql-assistant-Setup-<version>.exe` from the
   [**Releases**](https://github.com/ExedorMontag/EQL_Assistant/releases) page.
2. Run it. It's a one-click, per-user install (like Discord) — no admin prompt, no
   wizard. It adds a Start-menu and desktop shortcut.
3. In EverQuest, type `/log on`.

The app finds your log automatically — usually
`C:\Users\Public\Daybreak Game Company\Installed Games\EverQuest Legends\Logs\`. If your
install lives somewhere else, point it at the right folder in **Settings**.

Overlays sit on top of the game in **windowed** or **borderless** mode. Exclusive
fullscreen can't be overlaid by anything, so use borderless if you want them.

### "Windows protected your PC"

The installer is not code-signed yet, so Windows SmartScreen may warn you the first time.
Click **More info**, then **Run anyway**. Updates are still checked against the checksum
published with each release before they install.

### Coming from EQ Legends Companion?

EQL Assistant installs as its own app, beside the original rather than over it. The first
time it starts, it **copies** your settings, alerts, sound packs and history from EQ Legends
Companion, so you pick up exactly where you left off. The original's folder is left
untouched. Once you're happy, you can uninstall EQ Legends Companion from Settings → Apps
(choose **Yes** to keep its settings if it asks; EQL Assistant has its own copy either way).

## Updates

The app updates itself in the background from GitHub Releases. When a new version has
downloaded, an **"Update ready"** notice appears with a **Restart** button — click it to
apply now, or it installs the next time you quit.

## Make it yours

- **Sound & voice packs.** Alert sounds come from packs. One voice pack ships with the
  app and installs itself on first launch, and you can browse and install ~350 more from
  inside the app (**Alerts → Sound packs…**). To add your own: drop a folder into
  `%AppData%\eql-assistant\soundpacks\<your-pack>\` containing your `.wav`/`.mp3`/`.ogg`
  files and a small `manifest.json` naming them — it shows up in every sound picker. Want
  your own Final Fantasy fanfare on a raid kill? That's the whole job.
- **Share alerts.** Any alert (or all of them at once) copies to a short paste-safe
  string. Drop it in guild chat or Discord; whoever pastes it back in gets a preview
  before anything is added. Imports only ever *add* — they never overwrite your alerts.
- **Share your setup.** Export your whole settings bundle — alerts, volume, overlay
  look, view preferences, favorites — as one string or a file. It carries no file paths,
  no window positions, and no character progress.

## Feedback

Found a bug or have an idea? Open an
[issue on GitHub](https://github.com/ExedorMontag/EQL_Assistant/issues).

The original app's in-app **Send feedback** dialog sent reports to a server run by its
author. That server is not part of this fork, so in EQL Assistant the dialog can't send
anything yet.

**Usage counts.** The original app sent anonymous usage counts to its author. **This fork
sends nothing**: the address was removed, and nothing leaves your machine.
[`TELEMETRY.md`](TELEMETRY.md) describes what the code is able to collect, and
**Preferences → Usage analytics** still shows it and has the off switch. If a future
version starts counting daily users, the release notes will say so first.

## Development

Contributions welcome. Everything about building, testing, and the architecture lives in
[`AGENTS.md`](AGENTS.md) — start there.

## License

FSL-1.1-MIT (Functional Source License, converting to MIT after two years) — see
[`LICENSE`](LICENSE). The original EQ Legends Companion is Copyright (c) 2026 Josh Moyers,
and this fork is distributed under his license terms.

## Thanks

First and foremost to **Josh Moyers**, who built
[EQ Legends Companion](https://github.com/jmoyers/everquest-companion), which this app is a
fork of. The same credit is in the app, under **Preferences → Thanks**.

The item icons and raid-boss portraits this app draws come from two volunteer-run
EverQuest wikis — [**wiki.project1999.com**](https://wiki.project1999.com/) (boss
portraits) and [**eqlwiki.com**](https://eqlwiki.com/) (item icons, and the item, spell
and quest knowledge behind them). Those images are **copied into the app at build time**
(`resources/wiki-images/`, ~3.75 MB, regenerated with `npm run fetch:images`), so the
running app never asks either site for a picture, and
[`resources/wiki-images/manifest.json`](resources/wiki-images/manifest.json) records the
exact source URL, byte length and SHA-256 of every file it ships. Neither wiki is
affiliated with this app. The same credit is in the app itself, under
**Preferences → Thanks**.

The bundled **Alan Rickman** voice pack comes from
[utensils/openpeon-alan-rickman-soundpack](https://github.com/utensils/openpeon-alan-rickman-soundpack)
and is licensed CC-BY-4.0. Packs you install from the in-app browser carry their own
licenses and attribution (see each pack's manifest); none of them are part of this
repository.
