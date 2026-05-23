#!/usr/bin/env node
/**
 * Stops stale Next.js dev servers and removes the dev lock file.
 * Run: npm run dev:stop
 */
import { execSync } from 'node:child_process';
import { unlinkSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const PORTS = [3000, 3001];
const lockPath = join(process.cwd(), '.next', 'dev', 'lock');

function killPortWindows(port) {
  try {
    const out = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });
    const pids = new Set();
    for (const line of out.split('\n')) {
      if (!line.includes('LISTENING')) continue;
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && /^\d+$/.test(pid)) pids.add(pid);
    }
    for (const pid of pids) {
      try {
        execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
        console.log(`Stopped PID ${pid} (port ${port})`);
      } catch {
        /* already gone */
      }
    }
  } catch {
    /* no process on port */
  }
}

function killPortUnix(port) {
  try {
    execSync(`lsof -ti:${port} | xargs kill -9 2>/dev/null`, { shell: true, stdio: 'ignore' });
    console.log(`Cleared port ${port}`);
  } catch {
    /* no process */
  }
}

const killPort = process.platform === 'win32' ? killPortWindows : killPortUnix;

for (const port of PORTS) {
  killPort(port);
}

if (existsSync(lockPath)) {
  try {
    const lock = JSON.parse(readFileSync(lockPath, 'utf8'));
    console.log(`Removing dev lock (was PID ${lock.pid ?? 'unknown'})`);
  } catch {
    console.log('Removing dev lock file');
  }
  unlinkSync(lockPath);
}

console.log('Done. You can run: npm run dev');
