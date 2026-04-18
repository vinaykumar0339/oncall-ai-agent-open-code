#!/bin/sh

set -eu

SCRIPT_DIR="$(CDPATH='' cd -- "$(dirname "$0")" && pwd)"
REPO_ROOT="${REPO_ROOT:-$(CDPATH='' cd -- "${SCRIPT_DIR}/../../../.." && pwd)}"
RUNTIME_PLATFORM="${RUNTIME_PLATFORM:-${PLATFORM:-ios}}"
OPENCODE_SESSION_ID="${OPENCODE_SESSION_ID:-${SESSION_ID:-no-opencode-session}}"
TMP_SESSION_ROOT="${TMP_SESSION_ROOT:-${REPO_ROOT}/tmp/${RUNTIME_PLATFORM}/${OPENCODE_SESSION_ID}}"
TMP_LOGS_DIR="${TMP_LOGS_DIR:-${TMP_SESSION_ROOT}/logs}"
TMP_EVIDENCE_DIR="${TMP_EVIDENCE_DIR:-${TMP_SESSION_ROOT}/evidence}"
TMP_RUNTIME_DIR="${TMP_RUNTIME_DIR:-${TMP_SESSION_ROOT}/runtime}"
TMP_REPORTS_DIR="${TMP_REPORTS_DIR:-${TMP_SESSION_ROOT}/reports}"

mkdir -p "${TMP_LOGS_DIR}" "${TMP_EVIDENCE_DIR}" "${TMP_RUNTIME_DIR}" "${TMP_REPORTS_DIR}"

print_kv() {
  key="$1"
  value="$2"
  printf '%s=%s\n' "${key}" "${value}"
}

print_kv "STATUS" "ready"
print_kv "PLATFORM" "${RUNTIME_PLATFORM}"
print_kv "OPENCODE_SESSION_ID" "${OPENCODE_SESSION_ID}"
print_kv "TMP_SESSION_ROOT" "${TMP_SESSION_ROOT}"
print_kv "LOGS_DIR" "${TMP_LOGS_DIR}"
print_kv "EVIDENCE_DIR" "${TMP_EVIDENCE_DIR}"
print_kv "RUNTIME_DIR" "${TMP_RUNTIME_DIR}"
print_kv "REPORTS_DIR" "${TMP_REPORTS_DIR}"
