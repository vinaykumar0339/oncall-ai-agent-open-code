#!/bin/sh

set -eu

SCRIPT_DIR="$(CDPATH='' cd -- "$(dirname "$0")" && pwd)"
REPO_ROOT="${REPO_ROOT:-$(CDPATH='' cd -- "${SCRIPT_DIR}/../../../.." && pwd)}"
RUNTIME_PLATFORM="${RUNTIME_PLATFORM:-${PLATFORM:-ios}}"
TICKET_KEY="${TICKET_KEY:-${ISSUE_KEY:-unknown-ticket}}"
TMP_TICKET_ROOT="${TMP_TICKET_ROOT:-${REPO_ROOT}/tmp/${TICKET_KEY}/${RUNTIME_PLATFORM}}"
TMP_LOGS_DIR="${TMP_LOGS_DIR:-${TMP_TICKET_ROOT}/logs}"
TMP_EVIDENCE_DIR="${TMP_EVIDENCE_DIR:-${TMP_TICKET_ROOT}/evidence}"
TMP_RUNTIME_DIR="${TMP_RUNTIME_DIR:-${TMP_TICKET_ROOT}/runtime}"
TMP_REPORTS_DIR="${TMP_REPORTS_DIR:-${TMP_TICKET_ROOT}/reports}"

mkdir -p "${TMP_LOGS_DIR}" "${TMP_EVIDENCE_DIR}" "${TMP_RUNTIME_DIR}" "${TMP_REPORTS_DIR}"

print_kv() {
  key="$1"
  value="$2"
  printf '%s=%s\n' "${key}" "${value}"
}

print_kv "STATUS" "ready"
print_kv "TICKET_KEY" "${TICKET_KEY}"
print_kv "PLATFORM" "${RUNTIME_PLATFORM}"
print_kv "TMP_TICKET_ROOT" "${TMP_TICKET_ROOT}"
print_kv "LOGS_DIR" "${TMP_LOGS_DIR}"
print_kv "EVIDENCE_DIR" "${TMP_EVIDENCE_DIR}"
print_kv "RUNTIME_DIR" "${TMP_RUNTIME_DIR}"
print_kv "REPORTS_DIR" "${TMP_REPORTS_DIR}"
