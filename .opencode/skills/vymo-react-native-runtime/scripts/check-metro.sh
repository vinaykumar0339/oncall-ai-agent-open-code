#!/bin/sh

set -eu

SCRIPT_DIR="$(CDPATH='' cd -- "$(dirname "$0")" && pwd)"
. "${SCRIPT_DIR}/_metro_common.sh"

ensure_runtime_dirs
clear_stale_pidfile

if status_running; then
  pid="$(active_pid || true)"
  print_kv "STATUS" "running"
  print_kv "PID" "${pid:-unknown}"
  print_kv "PORT" "${METRO_PORT}"
  print_kv "APP_ROOT" "${APP_ROOT}"
  print_kv "PLATFORM" "${RUNTIME_PLATFORM}"
  print_kv "SESSION_ID" "${SESSION_ID}"
  print_kv "TMP_SESSION_ROOT" "${TMP_SESSION_ROOT}"
  print_kv "LOG" "${METRO_LOG}"
  print_kv "PIDFILE" "${METRO_PIDFILE}"
  exit 0
fi

print_kv "STATUS" "not_running"
print_kv "PORT" "${METRO_PORT}"
print_kv "APP_ROOT" "${APP_ROOT}"
print_kv "PLATFORM" "${RUNTIME_PLATFORM}"
print_kv "SESSION_ID" "${SESSION_ID}"
print_kv "TMP_SESSION_ROOT" "${TMP_SESSION_ROOT}"
print_kv "LOG" "${METRO_LOG}"
print_kv "PIDFILE" "${METRO_PIDFILE}"
exit 1
