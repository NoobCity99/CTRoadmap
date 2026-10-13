#!/usr/bin/env bash
# Trusted bootstrap only. ctr_update.sh owns installation and integration.
set -Eeuo pipefail

# Retained legacy pins. Only verified public preparation changes these.
# Private kits pin a separate installer copy.
UPDATER_URL="https://raw.githubusercontent.com/NoobCity99/CTRoadmap/2ea382b5f1ea982c6c7ed6b90d9b4f8acce30d0e/ctr_update.sh"
UPDATER_SHA256="015ba16f3c42d114da94f9f6b4b5b855f69d9117a893c030871f25cf6b909a75"
INSTALL_DIR="${CTR_INSTALL_DIR:-$HOME/ctroadmap-beta}"
ASSETS_DIR=""
HEALTH_TIMEOUT="${CTR_UPDATE_HEALTH_TIMEOUT:-90}"
TEMP=""

fail() { printf 'ERROR: %s\n' "$*" >&2; exit 1; }
cleanup() { if [[ -n "$TEMP" ]]; then rm -rf -- "$TEMP"; fi; }
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

while [[ $# -gt 0 ]]; do
  case "$1" in
    --install-dir|--release-assets-dir|--health-timeout)
      [[ $# -ge 2 ]] || fail "$1 requires a value."
      case "$1" in
        --install-dir) INSTALL_DIR="$2" ;;
        --release-assets-dir) ASSETS_DIR="$2" ;;
        --health-timeout) HEALTH_TIMEOUT="$2" ;;
      esac
      shift 2 ;;
    -h|--help)
      printf '%s\n' 'Usage: CTR_install.sh [--install-dir PATH] [--health-timeout SECONDS] [--release-assets-dir PATH]'
      exit 0 ;;
    *) fail "Unknown option: $1" ;;
  esac
done

[[ "$HEALTH_TIMEOUT" =~ ^[1-9][0-9]*$ ]] || fail "Health timeout must be positive."
[[ "$(uname -s)" == Linux ]] || fail "The standard installer supports Linux."
case "$(uname -m)" in x86_64|amd64|aarch64|arm64) ;; *) fail "Unsupported host architecture." ;; esac
for command in docker curl sha256sum mktemp timeout head wc bash; do
  command -v "$command" >/dev/null || fail "$command is required."
done
docker compose version >/dev/null || fail "Docker Compose v2 is required."
docker info >/dev/null || fail "Docker is not accessible to this user."
[[ -z "${COMPOSE_FILE:-}" ]] || fail "COMPOSE_FILE overrides are unsupported."
[[ -z "${COMPOSE_ENV_FILES:-}" ]] || fail "COMPOSE_ENV_FILES is unsupported; use the installation's .env file."
[[ "$INSTALL_DIR" != *$'\n'* && "$INSTALL_DIR" != *$'\r'* ]] || fail "Invalid installation path."
if [[ -d "$INSTALL_DIR" ]]; then
  INSTALL_DIR="$(cd -P -- "$INSTALL_DIR" && pwd)"
else
  parent="$(cd -P -- "$(dirname -- "$INSTALL_DIR")" && pwd)" || fail "Create the parent installation directory first."
  INSTALL_DIR="$parent/$(basename -- "$INSTALL_DIR")"
fi
[[ "$INSTALL_DIR" != / ]] || fail "The filesystem root cannot be an installation destination."
[[ ! -e "$INSTALL_DIR" || ( -d "$INSTALL_DIR" && -w "$INSTALL_DIR" ) ]] || fail "Installation destination must be a writable directory."
for file in docker-compose.yml docker-compose.yaml compose.yml compose.yaml docker-compose.override.yml docker-compose.override.yaml compose.override.yml compose.override.yaml .env; do
  [[ ! -e "$INSTALL_DIR/$file" && ! -L "$INSTALL_DIR/$file" ]] || fail "Existing Compose installation: use ctr_update.sh --install-dir PATH."
done
if [[ -e "$INSTALL_DIR/.ctr-install.json" || -L "$INSTALL_DIR/.ctr-install.json" ]]; then
  [[ -f "$INSTALL_DIR/.ctr-install.json" && ! -L "$INSTALL_DIR/.ctr-install.json" ]] || fail "Installation recovery record must be a regular file."
  # The verified updater checks the structured record and exact path identities.
else
  for file in data exports imports tools ctr_update.sh; do
    [[ ! -e "$INSTALL_DIR/$file" && ! -L "$INSTALL_DIR/$file" ]] || fail "Fresh destination conflicts with managed path: $file"
  done
fi
[[ "$UPDATER_SHA256" =~ ^[0-9a-f]{64}$ ]] || fail "This installer has no verified updater release."
umask 077
TEMP="$(mktemp -d)"
candidate="$TEMP/ctr_update.sh"
if [[ -n "$ASSETS_DIR" ]]; then
  ASSETS_DIR="$(cd -P -- "$ASSETS_DIR" && pwd)" || fail "Local asset directory does not exist."
  [[ "${CTR_RELEASE_DESCRIPTOR_SHA256:-}" =~ ^[0-9a-f]{64}$ ]] || fail "Use the reviewed private-kit launcher."
  [[ -f "$ASSETS_DIR/ctr_update.sh" && ! -L "$ASSETS_DIR/ctr_update.sh" ]] || fail "Missing/unsafe local updater."
  head -c 1048577 -- "$ASSETS_DIR/ctr_update.sh" > "$candidate"
  [[ "$(wc -c < "$candidate")" -le 1048576 ]] || fail "Updater exceeds size limit."
else
  [[ "$UPDATER_URL" =~ ^https://raw\.githubusercontent\.com/NoobCity99/CTRoadmap/[0-9a-f]{40}/ctr_update\.sh$ ]] || fail "This installer has no verified updater release."
  curl --proto '=https' --proto-redir '=https' --tlsv1.2 --connect-timeout 10 --max-time 60 --max-redirs 3 -fsSL "$UPDATER_URL" |
    head -c 1048577 > "$candidate" || fail "Updater download failed; no application was started."
  [[ "$(wc -c < "$candidate")" -le 1048576 ]] || fail "Updater exceeds size limit."
fi
printf '%s  %s\n' "$UPDATER_SHA256" "$candidate" | sha256sum --check --status || fail "Updater checksum mismatch; no application was started."
bash -n "$candidate" || fail "Updater syntax validation failed."
version="$(timeout -k 2 10 bash "$candidate" --version | head -c 257)" || fail "Updater version probe failed."
[[ "$version" =~ ^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$ ]] || fail "Invalid updater version."
[[ "${BASH_REMATCH[1]}" -gt 0 || "${BASH_REMATCH[2]}" -ge 2 ]] || fail "Pinned legacy updater is below 0.2.0; use a finalized release installer or reviewed private test kit."
operation=(--install --install-dir "$INSTALL_DIR" --health-timeout "$HEALTH_TIMEOUT")
[[ -z "$ASSETS_DIR" ]] || operation+=(--release-assets-dir "$ASSETS_DIR")
bash "$candidate" "${operation[@]}"
printf 'Installation verified. Run updates with: %q --install-dir %q\n' "$INSTALL_DIR/ctr_update.sh" "$INSTALL_DIR"
