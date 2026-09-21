#!/usr/bin/env bash
set -euo pipefail

IMAGE_NAME="ghcr.io/noobcity99/ctroadmap:beta"
INSTALL_DIR="${CTR_INSTALL_DIR:-$HOME/ctroadmap-beta}"
COMPOSE_FILE=""
# Filled only by scripts/prepare_update_release.py after committed/public byte verification.
UPDATER_URL="https://raw.githubusercontent.com/NoobCity99/CTRoadmap/9ba3c494a6a8a64c52a555c74d69af9014958cc9/ctr_update.sh"
UPDATER_SHA256="8ba879f54a9d35fb8ef515076dc4ad18c23ad837991c4b07f138d336500c86b0"
UPDATER_TEMP=""

cleanup_updater_download() {
  if [[ -n "$UPDATER_TEMP" ]]; then rm -f -- "$UPDATER_TEMP"; fi
}
trap cleanup_updater_download EXIT

fail() {
  echo "ERROR: $*" >&2
  exit 1
}

check_command() {
  command -v "$1" >/dev/null 2>&1 || fail "$1 is required but was not found."
}

check_prerequisites() {
  [[ "$UPDATER_URL" =~ ^https://raw\.githubusercontent\.com/NoobCity99/CTRoadmap/[0-9a-f]{40}/ctr_update\.sh$ ]] ||
    fail "This installer has no verified updater release. Use a published installer after release asset preparation."
  [[ "$UPDATER_SHA256" =~ ^[0-9a-f]{64}$ ]] || fail "The updater checksum has not been finalized."
  check_command docker
  check_command curl
  check_command sha256sum
  check_command mktemp

  if ! docker compose version >/dev/null 2>&1; then
    fail "Docker Compose v2 is required. Install the Docker Compose plugin and retry."
  fi

  if ! docker info >/dev/null 2>&1; then
    fail "Docker is installed, but the daemon is not reachable by this user."
  fi
}

register_host_updater() {
  UPDATER_TEMP="$(mktemp)" || return 1
  curl --proto =https --tlsv1.2 -fsSL "$UPDATER_URL" -o "$UPDATER_TEMP" || return 1
  printf '%s  %s\n' "$UPDATER_SHA256" "$UPDATER_TEMP" | sha256sum --check --status || return 1
  chmod +x "$UPDATER_TEMP" || return 1
  bash "$UPDATER_TEMP" --register-only --install-dir "$INSTALL_DIR" || return 1
}

write_compose_file() {
  if [[ -f "$COMPOSE_FILE" ]]; then
    local timestamp
    timestamp="$(date +%Y%m%d%H%M%S)"
    cp "$COMPOSE_FILE" "$COMPOSE_FILE.backup-$timestamp"
    echo "Backed up existing docker-compose.yml to docker-compose.yml.backup-$timestamp"
  fi

  cat > "$COMPOSE_FILE" <<COMPOSE
services:
  ctroadmap:
    image: $IMAGE_NAME
    container_name: ctroadmap-beta
    ports:
      - "8088:8088"
    volumes:
      - ./data:/app/data
      - ./exports:/app/exports
    restart: unless-stopped
COMPOSE
}

print_final_instructions() {
  local quoted_install_dir
  printf -v quoted_install_dir '%q' "$INSTALL_DIR"
  cat <<EOF

CTRoadmap beta is installed.

Install directory:
  $INSTALL_DIR

Open the app:
  Local:      http://localhost:8088
  Server/LAN: http://SERVER-IP:8088

Manage CTRoadmap:
  cd $quoted_install_dir
  docker compose logs -f
  docker compose down
  docker compose up -d
  ./ctr_update.sh

Uninstall:
  curl -fsSL https://raw.githubusercontent.com/NoobCity99/CTRoadmap/main/CTR_uninstall.sh -o CTR_uninstall.sh
  chmod +x CTR_uninstall.sh
  ./CTR_uninstall.sh

Persistent files:
  $INSTALL_DIR/data
  $INSTALL_DIR/exports
EOF
}

main() {
  echo "Installing CTRoadmap beta from $IMAGE_NAME"
  echo "Install directory: $INSTALL_DIR"

  check_prerequisites

  mkdir -p "$INSTALL_DIR/data" "$INSTALL_DIR/exports"
  INSTALL_DIR="$(cd "$INSTALL_DIR" && pwd -P)"
  COMPOSE_FILE="$INSTALL_DIR/docker-compose.yml"
  write_compose_file

  cd "$INSTALL_DIR"
  docker compose pull
  docker compose up -d

  if ! register_host_updater; then
    fail "CTRoadmap was installed, but host updater setup failed. The application has not been stopped or deleted. Review the error and use the registration-only recovery instructions in README.md."
  fi

  print_final_instructions
}

main "$@"
