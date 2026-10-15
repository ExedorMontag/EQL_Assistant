# Security

EQL Assistant is a fork of [EQ Legends Companion](https://github.com/jmoyers/everquest-companion)
by Josh Moyers: a desktop app that reads your EverQuest log file and shows you what happened.
This document is an honest description of what it touches, what it does not, and how you can
verify that the copy you installed is the one this repo built.

## Reporting a vulnerability

Please use GitHub's
[private security advisories](https://github.com/ExedorMontag/EQL_Assistant/security/advisories/new)
for this repo, so the problem can be confirmed and fixed before anything is public. Put enough
in it to reproduce the problem, and don't file it in a public issue.

This is a small hobby project maintained by one person. There is no bounty and no guaranteed
response time, but reports are taken seriously and credited unless you ask otherwise.

## What the app touches

**On your machine**

| Thing                                              | Access                                 |
| -------------------------------------------------- | -------------------------------------- |
| Your EverQuest log file(s)                          | **read-only**, never modified, never uploaded |
| `%APPDATA%\eql-assistant\`                          | read/write — your settings and progress |
| `%APPDATA%\everquest-companion\`                    | **read once, on first launch only**, to copy your settings over from the original app. Never written to. |
| `%LOCALAPPDATA%\Programs\eql-assistant\`           | the install directory                   |
| Windows registry (`HKCU`, uninstall entry)          | written by the installer only           |

The app installs **per-user**. It never asks for administrator rights, and there is
no UAC prompt at install, update, or uninstall time — the installer is built with
`perMachine: false`, so it has no elevation manifest at all.

Your log file is the only game data it reads, and it is opened read-only. Log
contents are parsed locally and never leave your machine.

**Over the network** — all HTTPS, and every request is a read-only GET:

| Host                                             | Why                                                   |
| ------------------------------------------------ | ----------------------------------------------------- |
| `github.com` / `objects.githubusercontent.com`   | update checks and installer downloads                  |
| `wiki.project1999.com`                           | item lookups + item icons                              |
| `eqlwiki.com`                                    | item lookups + item icons                              |
| `peonping.github.io`, `raw.githubusercontent.com`| the optional sound-pack registry and pack downloads     |

**This fork sends nothing anywhere.** The original app sent anonymous usage counts and
(when you pressed Send) feedback reports to servers run by its author. Those addresses were
removed from this fork, so the usage-analytics and feedback code has nowhere to send: the
endpoints are compiled in as empty, and nothing in settings, in the UI, in an environment
variable or on disk can supply one. If a future version starts sending anything, this file,
[`TELEMETRY.md`](TELEMETRY.md) and the release notes will say so first.

Remote images are fetched only from an exact hostname allowlist
(`wiki.project1999.com`, `eqlwiki.com`), HTTPS only, default port only, no embedded
credentials, and are cached on disk after content sniffing.

## What the app never does

- No account, no login, no credentials, nothing stored that identifies you.
- No crash dumps, no session recording, no click stream, no usage counts sent.
- **Nothing about your logs, characters, or gameplay is uploaded**, ever.
- It does not write to, inject into, or otherwise touch the EverQuest client.
- It does not run with administrator privileges.
- It does not accept an update feed URL from settings, from the UI, or from any
  file on disk. The update source is compiled in.

## How updates are verified today

1. The app polls **only** the GitHub Releases of this repository, over HTTPS. The
   feed location is fixed at build time (`electron-builder.yml`); nothing in the
   settings store or the renderer process can point it elsewhere.
2. The feed (`latest.yml` / `main.yml`) carries a **SHA-512** for the installer.
   `electron-updater` streams the download through a digest transform and aborts
   with `ERR_CHECKSUM_MISMATCH` on any mismatch. The same check is applied to
   differential (block-map) downloads and re-applied to an already-staged
   installer before it is ever run.
3. Downgrades are refused (`allowDowngrade = false`), so a re-published or
   rolled-back release cannot walk an installation backwards.
4. Every release also ships **`SHA256SUMS.txt`** so you can verify a manual
   download yourself, independently of GitHub's TLS:

   ```powershell
   certutil -hashfile eql-assistant-Setup.exe SHA256
   ```

   ```sh
   sha256sum -c SHA256SUMS.txt
   ```

## Code signing and the update trust chain

**Release builds of this fork are not code-signed yet.** The original app was signed with
its author's own certificate, which this fork does not have. Two consequences:

1. SmartScreen may warn the first time you run the installer: *More info → Run anyway*.
   Check the download against `SHA256SUMS.txt` on the release page if you want certainty.

2. The update path checks every download byte-for-byte against the sha512 in the release
   feed, but with no signature there is no publisher check, so **the GitHub account that
   publishes releases is the trust root.** `publisherName` is deliberately left out of
   electron-builder.yml: with it set, unsigned updates would be refused and auto-update
   would never work. If this fork gets a certificate, both come back together.

- **Release-pipeline hardening.** CI publishes only from a pushed `v*` tag;
  only that one job holds a repository-write token (every other path runs read-only);
  all third-party GitHub Actions are pinned to commit SHAs; dependency install
  scripts are disabled (`.npmrc`, `ignore-scripts=true`) so a compromised npm
  package cannot execute code inside the release job.

For out-of-band certainty about a specific download, check it against
`SHA256SUMS.txt` on the release page and against the hash printed in the public
build log for that tag.

## Supply chain

- Dependencies are installed with `npm ci` from a committed lockfile; every entry
  carries a `sha512` integrity hash and resolves to `registry.npmjs.org`.
- `ignore-scripts=true` — no dependency's install hook executes on a developer
  machine or in CI. See `.npmrc`.
- All GitHub Actions are pinned to full commit SHAs, not mutable tags.
- Dependabot watches npm and Actions weekly (`.github/dependabot.yml`).
- The tree currently reports **zero** known vulnerabilities — `npm audit` and
  `npm audit --omit=dev` both say `found 0 vulnerabilities`. See
  [Known dependency advisories](#known-dependency-advisories) for why the plain
  `npm audit` number is the one that matters here.

## Known dependency advisories

**There are none open right now.** This section exists to say how they are judged
when there are, because the default reading of the numbers is wrong for this
project in one specific way.

**`--omit=dev` is not the runtime.** npm and Dependabot classify a package by
which block of `package.json` it sits in, and `electron` sits in
`devDependencies` — that is correct for how it is *installed* (it is not
`require`d from the packaged app's `node_modules`; it *is* the packaged app). The
consequence is that `npm audit --omit=dev` hides every Chromium advisory in the
thing users actually run. So the number quoted above is the plain `npm audit`,
and an electron advisory is treated as a **shipping** vulnerability regardless of
which block it was found in. `vite`, `esbuild`, `electron-builder` and friends
genuinely are build-time only: nothing they contain is copied into the installer.

**Electron is held to the supported line, not to the minimum patch.** Electron
takes Chromium security fixes on the newest three majors only. Pinning to the
exact version an advisory names would park us on a line that has stopped
receiving them, so the target is the current supported major even when that is a
larger jump. Majors are still hand-driven (`.github/dependabot.yml` ignores
`electron` / `electron-builder` majors on purpose) and are verified by building
and packaging, not by reading a changelog: `npm test`, `npm run test:e2e`
against a real boot, and `npm run dist:dir` through to a launchable
`win-unpacked`.

**Unreachable is stated, not assumed.** Where an advisory does not apply, the
reason is written down with the fix rather than used to skip it — for example
`GHSA-7g7r-gx96-252g` (`app-builder-lib`) is an `AppImage` `AppRun` bug, and
`electron-builder.yml` builds exactly one target, Windows `nsis` `x64`. It was
upgraded anyway. "Not reachable" is a note in the commit, not a reason to leave
a version behind.

## Scope

In scope: anything that lets someone else read your data, run code on your machine
through this app, or tamper with an update. Out of scope: SmartScreen warnings on
unsigned builds (known, documented above), and anything requiring an attacker who
already has code execution on your machine.
