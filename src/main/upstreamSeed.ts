// upstreamSeed.ts — EQL Assistant's one-time import from the app it was forked from.
//
// EQL Assistant is a fork of EQ Legends Companion. The two are separate apps (different appId,
// different install dir, different userData), so a player can run either or both. A player who
// switches should lose nothing, so the FIRST launch of EQL Assistant COPIES the original app's
// state out of `%APPDATA%\everquest-companion` into its own dir.
//
// Rules, all of them about never harming the player's data:
//   * COPY, NEVER MOVE. The source dir is never written to; it stays the original app's data and
//     doubles as a backup.
//   * ONCE. The guard is "target dir absent": the seed creates the dir, so it cannot run twice.
//   * EVERYTHING BUT REGENERABLE NOISE. Both apps share the store's FILE NAME
//     (`everquest-companion-progress.json`), so the dir is copied entry by entry under the same
//     names. Chromium caches, crash dumps, lock files and the error log are skipped: they are
//     regenerated on launch, and a copied lock is actively harmful.
//   * BEST-EFFORT PER ENTRY. The original app may be running, and on Windows a file it holds open
//     can refuse to copy. One failed entry is logged and skipped; the rest still arrive.
//
// Electron-free on purpose, so tests/upstreamSeed.test.mts can drive it against real temp dirs.

import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'fs'
import { basename, join } from 'path'

/** Top-level entries of a userData dir that are never worth carrying over. */
export const UPSTREAM_SKIP: ReadonlySet<string> = new Set([
  'Cache',
  'Code Cache',
  'GPUCache',
  'DawnCache',
  'DawnGraphiteCache',
  'DawnWebGPUCache',
  'GrShaderCache',
  'ShaderCache',
  'Crashpad',
  'blob_storage',
  'Session Storage',
  'Shared Dictionary',
  'SharedStorage',
  'SharedStorage-wal',
  'Network',
  'Trust Tokens',
  'Trust Tokens-journal',
  'Local State',
  'Preferences',
  'lockfile',
  'SingletonLock',
  'SingletonCookie',
  'SingletonSocket',
  'errors.log',
  'migrated-from.json'
])

/** File names skipped at ANY depth: a copied leveldb LOCK would wedge the copy's database. */
const SKIP_ANY_DEPTH = new Set(['LOCK', 'lockfile'])

/** Marker written into a seeded dir: what came from where, and when. Same name as channel.ts's. */
export const SEED_STAMP = 'migrated-from.json'

export interface UpstreamSeedResult {
  readonly copied: string[]
  readonly failed: string[]
}

/**
 * Copy the original app's state from `upstream` into `target`, exactly once. Returns what was
 * copied and what could not be; both empty means there was nothing to do.
 */
export function seedFromUpstream(
  target: string,
  upstream: string,
  onError: (entry: string, err: unknown) => void = () => undefined
): UpstreamSeedResult {
  const copied: string[] = []
  const failed: string[] = []
  if (upstream === target || !existsSync(upstream) || existsSync(target)) return { copied, failed }
  let entries: string[]
  try {
    entries = readdirSync(upstream)
    mkdirSync(target, { recursive: true })
  } catch (err) {
    onError(upstream, err)
    return { copied, failed }
  }
  for (const entry of entries) {
    if (UPSTREAM_SKIP.has(entry)) continue
    try {
      cpSync(join(upstream, entry), join(target, entry), {
        recursive: true,
        filter: (src) => !SKIP_ANY_DEPTH.has(basename(src))
      })
      copied.push(entry)
    } catch (err) {
      failed.push(entry)
      onError(entry, err)
    }
  }
  try {
    writeFileSync(
      join(target, SEED_STAMP),
      JSON.stringify({ from: upstream, at: new Date().toISOString(), copied, failed }, null, 2)
    )
  } catch (err) {
    onError(SEED_STAMP, err)
  }
  return { copied, failed }
}
