#!/usr/bin/env bash
set -euo pipefail

IMAGE_NAME="ghcr.io/noobcity99/ctroadmap:beta"
INSTALL_DIR="${CTR_INSTALL_DIR:-$(pwd)}"
COMPOSE_FILE="$INSTALL_DIR/docker-compose.yml"

fail() {
  echo "ERROR: $*" >&2
  exit 1
}

check_command() {
  command -v "$1" >/dev/null 2>&1 || fail "$1 is required but was not found."
}

check_prerequisites() {
  check_command docker

  if ! docker compose version >/dev/null 2>&1; then
    fail "Docker Compose v2 is required. Install the Docker Compose plugin and retry."
  fi

  if ! docker info >/dev/null 2>&1; then
    fail "Docker is installed, but the daemon is not reachable by this user."
  fi
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
  cat <<EOF

CTRoadmap beta is installed.

Install directory:
  $INSTALL_DIR

Open the app:
  Local:      http://localhost:8088
  Server/LAN: http://SERVER-IP:8088

Manage CTRoadmap:
  cd "$INSTALL_DIR"
  docker compose logs -f
  docker compose down
  docker compose up -d
  docker compose pull && docker compose up -d

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
  write_compose_file

  cd "$INSTALL_DIR"
  docker compose pull
  docker compose up -d

  print_final_instructions
}

main "$@"
