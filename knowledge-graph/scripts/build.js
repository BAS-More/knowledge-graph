#!/usr/bin/env node
/**
 * Build script that compiles knowledge-graph and inlines knowledge-graph-shared into the dist.
 *
 * Steps:
 *  1. Build knowledge-graph-shared (tsc)
 *  2. Build knowledge-graph (tsc)
 *  3. Copy knowledge-graph-shared/dist → dist/_shared
 *  4. Rewrite bare 'knowledge-graph-shared' specifiers → relative paths
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SHARED_ROOT = path.resolve(ROOT, '..', 'knowledge-graph-shared');
const DIST = path.join(ROOT, 'dist');
const SHARED_DEST = path.join(DIST, '_shared');

// ── 1. Build knowledge-graph-shared ───────────────────────────────────────
console.log('[build] compiling knowledge-graph-shared…');
execSync('npx tsc', { cwd: SHARED_ROOT, stdio: 'inherit' });

// ── 2. Build knowledge-graph ──────────────────────────────────────────────
console.log('[build] compiling knowledge-graph…');
execSync('npx tsc', { cwd: ROOT, stdio: 'inherit' });

// ── 3. Copy shared dist ────────────────────────────────────────────
console.log('[build] copying shared module into dist/_shared…');
fs.cpSync(path.join(SHARED_ROOT, 'dist'), SHARED_DEST, { recursive: true });

// ── 4. Rewrite imports ─────────────────────────────────────────────
console.log('[build] rewriting knowledge-graph-shared imports…');
let rewritten = 0;

function rewriteFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  if (!content.includes('knowledge-graph-shared')) return;

  const relDir = path.relative(path.dirname(filePath), SHARED_DEST);
  // Always use posix separators and point to the package index
  const relImport = relDir.split(path.sep).join('/') + '/index.js';

  const updated = content
    .replace(/from\s+['"]knowledge-graph-shared['"]/g, `from '${relImport}'`)
    .replace(/import\(\s*['"]knowledge-graph-shared['"]\s*\)/g, `import('${relImport}')`);

  if (updated !== content) {
    fs.writeFileSync(filePath, updated);
    rewritten++;
  }
}

function walk(dir, extensions, cb) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, extensions, cb);
    } else if (extensions.some((ext) => entry.name.endsWith(ext))) {
      cb(full);
    }
  }
}

walk(DIST, ['.js', '.d.ts'], rewriteFile);

// ── 5. Make CLI entry executable ────────────────────────────────────
const cliEntry = path.join(DIST, 'cli', 'index.js');
if (fs.existsSync(cliEntry)) fs.chmodSync(cliEntry, 0o755);

console.log(`[build] done — rewrote ${rewritten} files.`);
