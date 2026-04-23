#!/bin/sh

set -eu

SCRIPT_DIR="$(CDPATH='' cd -- "$(dirname "$0")" && pwd)"
. "${SCRIPT_DIR}/_metro_common.sh"

ensure_runtime_dirs
clear_stale_pidfile

if ! validate_app_root; then
  print_kv "STATUS" "failed"
  print_kv "ERROR" "missing_app_root"
  report_common_context
  exit 1
fi

if status_running; then
  pid="$(active_pid || true)"
  print_kv "STATUS" "reused"
  print_kv "PID" "${pid:-unknown}"
  report_common_context
  exit 0
fi

if ! acquire_start_lock 30; then
  print_kv "STATUS" "failed"
  print_kv "ERROR" "lock_timeout"
  report_common_context
  exit 1
fi

clear_stale_pidfile

if status_running; then
  pid="$(active_pid || true)"
  print_kv "STATUS" "reused"
  print_kv "PID" "${pid:-unknown}"
  report_common_context
  exit 0
fi

cd "${APP_ROOT}"

nohup ${METRO_START_COMMAND} >>"${METRO_LOG}" 2>&1 &
pid="$!"
printf '%s\n' "${pid}" >"${METRO_PIDFILE}"

if wait_for_metro 90; then
  write_metro_env "${pid}"
  print_kv "STATUS" "started"
  print_kv "PID" "${pid}"
  report_common_context
  exit 0
fi

print_kv "STATUS" "failed"
print_kv "PID" "${pid}"
report_common_context
echo "LAST_LOG_LINES<<EOF"
tail -n 40 "${METRO_LOG}" 2>/dev/null || true
echo "EOF"
exit 1
