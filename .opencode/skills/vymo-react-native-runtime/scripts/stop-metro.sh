#!/bin/sh

set -eu

SCRIPT_DIR="$(CDPATH='' cd -- "$(dirname "$0")" && pwd)"
. "${SCRIPT_DIR}/_metro_common.sh"

ensure_runtime_dirs
clear_stale_pidfile

pid="$(active_pid || true)"

if [ -z "${pid}" ]; then
  print_kv "STATUS" "not_running"
  print_kv "PORT" "${METRO_PORT}"
  print_kv "PLATFORM" "${RUNTIME_PLATFORM}"
  print_kv "OPENCODE_SESSION_ID" "${OPENCODE_SESSION_ID}"
  print_kv "TMP_SESSION_ROOT" "${TMP_SESSION_ROOT}"
  print_kv "LOG" "${METRO_LOG}"
  print_kv "PIDFILE" "${METRO_PIDFILE}"
  rm -f "${METRO_PIDFILE}"
  exit 0
fi

kill "${pid}" 2>/dev/null || true

elapsed=0
while [ "${elapsed}" -lt 10 ]; do
  if ! kill -0 "${pid}" 2>/dev/null; then
    rm -f "${METRO_PIDFILE}"
    print_kv "STATUS" "stopped"
    print_kv "PID" "${pid}"
    print_kv "PORT" "${METRO_PORT}"
    print_kv "PLATFORM" "${RUNTIME_PLATFORM}"
    print_kv "OPENCODE_SESSION_ID" "${OPENCODE_SESSION_ID}"
    print_kv "TMP_SESSION_ROOT" "${TMP_SESSION_ROOT}"
    print_kv "LOG" "${METRO_LOG}"
    print_kv "PIDFILE" "${METRO_PIDFILE}"
    exit 0
  fi

  sleep 1
  elapsed=$((elapsed + 1))
done

kill -9 "${pid}" 2>/dev/null || true
rm -f "${METRO_PIDFILE}"
print_kv "STATUS" "stopped"
print_kv "PID" "${pid}"
print_kv "PORT" "${METRO_PORT}"
print_kv "PLATFORM" "${RUNTIME_PLATFORM}"
print_kv "OPENCODE_SESSION_ID" "${OPENCODE_SESSION_ID}"
print_kv "TMP_SESSION_ROOT" "${TMP_SESSION_ROOT}"
print_kv "LOG" "${METRO_LOG}"
print_kv "PIDFILE" "${METRO_PIDFILE}"
