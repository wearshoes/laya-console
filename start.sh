#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

if [[ -f laya-console.pid ]]; then
  old=$(cat laya-console.pid || true)
  if [[ -n "${old}" ]] && kill -0 "$old" 2>/dev/null; then
    kill "$old" 2>/dev/null || true
    sleep 1
  fi
fi
if command -v fuser >/dev/null 2>&1; then
  fuser -k 8787/tcp 2>/dev/null || true
  sleep 0.5
fi

if [[ -f .env.local ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env.local
  set +a
fi

export PORT="${PORT:-8787}"
export HOSTNAME="${HOST:-127.0.0.1}"

if [[ ! -d .next ]]; then
  echo "No .next build — running npm run build"
  npm run build
fi

nohup npm run start >> laya-console.log 2>&1 &
echo $! > laya-console.pid
echo "laya-console pid=$(cat laya-console.pid) on ${HOSTNAME}:${PORT}"
