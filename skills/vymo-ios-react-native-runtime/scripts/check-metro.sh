#!/bin/sh

set -eu

SCRIPT_DIR="$(CDPATH='' cd -- "$(dirname "$0")" && pwd)"
. "${SCRIPT_DIR}/_metro_common.sh"

clear_stale_pidfile

if status_running; then
  pid="$(active_pid || true)"
  print_kv "STATUS" "running"
  print_kv "PID" "${pid:-unknown}"
  print_kv "PORT" "${METRO_PORT}"
  print_kv "APP_ROOT" "${APP_ROOT}"
  print_kv "LOG" "${METRO_LOG}"
  exit 0
fi

print_kv "STATUS" "not_running"
print_kv "PORT" "${METRO_PORT}"
print_kv "APP_ROOT" "${APP_ROOT}"
print_kv "LOG" "${METRO_LOG}"
exit 1
