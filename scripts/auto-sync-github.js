#!/usr/bin/env node

const { execSync, spawnSync } = require('node:child_process');

const POLL_MS = Number.parseInt(process.env.AUTO_SYNC_INTERVAL_MS || '5000', 10);
const INCLUDE_UNTRACKED = process.env.AUTO_SYNC_INCLUDE_UNTRACKED === '1';
const COMMIT_PREFIX = process.env.AUTO_SYNC_COMMIT_PREFIX || 'chore(auto-sync): update';

let isSyncing = false;
let timer = null;

function now() {
    return new Date().toISOString();
}

function log(message) {
    process.stdout.write(`[${now()}] ${message}\n`);
}

function run(command, options = {}) {
    return execSync(command, {
        stdio: ['ignore', 'pipe', 'pipe'],
        encoding: 'utf8',
        ...options,
    }).trim();
}

function runQuiet(command) {
    const result = spawnSync(command, {
        shell: true,
        stdio: 'ignore',
    });
    return result.status === 0;
}

function ensureGitReady() {
    try {
        run('git rev-parse --is-inside-work-tree');
    } catch {
        throw new Error('Current directory is not a git repository.');
    }

    let branch = '';
    try {
        branch = run('git rev-parse --abbrev-ref HEAD');
    } catch {
        throw new Error('Unable to detect current git branch.');
    }

    if (!branch || branch === 'HEAD') {
        throw new Error('Detached HEAD is not supported for auto sync. Please checkout a branch first.');
    }

    try {
        run('git remote get-url origin');
    } catch {
        throw new Error('Remote origin is not configured. Run: git remote add origin <repo-url>');
    }

    return branch;
}

function getWorkingTreeStatus() {
    const untrackedFlag = INCLUDE_UNTRACKED ? '' : '--untracked-files=no';
    return run(`git status --porcelain ${untrackedFlag}`);
}

function stageChanges() {
    if (INCLUDE_UNTRACKED) {
        run('git add -A');
        return;
    }
    run('git add -u');
}

function hasStagedChanges() {
    return !runQuiet('git diff --cached --quiet');
}

function hasUpstreamBranch() {
    return runQuiet('git rev-parse --abbrev-ref --symbolic-full-name @{u}');
}

function commitChanges() {
    const stamp = new Date().toISOString().replace('T', ' ').replace('Z', ' UTC');
    const message = `${COMMIT_PREFIX} (${stamp})`;

    try {
        run(`git commit -m "${message.replaceAll('"', '\\"')}"`);
        log(`Committed: ${message}`);
        return true;
    } catch (error) {
        const stderr = String(error.stderr || '').toLowerCase();
        if (stderr.includes('nothing to commit')) {
            return false;
        }
        throw error;
    }
}

function pushChanges(branch) {
    if (hasUpstreamBranch()) {
        run('git push');
    } else {
        run(`git push -u origin ${branch}`);
    }
    log(`Pushed to remote branch: ${branch}`);
}

async function syncOnce(branch) {
    if (isSyncing) {
        return;
    }

    isSyncing = true;
    try {
        const status = getWorkingTreeStatus();
        if (!status) {
            return;
        }

        log('Detected changes. Syncing to GitHub...');
        stageChanges();

        if (!hasStagedChanges()) {
            return;
        }

        const committed = commitChanges();
        if (!committed) {
            return;
        }

        pushChanges(branch);
    } catch (error) {
        const stderr = String(error.stderr || '').trim();
        const detail = stderr || String(error.message || error);
        log(`Sync failed: ${detail}`);
    } finally {
        isSyncing = false;
    }
}

function stop() {
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
    log('Auto sync stopped.');
    process.exit(0);
}

function main() {
    if (!Number.isFinite(POLL_MS) || POLL_MS < 1000) {
        throw new Error('AUTO_SYNC_INTERVAL_MS must be a number >= 1000.');
    }

    const branch = ensureGitReady();

    log('Auto sync started.');
    log(`Branch: ${branch}`);
    log(`Interval: ${POLL_MS}ms`);
    log(`Include untracked files: ${INCLUDE_UNTRACKED ? 'yes' : 'no'}`);

    timer = setInterval(() => {
        void syncOnce(branch);
    }, POLL_MS);

    void syncOnce(branch);

    process.on('SIGINT', stop);
    process.on('SIGTERM', stop);
}

try {
    main();
} catch (error) {
    process.stderr.write(`auto-sync-github error: ${String(error.message || error)}\n`);
    process.exit(1);
}
