#!/usr/bin/env bash
set -euo pipefail

INSTALL_DIR="${CTR_INSTALL_DIR:-$HOME/ctroadmap-beta}"
COMPOSE_FILE=""
SELF_PATH=""
HOME_PATH=""
INSTALL_ID=""
COMPOSE_VALID=0
EXACT_IMAGE_REF=""
MATCHED_CONTAINERS=()
SAVED_SCRIPT=""

fail() {
  printf 'ERROR: %s\n' "$*" >&2
  if [[ -n "$SAVED_SCRIPT" ]]; then
    printf 'Uninstall is incomplete. Retry script retained at: %s\n' "$SAVED_SCRIPT" >&2
  fi
  exit 1
}

check_command() {
  command -v "$1" >/dev/null 2>&1 || fail "$1 is required but was not found."
}

check_prerequisites() {
  check_command docker
  check_command realpath
  check_command stat
}

# No evaluation of paths or Docker/registration output as shell code.
safe_path_text() {
  local LC_ALL=C.UTF-8
  [[ -n "$1" && ! "$1" =~ [[:cntrl:]] && "$1" != *[$'\u200b'-$'\u200f'$'\u2028'-$'\u202e'$'\u2060'-$'\u206f'$'\ufeff']* ]]
}

# Preserve realpath's output until it has been checked. Command substitution
# alone would silently strip a newline belonging to a symlink's target name.
canonical_path() {
  local resolved_output
  resolved_output="$(realpath "$@" && printf '\001')" || return 1
  resolved_output=${resolved_output%$'\001'}
  resolved_output=${resolved_output%$'\n'}
  safe_path_text "$resolved_output" || return 1
  printf '%s' "$resolved_output"
}

