// EQL Assistant's first-launch import from EQ Legends Companion (src/main/upstreamSeed.ts),
// driven against real temp dirs. No Electron, never skips.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { SEED_STAMP, seedFromUpstream } from '../src/main/upstreamSeed'

function withDirs(fn: (base: string) => void): void {
  const base = mkdtempSync(join(tmpdir(), 'eql-seed-'))
  try {
    fn(base)
  } finally {
    rmSync(base, { recursive: true, force: true })
  }
}

function plantUpstream(dir: string): void {
  mkdirSync(join(dir, 'soundpacks', 'alan-rickman'), { recursive: true })
  writeFileSync(join(dir, 'soundpacks', 'alan-rickman', 'manifest.json'), '{"pack":true}')
  writeFileSync(join(dir, 'everquest-companion-progress.json'), '{"schemaVersion":11}')
  writeFileSync(join(dir, 'message-overlay.json'), '{}')
  mkdirSync(join(dir, 'Local Storage', 'leveldb'), { recursive: true })
  writeFileSync(join(dir, 'Local Storage', 'leveldb', '000003.log'), 'prefs')
  writeFileSync(join(dir, 'Local Storage', 'leveldb', 'LOCK'), '')
  // Regenerable noise that must stay behind.
  mkdirSync(join(dir, 'Cache'), { recursive: true })
  writeFileSync(join(dir, 'Cache', 'data_0'), 'x')
  writeFileSync(join(dir, 'errors.log'), 'old errors')
  writeFileSync(join(dir, 'lockfile'), '')
}

test('copies the original app state, skips caches and locks, and stamps the import', () => {
  withDirs((base) => {
    const upstream = join(base, 'everquest-companion')
    const target = join(base, 'eql-assistant')
    plantUpstream(upstream)

    const { copied, failed } = seedFromUpstream(target, upstream)

    assert.deepEqual(failed, [])
    assert.ok(copied.includes('everquest-companion-progress.json'))
    assert.equal(readFileSync(join(target, 'everquest-companion-progress.json'), 'utf8'), '{"schemaVersion":11}')
    assert.ok(existsSync(join(target, 'soundpacks', 'alan-rickman', 'manifest.json')))
    assert.ok(existsSync(join(target, 'message-overlay.json')))
    assert.ok(existsSync(join(target, 'Local Storage', 'leveldb', '000003.log')), 'renderer prefs travel')
    assert.ok(!existsSync(join(target, 'Local Storage', 'leveldb', 'LOCK')), 'a leveldb LOCK never travels')
    assert.ok(!existsSync(join(target, 'Cache')), 'caches stay behind')
    assert.ok(!existsSync(join(target, 'errors.log')), 'the old error log stays behind')
    assert.ok(!existsSync(join(target, 'lockfile')), 'the lockfile stays behind')

    const stamp = JSON.parse(readFileSync(join(target, SEED_STAMP), 'utf8')) as { from: string }
    assert.equal(stamp.from, upstream)
  })
})

test('the original dir is never modified', () => {
  withDirs((base) => {
    const upstream = join(base, 'everquest-companion')
    plantUpstream(upstream)
    seedFromUpstream(join(base, 'eql-assistant'), upstream)
    assert.equal(readFileSync(join(upstream, 'errors.log'), 'utf8'), 'old errors')
    assert.ok(existsSync(join(upstream, 'Local Storage', 'leveldb', 'LOCK')))
    assert.ok(!existsSync(join(upstream, SEED_STAMP)))
  })
})

test('runs once: an existing target is never touched', () => {
  withDirs((base) => {
    const upstream = join(base, 'everquest-companion')
    const target = join(base, 'eql-assistant')
    plantUpstream(upstream)
    mkdirSync(target)
    writeFileSync(join(target, 'everquest-companion-progress.json'), '{"mine":true}')

    const result = seedFromUpstream(target, upstream)

    assert.deepEqual(result, { copied: [], failed: [] })
    assert.equal(readFileSync(join(target, 'everquest-companion-progress.json'), 'utf8'), '{"mine":true}')
  })
})

test('no original app installed: nothing happens and no dir is created', () => {
  withDirs((base) => {
    const target = join(base, 'eql-assistant')
    assert.deepEqual(seedFromUpstream(target, join(base, 'everquest-companion')), { copied: [], failed: [] })
    assert.ok(!existsSync(target))
  })
})
