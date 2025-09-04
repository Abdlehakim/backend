#!/usr/bin/env bash
set -e
echo "[entrypoint] RUN_MODE=${RUN_MODE:-api}"

if [ "$RUN_MODE" = "worker" ]; then
  echo "[entrypoint] starting invoice worker..."
  exec node -r module-alias/register dist/src/jobs/invoiceWorker.js
else
  echo "[entrypoint] starting api server..."
  exec node -r module-alias/register dist/app.js
fi
