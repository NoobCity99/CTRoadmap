#!/usr/bin/env bash
set -euo pipefail

INSTALL_DIR="${CTR_INSTALL_DIR:-$HOME/ctroadmap-beta}"
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
}

stop_service() {
  if [[ -f "$COMPOSE_FILE" ]]; then
    echo "Stopping CTRoadmap beta from $INSTALL_DIR"
    cd "$INSTALL_DIR"
    docker compose down
  else
    echo "No docker-compose.yml found at $COMPOSE_FILE"
    echo "Nothing was stopped by docker compose."
  fi
}

delete_install_files() {
  if [[ ! -d "$INSTALL_DIR" ]]; then
    echo "Install directory does not exist: $INSTALL_DIR"
    return
  fi

  case "$INSTALL_DIR" in
    "/"|"$HOME"|"/home"|"/root"|"/opt"|"/usr"|"/var")
      fail "Refusing to delete unsafe install directory: $INSTALL_DIR"
      ;;
  esac

  echo
  echo "By default, uninstall preserves:"
  echo "  $INSTALL_DIR/data"
  echo "  $INSTALL_DIR/exports"
  echo "  $COMPOSE_FILE"
  echo "  $INSTALL_DIR"
  echo
  read -r -p "Delete the install directory and all contents? Type DELETE to confirm: " confirmation

  if [[ "$confirmation" == "DELETE" ]]; then
    rm -rf "$INSTALL_DIR"
    echo "Deleted $INSTALL_DIR"
  else
    echo "Preserved $INSTALL_DIR"
  fi
}

main() {
  echo "Uninstalling CTRoadmap beta"
  echo "Install directory: $INSTALL_DIR"

  check_prerequisites
  stop_service
  delete_install_files

  echo "Uninstall complete."
}

main "$@"
