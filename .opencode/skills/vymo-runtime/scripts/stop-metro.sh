#!/bin/sh

set -eu

SCRIPT_DIR="$(CDPATH='' cd -- "$(dirname "$0")" && pwd)"
. "${SCRIPT_DIR}/_metro_common.sh"

ensure_runtime_dirs
clear_stale_pidfile

pid="$(active_pid || true)"

if [ -z "${pid}" ]; then
  print_kv "STATUS" "not_running"
  report_common_context
  rm -f "${METRO_PIDFILE}"
  rm -f "${METRO_ENVFILE}"
  exit 0
fi

kill "${pid}" 2>/dev/null || true

elapsed=0
while [ "${elapsed}" -lt 10 ]; do
  if ! kill -0 "${pid}" 2>/dev/null; then
    rm -f "${METRO_PIDFILE}"
    rm -f "${METRO_ENVFILE}"
    print_kv "STATUS" "stopped"
    print_kv "PID" "${pid}"
    report_common_context
    exit 0
  fi

  sleep 1
  elapsed=$((elapsed + 1))
done

kill -9 "${pid}" 2>/dev/null || true
rm -f "${METRO_PIDFILE}"
rm -f "${METRO_ENVFILE}"
print_kv "STATUS" "stopped"
print_kv "PID" "${pid}"
report_common_context
