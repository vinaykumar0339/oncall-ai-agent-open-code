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
  report_common_context
  exit 0
fi

print_kv "STATUS" "not_running"
report_common_context
exit 1