validate_target() {
  local path="$1" unsafe resolved
  safe_path_text "$path" && [[ "$path" == /* ]] || fail "Install directory must be an absolute path without control characters."
  [[ "/${path#/}/" != *'/../'* && "/${path#/}/" != *'/./'* ]] || fail "Traversal components are not allowed in the install directory."
  resolved="$(canonical_path -m -- "$path")" || fail "Cannot safely resolve install directory."
  safe_path_text "$resolved" || fail "Unsafe resolved installation path."
  for unsafe in / /home /root /opt /usr /var /etc /bin /sbin /lib /lib64 /boot /dev /proc /sys /run /tmp /mnt /media /srv; do
    [[ "$resolved" != "$(canonical_path -m -- "$unsafe")" ]] || fail "Refusing to delete unsafe install directory: $resolved"
  done
  [[ "$HOME_PATH" != "$resolved" && "$HOME_PATH" != "$resolved/"* ]] || fail "Refusing to delete the home directory or its ancestor."
  printf '%s\n' "$resolved"
}

compose() {
  docker compose --project-directory "$INSTALL_DIR" -f "$COMPOSE_FILE" "$@"
}

official_image() {
  [[ "$1" =~ ^ghcr\.io/noobcity99/ctroadmap(:[a-zA-Z0-9_][a-zA-Z0-9_.-]*|@sha256:[a-f0-9]{64})$ ]]
}

# Docker's JSON string representation lets us compare labels without decoding
# untrusted control characters (or losing trailing newlines in shell capture).
json_path() {
  local value="$1"
  value=${value//\\/\\\\}
  value=${value//\"/\\\"}
  value=${value//&/\\u0026}
  value=${value//</\\u003c}
  value=${value//>/\\u003e}
  printf '"%s"' "$value"
}

inspect_compose() {
  local services image
  if [[ -f "$COMPOSE_FILE" ]] && services="$(compose config --services 2>/dev/null)"; then
    [[ "$services" == ctroadmap ]] || fail "Compose configuration does not identify a single CTRoadmap service."
    image="$(compose config --images ctroadmap)" || fail "Cannot inspect the CTRoadmap service image."
    official_image "$image" || fail "Compose does not identify one exact CTRoadmap release image."
    EXACT_IMAGE_REF="$image"
    COMPOSE_VALID=1
  else
    printf 'Compose configuration is missing or unreadable/invalid; checking recovery evidence.\n'
  fi
}

inspect_containers() {
  local ids id mounts kind source destination extra related data_match exports_match service working_dir image
  MATCHED_CONTAINERS=()
  ids="$(docker ps -aq --no-trunc)" || fail "Cannot inspect Docker containers; no files were deleted."
  while IFS= read -r id; do
    [[ -n "$id" ]] || continue
    [[ "$id" =~ ^[a-f0-9]{64}$ ]] || fail "Docker returned an invalid container identity."
    mounts="$(docker inspect --format '{{range .Mounts}}{{printf "%s\t%s\t%s\n" .Type .Source .Destination}}{{end}}' "$id")" || fail "Cannot inspect container mounts."
    related=0 data_match=0 exports_match=0
    while IFS=$'\t' read -r kind source destination extra; do
      [[ -n "$kind" ]] || continue
      safe_path_text "$source" && safe_path_text "$destination" && [[ -z "$extra" ]] || fail "Unsafe or ambiguous Docker mount data."
      [[ "$kind" == bind ]] || continue
      [[ "$source" == /* ]] || fail "Docker bind path is not absolute."
      source="$(canonical_path -m -- "$source")" || fail "Cannot safely resolve Docker bind path."
      if [[ "$source" == "$INSTALL_DIR" || "$source" == "$INSTALL_DIR/"* || "$INSTALL_DIR" == "${source%/}/"* ]]; then related=1; fi
      if [[ "$source" == "$INSTALL_DIR/data" && "$destination" == /app/data ]]; then data_match=$((data_match + 1)); fi
      if [[ "$source" == "$INSTALL_DIR/exports" && "$destination" == /app/exports ]]; then exports_match=$((exports_match + 1)); fi
    done <<< "$mounts"
    [[ "$related" == 1 ]] || continue
    service="$(docker inspect --format '{{json (index .Config.Labels "com.docker.compose.service")}}' "$id")" || fail "Cannot inspect container service."
    working_dir="$(docker inspect --format '{{json (index .Config.Labels "com.docker.compose.project.working_dir")}}' "$id")" || fail "Cannot inspect container working directory."
    [[ "$service" == '"ctroadmap"' && "$working_dir" == "$(json_path "$INSTALL_DIR")" && "$data_match" == 1 && "$exports_match" == 1 ]] || fail "Another or unidentifiable container uses this installation; resolve it manually before deletion."
    MATCHED_CONTAINERS+=("$id")
    [[ "${#MATCHED_CONTAINERS[@]}" == 1 ]] || fail "Multiple containers identify this installation; resolve the ambiguity before deletion."
    if [[ "$COMPOSE_VALID" == 0 ]]; then
      image="$(docker inspect --format '{{.Config.Image}}' "$id")" || fail "Cannot inspect the matched container image."
      if official_image "$image"; then EXACT_IMAGE_REF="$image"; fi
    fi
  done <<< "$ids"
}

valid_registration() {
  command -v python3 >/dev/null 2>&1 || { printf 'Registration-only recovery requires host Python 3 to validate JSON.\n' >&2; return 1; }
  python3 - "$INSTALL_DIR" <<'PY'
import datetime
import json
import pathlib
import re
import sys
import unicodedata

def unique_object(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError("Duplicate registration field")
        result[key] = value
    return result

def path_text(value):
    return isinstance(value, str) and value and not any(unicodedata.category(c) in {"Cc", "Cf", "Cs", "Zl", "Zp"} for c in value)

def version(value):
    return isinstance(value, str) and re.fullmatch(r"v?(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-(?:alpha|beta|rc)(?:\.(0|[1-9]\d*))?)?(?:\+[0-9A-Za-z.-]+)?", value)

def timestamp(value):
    if not isinstance(value, str):
        raise ValueError("Missing registration timestamp")
    datetime.datetime.fromisoformat(value.replace("Z", "+00:00"))

try:
    root = pathlib.Path(sys.argv[1])
    for name in ("data", "exports"):
        directory = root / name
        if directory.is_symlink() or not directory.is_dir() or directory.resolve() != directory:
            raise ValueError("Expected real data and exports directories inside the installation")
    record = root / "data/host_updater_state.json"
    if record.is_symlink() or not record.is_file() or record.stat().st_size > 65536:
        raise ValueError("Expected a regular, bounded registration file")
    state = json.loads(record.read_text(encoding="utf-8"), object_pairs_hook=unique_object,
                       parse_constant=lambda value: (_ for _ in ()).throw(ValueError("Invalid JSON constant")))
    if not isinstance(state, dict) or type(state.get("schema_version")) is not int or state["schema_version"] != 1:
        raise ValueError("Unsupported registration schema")
    install = state.get("install_dir")
    if not path_text(install) or not install.startswith("/") or any(part in {".", ".."} for part in install.split("/")) or pathlib.Path(install).resolve() != root:
        raise ValueError("Registration does not identify this exact installation")
    compose_file = state.get("compose_file")
    if not path_text(compose_file) or compose_file not in {"docker-compose.yml", "docker-compose.yaml", "compose.yml", "compose.yaml"}:
        raise ValueError("Invalid registered Compose filename")
    if state.get("deployment_type") != "compose_release" or not version(state.get("updater_version")) or state.get("last_result") not in {"registered", "running", "success", "failed"}:
        raise ValueError("Invalid registration metadata")
    timestamp(state.get("registered_at"))
    if state.get("last_run_at") is not None:
        timestamp(state["last_run_at"])
    for key in ("previous_version", "current_version"):
        if state.get(key) is not None and not version(state[key]):
            raise ValueError("Invalid recorded version")
    for key in ("last_error", "previous_image_id", "current_image_id"):
        if state.get(key) is not None:
            if not isinstance(state[key], str):
                raise ValueError("Invalid diagnostic field type")
            state[key].encode("utf-8")
except (OSError, ValueError, TypeError, RecursionError) as error:
    # Do not print untrusted field values or use recorded image IDs for cleanup.
    print("Registration recovery evidence could not be validated.", file=sys.stderr)
    sys.exit(1)
PY
}

stop_service() {
  if [[ "$COMPOSE_VALID" == 1 ]]; then
    compose down || fail "Compose shutdown failed; installation files were preserved."
  else
    local id
    for id in "${MATCHED_CONTAINERS[@]}"; do
      docker stop "$id" && docker rm "$id" || fail "Matched container could not be removed; installation files were preserved."
    done
    printf 'Recovery: Compose network cleanup was skipped; no network names were inferred.\n'
  fi
}

revalidate_target() {
  local resolved
  resolved="$(validate_target "$INSTALL_DIR")" || fail "Deletion target no longer passes validation."
  [[ "$resolved" == "$INSTALL_DIR" && ! -L "$INSTALL_DIR" && "$(stat -c '%d:%i' -- "$INSTALL_DIR")" == "$INSTALL_ID" ]] || fail "Deletion target changed; refusing removal."
}

delete_install_files() {
  revalidate_target
  # Keep a retry copy outside the target when the operator ran the script inside it.
  if [[ "$SELF_PATH" == "$INSTALL_DIR/"* ]]; then
    SAVED_SCRIPT="$(mktemp /tmp/ctroadmap-uninstall-retry.XXXXXX)" || fail "Cannot preserve a retry copy of the uninstaller."
    cp -- "$SELF_PATH" "$SAVED_SCRIPT" && chmod u+x -- "$SAVED_SCRIPT" || fail "Cannot preserve the retry script."
  fi
  cd / || fail "Cannot leave the installation directory."
  if ! rm -rf -- "$INSTALL_DIR"; then
    printf 'Ordinary deletion could not remove all installation files.\n' >&2
  fi
  if [[ -e "$INSTALL_DIR" || -L "$INSTALL_DIR" ]]; then
    revalidate_target
    printf 'Remaining container-created files require elevated removal of: %s\n' "$INSTALL_DIR"
    command -v sudo >/dev/null 2>&1 || fail "sudo is unavailable. Uninstall is incomplete; installation files remain."
    sudo rm -rf -- "$INSTALL_DIR" || fail "Elevated deletion failed. Uninstall is incomplete."
  fi
  [[ ! -e "$INSTALL_DIR" && ! -L "$INSTALL_DIR" ]] || fail "Uninstall is incomplete; installation directory remains."
  printf 'Deleted installation: %s\n' "$INSTALL_DIR"
}

cleanup_image() {
  if [[ -z "$EXACT_IMAGE_REF" ]]; then
    printf 'Image cleanup skipped: no exact CTRoadmap image reference could be safely determined.\n'
  elif ! docker image rm "$EXACT_IMAGE_REF"; then
    printf 'Exact image was absent or retained by Docker (for example, still in use): %s\n' "$EXACT_IMAGE_REF"
  fi
}

cleanup_helpers() {
  local helper="$HOME_PATH/CTR_install.sh"
  [[ ! -d "$helper" || -L "$helper" ]] || fail "Installer helper path is a directory; leaving it and the uninstaller intact."
  rm -f -- "$helper" || fail "Installation deleted, but installer helper cleanup is incomplete."
  if [[ -n "$SAVED_SCRIPT" ]]; then
    rm -f -- "$SAVED_SCRIPT" || fail "Retry script cleanup failed."
    SAVED_SCRIPT=""
  fi
  rm -f -- "$SELF_PATH" || fail "Installation deleted, but uninstaller self-removal failed."
}

main() {
  local confirmation compose_ids id
  check_prerequisites
  safe_path_text "$HOME" && [[ "$HOME" == /* ]] || fail "HOME must be an absolute path without control characters."
  HOME_PATH="$(canonical_path -e -- "$HOME")" || fail "Cannot safely resolve home directory."
  safe_path_text "${BASH_SOURCE[0]}" || fail "Unsafe executing script path."
  SELF_PATH="$(canonical_path -e -- "${BASH_SOURCE[0]}")" || fail "Cannot identify the executing uninstaller."
  safe_path_text "$SELF_PATH" || fail "Unsafe executing script path."
  INSTALL_DIR="$(validate_target "$INSTALL_DIR")" || exit 1
  COMPOSE_FILE="$INSTALL_DIR/docker-compose.yml"
  printf 'Uninstalling CTRoadmap beta\nInstall directory: %s\n' "$INSTALL_DIR"
  if [[ ! -e "$INSTALL_DIR" ]]; then
    printf 'Install directory does not exist; helper files were preserved.\n'
    return
  fi
  [[ -d "$INSTALL_DIR" ]] || fail "Installation path is not a directory."
  INSTALL_ID="$(stat -c '%d:%i' -- "$INSTALL_DIR")" || fail "Cannot identify installation directory."
  inspect_compose
  printf 'Default uninstall preserves the installation directory, data, exports, helper scripts, and cached image.\n'
  read -r -p 'Delete the install directory and all contents? Type DELETE to confirm: ' confirmation || confirmation=""
  if [[ "$confirmation" != DELETE ]]; then
    if [[ "$COMPOSE_VALID" == 1 ]]; then stop_service; else printf 'No usable Compose configuration; no containers were stopped.\n'; fi
    printf 'Preserved %s\n' "$INSTALL_DIR"
    return
  fi
  inspect_containers
  if [[ "$COMPOSE_VALID" == 0 && "${#MATCHED_CONTAINERS[@]}" == 0 ]]; then
    valid_registration || fail "Cannot clearly identify this CTRoadmap installation. No files were deleted."
  fi
  if [[ "$COMPOSE_VALID" == 1 ]]; then
    compose_ids="$(compose ps --all --quiet)" || fail "Cannot inspect the Compose shutdown targets."
    while IFS= read -r id; do
      [[ -z "$id" || ( "${#MATCHED_CONTAINERS[@]}" == 1 && "$id" == "${MATCHED_CONTAINERS[0]}" ) ]] || fail "Compose would affect a container not identified with this installation."
    done <<< "$compose_ids"
  fi
  stop_service
  # Re-inspect after shutdown: no container may still use the selected directory.
  inspect_containers
  [[ "${#MATCHED_CONTAINERS[@]}" == 0 ]] || fail "A container still uses the installation; files were preserved."
  delete_install_files
  cleanup_image
  cleanup_helpers
  printf 'Full uninstall complete.\n'
}

main "$@"
