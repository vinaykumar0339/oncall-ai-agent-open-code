#!/bin/sh

set -eu

SCRIPT_DIR="$(CDPATH='' cd -- "$(dirname "$0")" && pwd)"
REPO_ROOT="${REPO_ROOT:-$(CDPATH='' cd -- "${SCRIPT_DIR}/../../../.." && pwd)}"
RUNTIME_PLATFORM="${RUNTIME_PLATFORM:-${PLATFORM:-ios}}"
DEFAULT_IOS_APP_ROOT="/Users/vinaykumar/vymo/react-app"
APP_ROOT="${APP_ROOT:-}"
TICKET_KEY="${TICKET_KEY:-${ISSUE_KEY:-unknown-ticket}}"
TMP_TICKET_ROOT="${TMP_TICKET_ROOT:-${REPO_ROOT}/tmp/${TICKET_KEY}/${RUNTIME_PLATFORM}}"
TMP_RUNTIME_DIR="${TMP_RUNTIME_DIR:-${TMP_TICKET_ROOT}/runtime}"
METRO_PORT="${METRO_PORT:-8081}"
METRO_HOST="${METRO_HOST:-127.0.0.1}"
METRO_LOG="${METRO_LOG:-${TMP_RUNTIME_DIR}/metro.log}"
METRO_PIDFILE="${METRO_PIDFILE:-${TMP_RUNTIME_DIR}/metro.pid}"
METRO_STATUS_URL="http://${METRO_HOST}:${METRO_PORT}/status"

if [ -z "${APP_ROOT}" ]; then
  APP_ROOT="${DEFAULT_IOS_APP_ROOT}"
fi

ensure_runtime_dirs() {
  mkdir -p "${TMP_TICKET_ROOT}/logs" "${TMP_TICKET_ROOT}/evidence" "${TMP_RUNTIME_DIR}" "${TMP_TICKET_ROOT}/reports"
}

status_running() {
  if command -v curl >/dev/null 2>&1; then
    if curl -fsS --max-time 2 "${METRO_STATUS_URL}" 2>/dev/null | grep -q "packager-status:running"; then
      return 0
    fi
  fi

  if command -v lsof >/dev/null 2>&1; then
    if lsof -ti "tcp:${METRO_PORT}" >/dev/null 2>&1; then
      return 0
    fi
  fi

  return 1
}

pid_from_pidfile() {
  if [ -f "${METRO_PIDFILE}" ]; then
    cat "${METRO_PIDFILE}"
    return 0
  fi

  return 1
}

pid_from_port() {
  if command -v lsof >/dev/null 2>&1; then
    lsof -ti "tcp:${METRO_PORT}" 2>/dev/null | head -n 1
    return 0
  fi

  return 1
}

active_pid() {
  pid=""

  if pid="$(pid_from_pidfile 2>/dev/null)" && [ -n "${pid}" ]; then
    if kill -0 "${pid}" 2>/dev/null; then
      printf '%s\n' "${pid}"
      return 0
    fi
  fi

  if pid="$(pid_from_port 2>/dev/null)" && [ -n "${pid}" ]; then
    printf '%s\n' "${pid}"
    return 0
  fi

  return 1
}

clear_stale_pidfile() {
  if [ -f "${METRO_PIDFILE}" ]; then
    pid="$(cat "${METRO_PIDFILE}" 2>/dev/null || true)"
    if [ -z "${pid}" ] || ! kill -0 "${pid}" 2>/dev/null; then
      rm -f "${METRO_PIDFILE}"
    fi
  fi
}

wait_for_metro() {
  max_wait="${1:-60}"
  elapsed=0

  while [ "${elapsed}" -lt "${max_wait}" ]; do
    if status_running; then
      return 0
    fi

    sleep 2
    elapsed=$((elapsed + 2))
  done

  return 1
}

print_kv() {
  key="$1"
  value="$2"
  printf '%s=%s\n' "${key}" "${value}"
}
