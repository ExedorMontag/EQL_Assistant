# FORK.md — EQL Assistant

This repository is **EQL Assistant** (github.com/ExedorMontag/EQL_Assistant), a fork of
Josh Moyers' [EQ Legends Companion](https://github.com/jmoyers/everquest-companion). The
upstream manual in `AGENTS.md` still describes the code, and its code laws still hold. This
file lists what is different here.

## Does not apply to this fork

- Linear, the upstream owner's board and personal process rulings.
- The upstream AWS account, DSQL, the triage tooling and `infra/` deploys.
- The Azure code-signing identity.

## Fork facts

| Thing | Value |
| --- | --- |
| Display name | `EQL Assistant` |
| package `name`, userData dir, install dir | `eql-assistant` (dev: `eql-assistant-dev`) |
| appId | `com.exedormontag.eql-assistant` |
| Updates | GitHub Releases of `ExedorMontag/EQL_Assistant` (`electron-builder.yml` `publish`) |
| Installer file | `eql-assistant-Setup-<version>.exe` |
| Code signing | none; `publisherName` is deliberately absent so unsigned updates install |
| Usage analytics | DARK: `TELEMETRY_API_URL` is `''`; the first-run notice is hidden while dark |
| Feedback reports | DARK: `COMPILED_FEEDBACK_API_URL` and `FEEDBACK_S3_BUCKET` are `''` |
| Store file name | unchanged, `everquest-companion-progress.json` (shared with upstream on purpose) |

## Settings import from the original app

On the first launch of a channel whose userData dir does not exist yet,
`src/main/upstreamSeed.ts` COPIES `%APPDATA%\everquest-companion` (the original app's data)
into the fork's own dir, skipping Chromium caches, locks and the error log. The original dir is
never written to, and the uninstaller never deletes it. The older `eq-tools` seed in
`channel.ts` remains as the fallback when no original-app dir exists.

## Credit

The original author's credit stays visible: the top of `README.md`, Preferences → Thanks
(`OriginSetting` in `ThanksSetting.tsx`), and `LICENSE`, which is left untouched as the
license requires. `security.ts` allows links to both the fork's repo and the upstream repo.
