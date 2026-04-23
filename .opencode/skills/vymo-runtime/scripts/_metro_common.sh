#!/bin/sh

set -eu

SCRIPT_DIR="$(CDPATH='' cd -- "$(dirname "$0")" && pwd)"
REPO_ROOT="${REPO_ROOT:-$(CDPATH='' cd -- "${SCRIPT_DIR}/../../../.." && pwd)}"
RUNTIME_PLATFORM="${RUNTIME_PLATFORM:-${PLATFORM:-ios}}"
DEFAULT_IOS_APP_ROOT="${HOME}/vymo/react-app"
APP_ROOT="${APP_ROOT:-}"
TICKET_KEY="${TICKET_KEY:-${ISSUE_KEY:-unknown-ticket}}"
TMP_TICKET_ROOT="${TMP_TICKET_ROOT:-${REPO_ROOT}/tmp/${TICKET_KEY}/${RUNTIME_PLATFORM}}"
TMP_RUNTIME_DIR="${TMP_RUNTIME_DIR:-${TMP_TICKET_ROOT}/runtime}"
WORKSPACE_RUNTIME_ROOT="${WORKSPACE_RUNTIME_ROOT:-${REPO_ROOT}/tmp/_workspace/react-native-runtime}"
WORKSPACE_LOGS_DIR="${WORKSPACE_LOGS_DIR:-${WORKSPACE_RUNTIME_ROOT}/logs}"
WORKSPACE_RUNTIME_DIR="${WORKSPACE_RUNTIME_DIR:-${WORKSPACE_RUNTIME_ROOT}/runtime}"
METRO_PORT="${METRO_PORT:-8081}"
METRO_HOST="${METRO_HOST:-127.0.0.1}"
METRO_LOG="${METRO_LOG:-${WORKSPACE_LOGS_DIR}/metro.log}"
METRO_PIDFILE="${METRO_PIDFILE:-${WORKSPACE_RUNTIME_DIR}/metro.pid}"
METRO_ENVFILE="${METRO_ENVFILE:-${WORKSPACE_RUNTIME_DIR}/metro.env}"
METRO_LOCKDIR="${METRO_LOCKDIR:-${WORKSPACE_RUNTIME_DIR}/metro.lock}"
METRO_START_COMMAND="${METRO_START_COMMAND:-yarn start}"
METRO_STATUS_URL="http://${METRO_HOST}:${METRO_PORT}/status"

if [ -z "${APP_ROOT}" ]; then
  APP_ROOT="${DEFAULT_IOS_APP_ROOT}"
fi

ensure_runtime_dirs() {
  mkdir -p "${TMP_TICKET_ROOT}/logs" "${TMP_TICKET_ROOT}/evidence" "${TMP_RUNTIME_DIR}" "${TMP_TICKET_ROOT}/reports"
  mkdir -p "${WORKSPACE_LOGS_DIR}" "${WORKSPACE_RUNTIME_DIR}"
}

validate_app_root() {
  [ -d "${APP_ROOT}" ]
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
      rm -f "${METRO_ENVFILE}"
    fi
  fi
}

env_value() {
  key="$1"

  if [ ! -f "${METRO_ENVFILE}" ]; then
    return 1
  fi

  sed -n "s/^${key}=//p" "${METRO_ENVFILE}" | head -n 1
}

write_metro_env() {
  started_pid="$1"

  : > "${METRO_ENVFILE}"
  print_kv "APP_ROOT" "${APP_ROOT}" >> "${METRO_ENVFILE}"
  print_kv "PORT" "${METRO_PORT}" >> "${METRO_ENVFILE}"
  print_kv "PID" "${started_pid}" >> "${METRO_ENVFILE}"
  print_kv "STARTED_BY_TICKET_KEY" "${TICKET_KEY}" >> "${METRO_ENVFILE}"
  print_kv "STARTED_FOR_PLATFORM" "${RUNTIME_PLATFORM}" >> "${METRO_ENVFILE}"
  print_kv "START_COMMAND" "${METRO_START_COMMAND}" >> "${METRO_ENVFILE}"
  print_kv "WORKSPACE_RUNTIME_ROOT" "${WORKSPACE_RUNTIME_ROOT}" >> "${METRO_ENVFILE}"
  print_kv "STARTED_AT_UTC" "$(date -u +"%Y-%m-%dT%H:%M:%SZ")" >> "${METRO_ENVFILE}"
}

release_start_lock() {
  if [ -d "${METRO_LOCKDIR}" ]; then
    lock_pid="$(cat "${METRO_LOCKDIR}/pid" 2>/dev/null || true)"
    if [ -z "${lock_pid}" ] || [ "${lock_pid}" = "$$" ]; then
      rm -f "${METRO_LOCKDIR}/pid"
      rmdir "${METRO_LOCKDIR}" 2>/dev/null || true
    fi
  fi
}

acquire_start_lock() {
  max_wait="${1:-30}"
  elapsed=0

  while ! mkdir "${METRO_LOCKDIR}" 2>/dev/null; do
    lock_pid="$(cat "${METRO_LOCKDIR}/pid" 2>/dev/null || true)"

    if [ -n "${lock_pid}" ] && ! kill -0 "${lock_pid}" 2>/dev/null; then
      rm -f "${METRO_LOCKDIR}/pid"
      rmdir "${METRO_LOCKDIR}" 2>/dev/null || true
      continue
    fi

    if [ "${elapsed}" -ge "${max_wait}" ]; then
      return 1
    fi

    sleep 1
    elapsed=$((elapsed + 1))
  done

  printf '%s\n' "$$" > "${METRO_LOCKDIR}/pid"
  trap 'release_start_lock' EXIT HUP INT TERM
}

report_common_context() {
  print_kv "REQUESTED_TICKET_KEY" "${TICKET_KEY}"
  print_kv "PORT" "${METRO_PORT}"
  print_kv "APP_ROOT" "${APP_ROOT}"
  print_kv "PLATFORM" "${RUNTIME_PLATFORM}"
  print_kv "TMP_TICKET_ROOT" "${TMP_TICKET_ROOT}"
  print_kv "WORKSPACE_RUNTIME_ROOT" "${WORKSPACE_RUNTIME_ROOT}"
  print_kv "LOG" "${METRO_LOG}"
  print_kv "PIDFILE" "${METRO_PIDFILE}"
  print_kv "ENVFILE" "${METRO_ENVFILE}"
  print_kv "START_COMMAND" "${METRO_START_COMMAND}"
  print_kv "STARTED_BY_TICKET_KEY" "$(env_value STARTED_BY_TICKET_KEY 2>/dev/null || printf 'unknown')"
  print_kv "STARTED_FOR_PLATFORM" "$(env_value STARTED_FOR_PLATFORM 2>/dev/null || printf 'unknown')"
  print_kv "STARTED_AT_UTC" "$(env_value STARTED_AT_UTC 2>/dev/null || printf 'unknown')"
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
