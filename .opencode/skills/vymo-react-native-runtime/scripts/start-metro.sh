#!/bin/sh

set -eu

SCRIPT_DIR="$(CDPATH='' cd -- "$(dirname "$0")" && pwd)"
. "${SCRIPT_DIR}/_metro_common.sh"

ensure_runtime_dirs
clear_stale_pidfile

if status_running; then
  pid="$(active_pid || true)"
  print_kv "STATUS" "reused"
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

cd "${APP_ROOT}"

nohup yarn start >>"${METRO_LOG}" 2>&1 &
pid="$!"
printf '%s\n' "${pid}" >"${METRO_PIDFILE}"

if wait_for_metro 90; then
  print_kv "STATUS" "started"
  print_kv "PID" "${pid}"
  print_kv "PORT" "${METRO_PORT}"
  print_kv "APP_ROOT" "${APP_ROOT}"
  print_kv "PLATFORM" "${RUNTIME_PLATFORM}"
  print_kv "SESSION_ID" "${SESSION_ID}"
  print_kv "TMP_SESSION_ROOT" "${TMP_SESSION_ROOT}"
  print_kv "LOG" "${METRO_LOG}"
  print_kv "PIDFILE" "${METRO_PIDFILE}"
  exit 0
fi

print_kv "STATUS" "failed"
print_kv "PID" "${pid}"
print_kv "PORT" "${METRO_PORT}"
print_kv "APP_ROOT" "${APP_ROOT}"
print_kv "PLATFORM" "${RUNTIME_PLATFORM}"
print_kv "SESSION_ID" "${SESSION_ID}"
print_kv "TMP_SESSION_ROOT" "${TMP_SESSION_ROOT}"
print_kv "LOG" "${METRO_LOG}"
print_kv "PIDFILE" "${METRO_PIDFILE}"
echo "LAST_LOG_LINES<<EOF"
tail -n 40 "${METRO_LOG}" 2>/dev/null || true
echo "EOF"
exit 1
