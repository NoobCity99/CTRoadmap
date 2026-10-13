#!/usr/bin/env bash

# CTRoadmap host updater
#
# This script is intentionally host-side and operator-invoked. It does not
# modify Atlas content, prune Docker resources, install packages, use sudo, or
# migrate the installation directory.

set -Eeuo pipefail

readonly UPDATER_VERSION="0.2.0"
readonly SERVICE_NAME="ctroadmap"
readonly STATE_SCHEMA_VERSION="1"
readonly DEFAULT_INSTALL_BASENAME="ctroadmap-beta"
readonly DEFAULT_HEALTH_TIMEOUT="90"

INSTALL_DIR_OVERRIDE="${CTR_INSTALL_DIR:-}"
readonly COMPOSE_FILE_FROM_ENV="${COMPOSE_FILE:-}"
INSTALL_DIR=""
COMPOSE_FILE=""
DATA_DIR=""
STATE_FILE=""
STATE_TMP=""
LOCK_DIR=""
LOCK_HELD=0
LOCK_GUARD=""
LOCK_GUARD_HELD=0
readonly LOCK_PID="$BASHPID"
readonly LOCK_TOKEN="${CTR_EXEC_LOCK_TOKEN:-$BASHPID.$RANDOM.$RANDOM}"
REGISTER_ONLY=0
RUN_ACTIVE=0
FAILURE_RECORDED=0
RUN_STARTED_AT=""
REGISTERED_AT=""
PREVIOUS_VERSION=""
CURRENT_VERSION=""
PREVIOUS_IMAGE_ID=""
CURRENT_IMAGE_ID=""
CONFIGURED_IMAGE=""
HEALTH_TIMEOUT="${CTR_UPDATE_HEALTH_TIMEOUT:-$DEFAULT_HEALTH_TIMEOUT}"
INSTALL_MODE=0
ASSETS_DIR=""
PARSER_IMAGE=""
WORK=""
FRESH_CREATED=0
SELF_CHECKED_AT=""
SELF_FROM="${CTR_SELF_FROM:-$UPDATER_VERSION}"
SELF_RESULT="current"
INTEGRATION_STATUS="unknown"
IMPORTS_STATUS="unknown"
TOOLS_VERSION=""
ARCH=""
TOOLS_CANDIDATE=""
COMPOSE_CANDIDATE=""
readonly RELEASE_URL="https://raw.githubusercontent.com/NoobCity99/CTRoadmap/main/latest.json"
readonly OFFICIAL_IMAGE="ghcr.io/noobcity99/ctroadmap:beta"

log() {
  printf '%s\n' "$*"
}

warn() {
  printf 'WARNING: %s\n' "$*" >&2
}

utc_now() {
  date -u '+%Y-%m-%dT%H:%M:%SZ'
}

json_escape() {
  local value="$1"
  value=${value//\\/\\\\}
  value=${value//\"/\\\"}
  value=${value//$'\n'/\\n}
  value=${value//$'\r'/\\r}
  value=${value//$'\t'/\\t}
  printf '%s' "$value"
}

json_string_or_null() {
  if [[ -n "$1" ]]; then
    printf '"%s"' "$(json_escape "$1")"
  else
    printf 'null'
  fi
}

write_state() {
  local result="$1"
  local last_run_at="$2"
  local error_message="${3:-}"
  local temp_file

  [[ -n "$STATE_FILE" && -d "$DATA_DIR" ]] || return 0

  temp_file="$(mktemp "$DATA_DIR/.host_updater_state.json.tmp.XXXXXX")"
  STATE_TMP="$temp_file"

  {
    printf '{\n'
    printf '  "schema_version": %s,\n' "$STATE_SCHEMA_VERSION"
    printf '  "updater_version": "%s",\n' "$(json_escape "$UPDATER_VERSION")"
    printf '  "registered_at": "%s",\n' "$(json_escape "$REGISTERED_AT")"
    printf '  "last_run_at": %s,\n' "$(json_string_or_null "$last_run_at")"
    printf '  "last_result": "%s",\n' "$(json_escape "$result")"
    printf '  "deployment_type": "compose_release",\n'
    printf '  "install_dir": "%s",\n' "$(json_escape "$INSTALL_DIR")"
    printf '  "compose_file": "%s",\n' "$(json_escape "$(basename "$COMPOSE_FILE")")"
    printf '  "previous_version": %s,\n' "$(json_string_or_null "$PREVIOUS_VERSION")"
    printf '  "current_version": %s,\n' "$(json_string_or_null "$CURRENT_VERSION")"
    printf '  "previous_image_id": %s,\n' "$(json_string_or_null "$PREVIOUS_IMAGE_ID")"
    printf '  "current_image_id": %s,\n' "$(json_string_or_null "$CURRENT_IMAGE_ID")"
    printf '  "last_error": %s,\n' "$(json_string_or_null "$error_message")"
    printf '  "self_update_checked_at": %s,\n' "$(json_string_or_null "$SELF_CHECKED_AT")"
    printf '  "self_update_from_version": "%s",\n' "$(json_escape "$SELF_FROM")"
    printf '  "self_update_to_version": "%s",\n' "$UPDATER_VERSION"
    printf '  "self_update_result": "%s",\n' "$SELF_RESULT"
    printf '  "integration_status": "%s",\n' "$INTEGRATION_STATUS"
    printf '  "imports_mount_status": "%s",\n' "$IMPORTS_STATUS"
    printf '  "snapshot_tools_version": %s,\n' "$(json_string_or_null "$TOOLS_VERSION")"
    printf '  "snapshot_tools_architecture": %s\n' "$(json_string_or_null "$ARCH")"
    printf '}\n'
  } > "$temp_file"

  if [[ "$REGISTER_ONLY" -eq 1 && -f "$STATE_FILE" ]]; then
    printf '{"previous":%s,"next":%s}\n' "$(cat "$STATE_FILE")" "$(cat "$temp_file")" |
      host_python state-merge 1 > "$WORK/merged-state.json"
    cp "$WORK/merged-state.json" "$temp_file"
  fi
  chmod 0644 "$temp_file"
  mv -f "$temp_file" "$STATE_FILE"
  STATE_TMP=""
}

record_failure() {
  local message="$1"

  if [[ "$RUN_ACTIVE" -eq 1 && "$FAILURE_RECORDED" -eq 0 ]]; then
    FAILURE_RECORDED=1
    write_state "failed" "$RUN_STARTED_AT" "$message" || true
  fi
}

fail() {
  local message="$*"
  record_failure "$message"
  printf 'ERROR: %s\n' "$message" >&2

  if [[ -n "$INSTALL_DIR" && -n "$COMPOSE_FILE" ]]; then
    cat >&2 <<EOF

The updater does not directly modify or delete your Atlas or exports.
If the replacement CTRoadmap container started before this failure, application-level migrations performed by that release may already have run.

Inspect the deployment with:
  cd "$INSTALL_DIR"
  docker compose -f "$COMPOSE_FILE" ps
  docker compose -f "$COMPOSE_FILE" logs --tail=100 $SERVICE_NAME

After correcting the problem, run:
  "$INSTALL_DIR/ctr_update.sh"
EOF
  fi

  exit 1
}

on_error() {
  local exit_code="$1"
  local line_number="$2"
  trap - ERR
  record_failure "Updater command failed near line $line_number (exit $exit_code)."
  printf 'ERROR: CTRoadmap update failed near line %s (exit %s).\n' "$line_number" "$exit_code" >&2

  if [[ -n "$INSTALL_DIR" && -n "$COMPOSE_FILE" ]]; then
    cat >&2 <<EOF

The updater does not directly modify or delete your Atlas or exports.
If the replacement CTRoadmap container started before this failure, application-level migrations performed by that release may already have run.

Inspect the deployment with:
  cd "$INSTALL_DIR"
  docker compose -f "$COMPOSE_FILE" ps
  docker compose -f "$COMPOSE_FILE" logs --tail=100 $SERVICE_NAME

After correcting the problem, run:
  "$INSTALL_DIR/ctr_update.sh"
EOF
  fi

  exit "$exit_code"
}

release_lock() {
  # ERR traps in Compose subshells must never release their parent's lock.
  [[ "$BASHPID" == "$LOCK_PID" ]] || return 0
  if [[ "$LOCK_HELD" -eq 1 && -d "$LOCK_DIR" && ! -L "$LOCK_DIR" ]]; then
    local owner_pid="" owner_token=""
    IFS= read -r owner_pid < "$LOCK_DIR/pid" 2>/dev/null || true
    IFS= read -r owner_token < "$LOCK_DIR/token" 2>/dev/null || true
    if [[ "$owner_pid" == "$LOCK_PID" && "$owner_token" == "$LOCK_TOKEN" ]]; then
      rm -f "$LOCK_DIR/pid" "$LOCK_DIR/token"
      rmdir "$LOCK_DIR" 2>/dev/null || true
    fi
  fi
  LOCK_HELD=0
}

release_lock_guard() {
  [[ "$BASHPID" == "$LOCK_PID" ]] || return 0
  if [[ "$LOCK_GUARD_HELD" -eq 1 && -d "$LOCK_GUARD" && ! -L "$LOCK_GUARD" ]] &&
     [[ "$(cat "$LOCK_GUARD/pid" 2>/dev/null)" == "$LOCK_PID" && "$(cat "$LOCK_GUARD/token" 2>/dev/null)" == "$LOCK_TOKEN" ]]; then
    rm -f -- "$LOCK_GUARD/pid" "$LOCK_GUARD/token"
    rmdir "$LOCK_GUARD" 2>/dev/null || true
    LOCK_GUARD_HELD=0
  fi
}

cleanup() {
  local exit_code=$?
  if [[ -n "$STATE_TMP" && -f "$STATE_TMP" ]]; then
    rm -f "$STATE_TMP"
  fi
  if [[ "$BASHPID" == "$LOCK_PID" ]]; then
    if [[ -n "$COMPOSE_CANDIDATE" && "$COMPOSE_CANDIDATE" == "$INSTALL_DIR"/.ctr-compose.new.* ]]; then rm -f -- "$COMPOSE_CANDIDATE"; fi
    if [[ -n "$TOOLS_CANDIDATE" && "$TOOLS_CANDIDATE" == "$INSTALL_DIR"/.ctr-tools.new.* && ! -e "$INSTALL_DIR/.ctr-tools-promotion.json" ]]; then rm -rf -- "$TOOLS_CANDIDATE"; fi
  fi
  release_lock
  release_lock_guard
  if [[ "$BASHPID" == "$LOCK_PID" && -n "$WORK" && "$WORK" == "$INSTALL_DIR"/.ctr-update-work.* && -d "$WORK" && ! -L "$WORK" && -O "$WORK" ]]; then
    rm -rf -- "$WORK"
  fi
  if [[ "$FRESH_CREATED" -eq 1 ]]; then rmdir -- "$INSTALL_DIR" 2>/dev/null || true; fi
  return "$exit_code"
}

trap 'on_error "$?" "$LINENO"' ERR
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

usage() {
  cat <<EOF
Usage: ctr_update.sh [OPTIONS]

Safely update an existing Docker Compose installation of CTRoadmap.

Options:
  --install           Provision a fresh standard Linux installation.
  --install-dir PATH  Use this CTRoadmap installation directory.
                      CTR_INSTALL_DIR provides the same override.
  --register-only     Install/register this updater without updating CTRoadmap.
  --health-timeout N  Wait up to N seconds for /api/health (default: 90).
  --release-assets-dir PATH
                      Use bytes from a reviewed private kit. Requires the
                      kit launcher's pinned CTR_RELEASE_DESCRIPTOR_SHA256.
  --version           Print the updater version and exit.
  -h, --help          Show this help text.

Normal update:
  cd ~/ctroadmap-beta
  ./ctr_update.sh

Custom installation:
  ./ctr_update.sh --install-dir /opt/ctroadmap

Supported layout:
  One release Compose file using a locally available published CTRoadmap image.
  Writable bind mounts at /app/data and /app/exports; host paths may be custom.
  Development builds, named data volumes, and Compose override files are rejected.
  Portainer/NAS-managed stacks should continue using their platform's normal update workflow.

Lock recovery:
  Complete stale locks are recovered automatically on Linux.
  Incomplete locks and acquisition guards are preserved. Inspect host processes
  before manually clearing an abandoned lock; never clear one during an update.
EOF
}

parse_args() {
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --install)
        INSTALL_MODE=1
        shift
        ;;
      --release-assets-dir)
        [[ $# -ge 2 ]] || fail "--release-assets-dir requires a path."
        ASSETS_DIR="$(canonical_directory "$2")" || fail "Local asset directory does not exist."
        shift 2
        ;;
      --install-dir)
        [[ $# -ge 2 ]] || fail "--install-dir requires a path."
        INSTALL_DIR_OVERRIDE="$2"
        shift 2
        ;;
      --register-only)
        REGISTER_ONLY=1
        shift
        ;;
      --health-timeout)
        [[ $# -ge 2 ]] || fail "--health-timeout requires a number of seconds."
        HEALTH_TIMEOUT="$2"
        shift 2
        ;;
      --version)
        printf '%s\n' "$UPDATER_VERSION"
        exit 0
        ;;
      -h|--help)
        usage
        exit 0
        ;;
      *)
        fail "Unknown option: $1"
        ;;
    esac
  done

  [[ "$HEALTH_TIMEOUT" =~ ^[1-9][0-9]*$ ]] || fail "Health timeout must be a positive integer."
  [[ "$INSTALL_MODE" -eq 0 || "$REGISTER_ONLY" -eq 0 ]] || fail "--install and --register-only cannot be combined."
  [[ "${CTR_SELF_DEPTH:-0}" =~ ^[01]$ ]] || fail "Updater re-execution depth exceeded."
  if [[ -n "$ASSETS_DIR" ]]; then
    [[ "${CTR_RELEASE_DESCRIPTOR_SHA256:-}" =~ ^[0-9a-f]{64}$ ]] || fail "A reviewed private descriptor digest is required. Use the test-kit launcher."
  else
    [[ -z "${CTR_RELEASE_DESCRIPTOR_SHA256:-}" ]] || fail "A private descriptor digest requires --release-assets-dir."
  fi
}

check_command() {
  command -v "$1" >/dev/null 2>&1 || fail "$1 is required but was not found."
}

check_prerequisites() {
  [[ -z "$COMPOSE_FILE_FROM_ENV" ]] || fail "COMPOSE_FILE overrides are unsupported. Run from a single-file CTR release installation."
  [[ -z "${COMPOSE_ENV_FILES:-}" ]] || fail "COMPOSE_ENV_FILES is unsupported; use the installation's .env file."
  check_command docker
  check_command date
  check_command mktemp
  for command in bash curl sha256sum timeout head wc tar gzip cmp find; do check_command "$command"; done
  [[ "$(uname -s)" == Linux ]] || fail "The host updater supports Linux only."
  case "$(uname -m)" in
    x86_64|amd64) ARCH=amd64 ;;
    aarch64|arm64) ARCH=arm64 ;;
    *) fail "Unsupported host architecture; no installation changes were made." ;;
  esac

  if ! docker compose version >/dev/null 2>&1; then
    fail "Docker Compose v2 is required. Install the Docker Compose plugin and retry."
  fi

  if ! docker info >/dev/null 2>&1; then
    fail "Docker is installed, but the daemon is not reachable by this user."
  fi
}

canonical_directory() {
  local directory="$1"
  [[ -d "$directory" ]] || return 1
  (cd -P "$directory" >/dev/null 2>&1 && pwd -P)
}

find_compose_in_dir() {
  local directory="$1"
  local filename

  [[ -d "$directory" ]] || return 1
  for filename in docker-compose.yml docker-compose.yaml compose.yml compose.yaml; do
    if [[ -f "$directory/$filename" ]]; then
      printf '%s\n' "$directory/$filename"
      return 0
    fi
  done
  return 1
}

directory_has_ctroadmap_service() {
  local directory="$1"
  local compose_file

  compose_file="$(find_compose_in_dir "$directory")" || return 1
  (
    cd "$directory"
    docker compose -f "$compose_file" config --services 2>/dev/null
  ) | grep -Fxq "$SERVICE_NAME"
}

add_candidate() {
  local candidate="$1"
  local canonical
  local existing

  canonical="$(canonical_directory "$candidate")" || return 0
  directory_has_ctroadmap_service "$canonical" || return 0

  for existing in "${INSTALL_CANDIDATES[@]:-}"; do
    [[ "$existing" == "$canonical" ]] && return 0
  done
  INSTALL_CANDIDATES+=("$canonical")
}

discover_from_docker() {
  local container_id
  local mount_source
  local candidate
  local ids_found=0

  while IFS= read -r container_id; do
    [[ -n "$container_id" ]] || continue
    ids_found=1
    while IFS= read -r mount_source; do
      [[ -n "$mount_source" ]] || continue
      candidate="$(dirname "$mount_source")"
      add_candidate "$candidate"
    done < <(
      docker inspect --format '{{range .Mounts}}{{if eq .Destination "/app/data"}}{{println .Source}}{{end}}{{end}}' "$container_id" 2>/dev/null || true
    )
  done < <(docker ps -aq --filter "label=com.docker.compose.service=$SERVICE_NAME" 2>/dev/null || true)

  if [[ "$ids_found" -eq 0 ]]; then
    container_id="$(docker ps -aq --filter 'name=^/ctroadmap-beta$' 2>/dev/null | head -n 1)"
    if [[ -n "$container_id" ]]; then
      while IFS= read -r mount_source; do
        [[ -n "$mount_source" ]] || continue
        candidate="$(dirname "$mount_source")"
        add_candidate "$candidate"
      done < <(
        docker inspect --format '{{range .Mounts}}{{if eq .Destination "/app/data"}}{{println .Source}}{{end}}{{end}}' "$container_id" 2>/dev/null || true
      )
    fi
  fi
}

select_single_candidate() {
  local source_description="$1"

  if [[ "${#INSTALL_CANDIDATES[@]}" -eq 1 ]]; then
    INSTALL_DIR="${INSTALL_CANDIDATES[0]}"
    return 0
  fi

  if [[ "${#INSTALL_CANDIDATES[@]}" -gt 1 ]]; then
    printf 'Multiple CTRoadmap installations were found via %s:\n' "$source_description" >&2
    printf '  %s\n' "${INSTALL_CANDIDATES[@]}" >&2
    fail "Refusing to guess. Re-run with --install-dir PATH or CTR_INSTALL_DIR=PATH."
  fi

  return 1
}

detect_installation() {
  local script_source="${BASH_SOURCE[0]}"
  local script_directory=""
  local default_directory=""
  local prompted_directory=""
  INSTALL_CANDIDATES=()

  if [[ -n "$INSTALL_DIR_OVERRIDE" ]]; then
    INSTALL_DIR="$(canonical_directory "$INSTALL_DIR_OVERRIDE")" || fail "Install directory does not exist: $INSTALL_DIR_OVERRIDE"
    directory_has_ctroadmap_service "$INSTALL_DIR" || fail "No Compose file with a '$SERVICE_NAME' service was found in: $INSTALL_DIR"
    return 0
  fi

  if [[ -e "$script_source" ]]; then
    script_directory="$(canonical_directory "$(dirname "$script_source")")" || true
    if [[ -n "$script_directory" ]] && directory_has_ctroadmap_service "$script_directory"; then
      INSTALL_DIR="$script_directory"
      return 0
    fi
  fi

  add_candidate "$PWD"
  select_single_candidate "the current directory" && return 0
  INSTALL_CANDIDATES=()

  discover_from_docker
  select_single_candidate "Docker" && return 0
  INSTALL_CANDIDATES=()

  if [[ -n "${HOME:-}" ]]; then
    default_directory="$HOME/$DEFAULT_INSTALL_BASENAME"
    add_candidate "$default_directory"
    select_single_candidate "the default location" && return 0
    INSTALL_CANDIDATES=()
  fi

  if [[ -t 0 && -t 1 ]]; then
    printf 'Enter the CTRoadmap install directory: '
    read -r prompted_directory
    # Match a literal user-entered tilde, then expand it explicitly below.
    # shellcheck disable=SC2088
    if [[ "$prompted_directory" == "~" && -n "${HOME:-}" ]]; then
      prompted_directory="$HOME"
    elif [[ "$prompted_directory" == "~/"* && -n "${HOME:-}" ]]; then
      prompted_directory="$HOME/${prompted_directory#\~/}"
    fi
    INSTALL_DIR="$(canonical_directory "$prompted_directory")" || fail "Install directory does not exist: $prompted_directory"
    directory_has_ctroadmap_service "$INSTALL_DIR" || fail "No Compose file with a '$SERVICE_NAME' service was found in: $INSTALL_DIR"
    return 0
  fi

  fail "Could not locate CTRoadmap. Re-run with --install-dir PATH or CTR_INSTALL_DIR=PATH."
}

validate_installation() {
  local filename
  case "$INSTALL_DIR" in
    /)
      fail "Refusing to use the filesystem root as the install directory."
      ;;
  esac

  COMPOSE_FILE="$(find_compose_in_dir "$INSTALL_DIR")" || fail "No supported Compose file was found in: $INSTALL_DIR"

  if [[ -f "$INSTALL_DIR/.env" ]] && grep -Eq '^[[:space:]]*(export[[:space:]]+)?COMPOSE_(FILE|ENV_FILES)[[:space:]]*=' "$INSTALL_DIR/.env"; then
    fail "Compose file/environment overrides in .env are unsupported. Use a single-file CTR release configuration."
  fi
  # Explicit -f would otherwise silently omit the operator's override files.
  for filename in docker-compose.yml docker-compose.yaml compose.yml compose.yaml \
    docker-compose.override.yml docker-compose.override.yaml compose.override.yml compose.override.yaml; do
    if [[ -f "$INSTALL_DIR/$filename" && "$INSTALL_DIR/$filename" != "$COMPOSE_FILE" ]]; then
      fail "Multiple Compose files or overrides are unsupported by this updater: $filename"
    fi
  done

  if ! (
    cd "$INSTALL_DIR"
    docker compose -f "$COMPOSE_FILE" config --services 2>/dev/null
  ) | grep -Fxq "$SERVICE_NAME"; then
    fail "The Compose project does not define the required '$SERVICE_NAME' service."
  fi

  validate_release_configuration
  STATE_FILE="$DATA_DIR/host_updater_state.json"
  LOCK_DIR="$INSTALL_DIR/.ctr_update.lock"
  LOCK_GUARD="$INSTALL_DIR/.ctr_update.lock.acquire"

  [[ -w "$DATA_DIR" ]] || fail "Persistent data directory is not writable by this user: $DATA_DIR"
  [[ -w "$INSTALL_DIR" ]] || fail "Install directory is not writable by this user: $INSTALL_DIR"
}

validate_release_configuration() {
  local images image configured_image="" parser_image config_json containers_json="[]"
  local container_ids data_source validator

  images="$(compose config --images "$SERVICE_NAME")" ||
    fail "Unable to resolve the CTRoadmap release image."
  while IFS= read -r image; do
    [[ -n "$image" ]] || continue
    case "$image" in
      ghcr.io/noobcity99/ctroadmap:*|ghcr.io/noobcity99/ctroadmap@sha256:*)
        [[ -z "$configured_image" || "$configured_image" == "$image" ]] ||
          fail "Multiple CTRoadmap images were found; use a single release configuration."
        configured_image="$image"
        ;;
    esac
  done <<< "$images"
  [[ -n "$configured_image" ]] ||
    fail "A published ghcr.io/noobcity99/ctroadmap image is required. Development/build-only Compose projects are not supported."
  CONFIGURED_IMAGE="$configured_image"

  # Use Python already shipped with CTR, without host packages, network, or mounts.
  # This never pulls an image or starts the app. The installer must pull first.
  parser_image="$(docker image inspect --format '{{.Id}}' "$configured_image" 2>/dev/null)" ||
    fail "The configured CTRoadmap image is not available locally. Complete the normal installation before registering the updater."
  [[ -n "$parser_image" ]] || fail "Unable to identify the locally installed CTRoadmap image."
  PARSER_IMAGE="$parser_image"
  config_json="$(compose config --format json)" ||
    fail "Docker Compose must support 'config --format json'."
  container_ids="$(compose ps -a -q "$SERVICE_NAME")" ||
    fail "Unable to inspect the current CTRoadmap deployment."
  if [[ -n "$container_ids" ]]; then
    [[ "$container_ids" != *$'\n'* ]] || fail "Multiple CTRoadmap containers exist in this project; refusing to guess."
    containers_json="$(docker inspect "$container_ids")" ||
      fail "Unable to inspect the existing CTRoadmap container."
  fi

  validator="$(cat <<'PY'
import json
import posixpath
import sys

def reject(message):
    raise ValueError(message)

def check_data_environment(environment):
    for key, expected in (("CTR_DATA_DIR", "/app/data"), ("CTR_EXPORTS_DIR", "/app/exports")):
        value = environment.get(key) or expected
        if not isinstance(value, str) or posixpath.normpath(posixpath.join("/app", value)) != expected:
            reject(f"{key} changes the container path; this layout is unsupported.")

def relevant_mounts(volumes, runtime=False):
    result = {}
    for volume in volumes:
        target = volume.get("Destination" if runtime else "target", "")
        target = posixpath.normpath(target)
        for expected in ("/app/data", "/app/exports"):
            if target == expected:
                kind = volume.get("Type" if runtime else "type")
                source = volume.get("Source" if runtime else "source")
                writable = volume.get("RW", False) if runtime else not volume.get("read_only", False)
                if kind != "bind" or not writable:
                    reject(f"{expected} must be a writable host bind mount; named/read-only volumes are unsupported.")
                if not isinstance(source, str) or not source.startswith("/") or any(ord(c) < 32 for c in source):
                    reject(f"{expected} must resolve to an absolute host directory without control characters.")
                if expected in result:
                    reject(f"Multiple mounts target {expected}.")
                result[expected] = posixpath.normpath(source)
            elif target == "/" or expected.startswith(target.rstrip("/") + "/") or target.startswith(expected + "/"):
                reject(f"Mount {target} overlaps {expected}; this layout is unsupported.")
    if set(result) != {"/app/data", "/app/exports"}:
        reject("Both /app/data and /app/exports must have explicit writable bind mounts.")
    if result["/app/data"] == result["/app/exports"]:
        reject("Data and exports must use separate host directories.")
    return result

try:
    payload = json.load(sys.stdin)
    service = payload["compose"]["services"]["ctroadmap"]
    if "build" in service:
        reject("Development builds are not supported, including configurations with both image and build.")
    image = service.get("image", "")
    if not image.startswith(("ghcr.io/noobcity99/ctroadmap:", "ghcr.io/noobcity99/ctroadmap@sha256:")):
        reject("The ctroadmap service must use a published CTRoadmap image.")
    if service.get("volumes_from"):
        reject("volumes_from is unsupported; use explicit data and export bind mounts.")
    check_data_environment(service.get("environment") or {})
    mounts = relevant_mounts(service.get("volumes") or [])
    for container in payload["containers"]:
        environment = dict(item.split("=", 1) for item in container["Config"].get("Env", []) if "=" in item)
        check_data_environment(environment)
        if relevant_mounts(container.get("Mounts") or [], runtime=True) != mounts:
            reject("Compose data/export mounts differ from the existing container. Resolve that mismatch before updating.")
    print(mounts["/app/data"])
except (KeyError, TypeError, ValueError, AttributeError) as exc:
    print(f"Unsupported CTRoadmap configuration: {exc}", file=sys.stderr)
    sys.exit(1)
PY
)"
  data_source="$(
    printf '{"compose":%s,"containers":%s}\n' "$config_json" "$containers_json" |
      docker run --rm --pull never -i --network none --read-only --cap-drop ALL --no-healthcheck \
        --security-opt no-new-privileges --entrypoint python "$parser_image" -c "$validator"
  )" || fail "Release configuration validation failed; no updater files or application data were changed."
  DATA_DIR="$(canonical_directory "$data_source")" ||
    fail "The resolved persistent data directory does not exist: $data_source"
}

validate_update_channel() {
  [[ -n "$CONFIGURED_IMAGE" ]] || fail "Unable to determine the configured CTRoadmap image reference."

  case "$CONFIGURED_IMAGE" in
    ghcr.io/noobcity99/ctroadmap:beta)
      return 0
      ;;
    ghcr.io/noobcity99/ctroadmap@sha256:*|ghcr.io/noobcity99/ctroadmap:v*|ghcr.io/noobcity99/ctroadmap:[0-9]*)
      fail "This CTRoadmap installation uses a pinned image reference ($CONFIGURED_IMAGE). ctr_update.sh cannot advance a pinned deployment to another release. Change the deployment to the supported ':beta' update-channel tag or continue managing this installation manually."
      ;;
    *)
      fail "This CTRoadmap installation uses an unsupported update image reference ($CONFIGURED_IMAGE). Updater v$UPDATER_VERSION supports the official ':beta' update channel for automatic updates."
      ;;
  esac
}

compose() {
  (
    cd "$INSTALL_DIR"
    docker compose -f "$COMPOSE_FILE" "$@"
  )
}

acquire_lock() {
  local existing_pid=""

  # Every acquirer holds this guard until ownership is published. A guard left
  # by SIGKILL is deliberately not reclaimed without operator inspection.
  [[ "$LOCK_GUARD_HELD" -eq 1 ]] || fail "Self-update guard must be owned before acquiring the deployment lock."
  if [[ -e "$LOCK_DIR" || -L "$LOCK_DIR" ]]; then
    [[ -d "$LOCK_DIR" && ! -L "$LOCK_DIR" && -f "$LOCK_DIR/pid" && ! -L "$LOCK_DIR/pid" ]] ||
      fail "Incomplete or unrecognized updater lock: $LOCK_DIR. It has been preserved; verify no updater is active before manual recovery."
    IFS= read -r existing_pid < "$LOCK_DIR/pid" || true
    [[ "$existing_pid" =~ ^[1-9][0-9]*$ ]] ||
      fail "Incomplete updater lock: $LOCK_DIR. It has been preserved; verify no updater is active before manual recovery."
    probe_dead_pid "$existing_pid" || fail "Updater lock owner is active or cannot be inspected (PID $existing_pid)."
    # Same-owner locks avoid mistaking permission denial/hidden processes for
    # dead processes. Cross-user recovery requires operator inspection.
    [[ -O "$LOCK_DIR/pid" && -d /proc/self && -r /proc/uptime ]] ||
      fail "Cannot prove the updater lock is stale for this user; it has been preserved: $LOCK_DIR"
    [[ ! -L "$LOCK_DIR/token" ]] || fail "Unrecognized updater lock token; lock preserved."
    local item
    for item in "$LOCK_DIR"/* "$LOCK_DIR"/.[!.]* "$LOCK_DIR"/..?*; do
      [[ -e "$item" || -L "$item" ]] || continue
      [[ "$item" == "$LOCK_DIR/pid" || "$item" == "$LOCK_DIR/token" ]] || fail "Unexpected lock contents; lock preserved."
    done
    warn "Recovering a stale updater lock: $LOCK_DIR"
    rm -f "$LOCK_DIR/pid" "$LOCK_DIR/token"
    rmdir "$LOCK_DIR" || fail "The stale lock contains unexpected files; refusing to remove them."
  fi
  mkdir "$LOCK_DIR" || fail "Could not acquire updater lock: $LOCK_DIR"
  printf '%s\n' "$LOCK_TOKEN" > "$LOCK_DIR/token"
  printf '%s\n' "$LOCK_PID" > "$LOCK_DIR/pid"
  LOCK_HELD=1
  release_lock_guard
}

read_registered_at() {
  local stored=""

  if [[ -e "$STATE_FILE" || -L "$STATE_FILE" ]]; then
    [[ -f "$STATE_FILE" && ! -L "$STATE_FILE" ]] || fail "Updater state must be a regular file; inspect it before proceeding."
  fi
  if [[ -f "$STATE_FILE" ]]; then
    [[ ! -L "$STATE_FILE" ]] || fail "Symlinked updater state is unsupported."
    stored="$(host_python state-read "$INSTALL_DIR" < "$STATE_FILE")" || fail "Updater state requires inspection; it has not been rewritten."
  fi

  if [[ -n "$stored" ]]; then
    REGISTERED_AT="$stored"
  else
    REGISTERED_AT="$(utc_now)"
  fi
}

resolve_script_file() {
  local source="${BASH_SOURCE[0]}"
  local source_directory

  [[ -f "$source" && -r "$source" ]] || return 1
  source_directory="$(canonical_directory "$(dirname "$source")")" || return 1
  printf '%s/%s\n' "$source_directory" "$(basename "$source")"
}

register_updater() {
  local source_file
  local target_file="$INSTALL_DIR/ctr_update.sh"
  local backup_file
  local temp_file
  local timestamp

  [[ ! -L "$target_file" && ( ! -e "$target_file" || -f "$target_file" ) ]] || fail "Updater destination is not a regular file."

  source_file="$(resolve_script_file)" || fail "The updater cannot register when piped directly to Bash. Download ctr_update.sh to a file, then run that file."

  if [[ -e "$target_file" && "$source_file" -ef "$target_file" ]]; then
    chmod 0755 "$target_file"
    return 0
  fi

  if [[ -f "$target_file" ]] && cmp -s "$source_file" "$target_file"; then
    chmod 0755 "$target_file"
    return 0
  fi

  if [[ -e "$target_file" ]]; then
    timestamp="$(date -u '+%Y%m%dT%H%M%SZ')"
    backup_file="$(mktemp "$target_file.backup-$timestamp.XXXXXX")"
    cp -p "$target_file" "$backup_file"
    log "Backed up the previous updater to: $backup_file"
  fi

  temp_file="$(mktemp "$INSTALL_DIR/.ctr_update.sh.tmp.XXXXXX")"
  cp "$source_file" "$temp_file"
  chmod 0755 "$temp_file"
  mv -f "$temp_file" "$target_file"
  log "Registered CTRoadmap host updater v$UPDATER_VERSION at: $target_file"
}

compose_container_id() {
  compose ps -q "$SERVICE_NAME" 2>/dev/null | head -n 1
}

container_version() {
  local container_id="$1"

  [[ -n "$container_id" ]] || return 0
  docker inspect --format '{{range .Config.Env}}{{println .}}{{end}}' "$container_id" 2>/dev/null \
    | sed -n 's/^CTR_VERSION=//p' \
    | head -n 1
}

container_image_id() {
  local container_id="$1"

  [[ -n "$container_id" ]] || return 0
  docker inspect --format '{{.Image}}' "$container_id" 2>/dev/null || true
}

capture_before_state() {
  local container_id
  container_id="$(compose_container_id)"
  PREVIOUS_VERSION="$(container_version "$container_id")"
  PREVIOUS_IMAGE_ID="$(container_image_id "$container_id")"
  CURRENT_VERSION="$PREVIOUS_VERSION"
  CURRENT_IMAGE_ID="$PREVIOUS_IMAGE_ID"
}

capture_after_state() {
  local container_id
  container_id="$(compose_container_id)"
  CURRENT_VERSION="$(container_version "$container_id")"
  CURRENT_IMAGE_ID="$(container_image_id "$container_id")"
}

health_check_once() {
  local container_id
  local running

  container_id="$(compose_container_id)"
  [[ -n "$container_id" ]] || return 1

  running="$(docker inspect --format '{{.State.Running}}' "$container_id" 2>/dev/null || true)"
  [[ "$running" == "true" ]] || return 1

  compose exec -T "$SERVICE_NAME" \
    python -c 'import urllib.request; response = urllib.request.urlopen("http://127.0.0.1:8088/api/health", timeout=3); raise SystemExit(0 if response.status == 200 else 1)' \
    >/dev/null 2>&1
}

wait_for_health() {
  local started_at=$SECONDS
  local elapsed=0

  log "Waiting for CTRoadmap health check (timeout: ${HEALTH_TIMEOUT}s)..."

  while (( elapsed < HEALTH_TIMEOUT )); do
    if health_check_once; then
      log "CTRoadmap health check passed."
      return 0
    fi
    sleep 2
    elapsed=$((SECONDS - started_at))
  done

  fail "CTRoadmap did not pass /api/health within ${HEALTH_TIMEOUT} seconds."
}

print_summary() {
  cat <<EOF

CTRoadmap update completed successfully.

Install directory: $INSTALL_DIR
Updater version:   $UPDATER_VERSION
Previous version:  ${PREVIOUS_VERSION:-unknown}
Current version:   ${CURRENT_VERSION:-unknown}
State file:        $STATE_FILE
EOF

  if [[ -n "$PREVIOUS_IMAGE_ID" && "$PREVIOUS_IMAGE_ID" == "$CURRENT_IMAGE_ID" ]]; then
    log "Result:             Already using the current published image."
  elif [[ -n "$PREVIOUS_IMAGE_ID" && -n "$CURRENT_IMAGE_ID" ]]; then
    log "Result:             CTRoadmap image updated."
  else
    log "Result:             CTRoadmap is running and healthy."
  fi
}

probe_dead_pid() {
  local error
  [[ "$1" =~ ^[1-9][0-9]{0,9}$ ]] || return 1
  if error="$(LC_ALL=C kill -0 "$1" 2>&1)"; then return 1; fi
  # EPERM and other errors are not proof of death, even with restricted /proc.
  [[ "$error" == *'No such process'* && ! -d "/proc/$1" ]]
}

acquire_self_guard() {
  local pid=""
  if [[ "${CTR_SELF_DEPTH:-0}" -eq 1 ]]; then
    [[ -d "$LOCK_GUARD" && ! -L "$LOCK_GUARD" && -O "$LOCK_GUARD" && ! -L "$LOCK_GUARD/pid" && ! -L "$LOCK_GUARD/token" ]] || fail "Re-execution guard is not owned."
    [[ "$(cat "$LOCK_GUARD/pid")" == "$LOCK_PID" && "$(cat "$LOCK_GUARD/token")" == "$LOCK_TOKEN" ]] || fail "Re-execution guard identity differs."
  else
    mkdir -m 700 -- "$LOCK_GUARD" 2>/dev/null || fail "Updater guard is active or abandoned: $LOCK_GUARD. Inspect processes before manual recovery."
    printf '%s\n' "$LOCK_PID" > "$LOCK_GUARD/pid"
    printf '%s\n' "$LOCK_TOKEN" > "$LOCK_GUARD/token"
  fi
  LOCK_GUARD_HELD=1
  if [[ -e "$LOCK_DIR" || -L "$LOCK_DIR" ]]; then
    [[ -d "$LOCK_DIR" && ! -L "$LOCK_DIR" && -f "$LOCK_DIR/pid" && ! -L "$LOCK_DIR/pid" && -s "$LOCK_DIR/token" && ! -L "$LOCK_DIR/token" ]] || fail "Incomplete updater lock; preserved for inspection."
    local item
    for item in "$LOCK_DIR"/* "$LOCK_DIR"/.[!.]* "$LOCK_DIR"/..?*; do
      [[ -e "$item" || -L "$item" ]] || continue
      [[ "$item" == "$LOCK_DIR/pid" || "$item" == "$LOCK_DIR/token" ]] || fail "Unrecognized updater lock contents; preserved."
    done
    read -r pid < "$LOCK_DIR/pid" || true
    [[ "$pid" =~ ^[1-9][0-9]*$ ]] || fail "Unrecognized updater lock; preserved for inspection."
    probe_dead_pid "$pid" || fail "Updater lock owner is active or cannot be inspected (PID $pid)."
    [[ -O "$LOCK_DIR/pid" && -d /proc/self && -r /proc/uptime ]] || fail "Cannot establish stale lock ownership; preserved."
  fi
}

sha_file() { sha256sum -- "$1" | cut -d ' ' -f 1; }

acquire_asset() {
  local location="$1" expected="$2" limit="$3" output="$4"
  if [[ -n "$ASSETS_DIR" ]]; then
    [[ "$location" != */* && -f "$ASSETS_DIR/$location" && ! -L "$ASSETS_DIR/$location" ]] || fail "Missing/unsafe local asset: $location"
    head -c "$((limit + 1))" -- "$ASSETS_DIR/$location" > "$output"
    [[ "$(wc -c < "$output")" -le "$limit" ]] || fail "Local asset exceeds size limit."
  else
    # head bounds the bytes written even when Content-Length is absent or false.
    curl --proto '=https' --proto-redir '=https' --tlsv1.2 --connect-timeout 10 --max-time 180 --max-redirs 3 -fsSL "$location" |
      head -c "$((limit + 1))" > "$output" || fail "Asset download failed."
    [[ "$(wc -c < "$output")" -le "$limit" ]] || fail "Downloaded asset exceeds size limit."
  fi
  [[ -z "$expected" || "$(sha_file "$output")" == "$expected" ]] || fail "Asset checksum mismatch."
}

check_self() {
  local output candidate source target backup
  if [[ -n "$ASSETS_DIR" ]]; then
    acquire_asset release.json "$CTR_RELEASE_DESCRIPTOR_SHA256" 1048576 "$WORK/release.json"
  else
    acquire_asset "$RELEASE_URL" "" 1048576 "$WORK/release.json"
  fi
  output="$(host_python release "$([[ -n "$ASSETS_DIR" ]] && echo 1 || echo 0)" "$UPDATER_VERSION" "$ARCH" "$REGISTER_ONLY" < "$WORK/release.json")" || fail "Updater currency could not be established; deployment is untouched."
  mapfile -t RELEASE < <(printf '%s\n' "$output")
  if [[ "${RELEASE[3]}" -gt 0 ]]; then
    [[ "${CTR_SELF_DEPTH:-0}" -eq 0 ]] || fail "Updater re-execution depth exceeded; release metadata changed during this transaction."
    candidate="$WORK/updater.new"
    acquire_asset "${RELEASE[1]}" "${RELEASE[2]}" 1048576 "$candidate"
    bash -n "$candidate" || fail "Candidate updater syntax is invalid."
    [[ "$(timeout -k 2 10 bash "$candidate" --version | head -c 257)" == "${RELEASE[0]}" ]] || fail "Candidate updater version does not match release metadata."
    chmod 0755 "$candidate"
    target="$INSTALL_DIR/ctr_update.sh"
    [[ ! -L "$target" && ( ! -e "$target" || -f "$target" ) ]] || fail "Updater destination is not a regular file."
    if [[ -f "$target" ]]; then
      backup="$(mktemp "$target.backup-$(date -u '+%Y%m%dT%H%M%SZ').XXXXXX")"
      cp -p -- "$target" "$backup"
    fi
    mv -f -- "$candidate" "$target" || fail "Updater promotion failed; previous updater is retained."
    local -a operation=(--install-dir "$INSTALL_DIR" --health-timeout "$HEALTH_TIMEOUT")
    [[ "$INSTALL_MODE" -eq 0 ]] || operation+=(--install)
    [[ "$REGISTER_ONLY" -eq 0 ]] || operation+=(--register-only)
    [[ -z "$ASSETS_DIR" ]] || operation+=(--release-assets-dir "$ASSETS_DIR")
    export CTR_SELF_DEPTH=1 CTR_EXEC_LOCK_TOKEN="$LOCK_TOKEN" CTR_EXEC_WORK="$WORK" CTR_SELF_FROM="$UPDATER_VERSION"
    exec bash "$target" "${operation[@]}"
  fi
  SELF_CHECKED_AT="$(utc_now)"
  [[ "${CTR_SELF_DEPTH:-0}" -eq 0 ]] || SELF_RESULT=updated
  [[ "${RELEASE[3]}" -ge 0 ]] || SELF_RESULT=newer_installed
}

prepare_fresh_destination() {
  local selected="${INSTALL_DIR_OVERRIDE:-$HOME/$DEFAULT_INSTALL_BASENAME}" name
  [[ "$selected" != *$'\n'* && "$selected" != *$'\r'* ]] || fail "Invalid installation path."
  if [[ ! -e "$selected" ]]; then
    [[ -d "$(dirname -- "$selected")" ]] || fail "Create the parent installation directory first."
    mkdir -- "$selected"
    FRESH_CREATED=1
  fi
  INSTALL_DIR="$(canonical_directory "$selected")" || fail "Installation destination must be a directory."
  [[ "$INSTALL_DIR" != / && -w "$INSTALL_DIR" ]] || fail "Unsafe/unwritable installation destination."
  [[ ( ! -e "$INSTALL_DIR/.ctr-install.json" && ! -L "$INSTALL_DIR/.ctr-install.json" ) || ( -f "$INSTALL_DIR/.ctr-install.json" && ! -L "$INSTALL_DIR/.ctr-install.json" ) ]] || fail "Installation recovery record must be a regular file."
  for name in docker-compose.yml docker-compose.yaml compose.yml compose.yaml docker-compose.override.yml docker-compose.override.yaml compose.override.yml compose.override.yaml; do
    [[ ! -e "$INSTALL_DIR/$name" && ! -L "$INSTALL_DIR/$name" ]] || fail "Existing Compose installation: use ctr_update.sh --install-dir PATH without --install."
  done
  # .env affects Compose even if its original purpose was unrelated to CTR.
  [[ ! -e "$INSTALL_DIR/.env" && ! -L "$INSTALL_DIR/.env" ]] || fail "Existing .env conflicts with fresh Compose configuration; select another directory."
  if [[ ! -f "$INSTALL_DIR/.ctr-install.json" ]]; then
    for name in data exports imports tools ctr_update.sh; do
      if [[ "${CTR_SELF_DEPTH:-0}" -eq 1 && "$name" == ctr_update.sh ]]; then continue; fi
      [[ ! -e "$INSTALL_DIR/$name" && ! -L "$INSTALL_DIR/$name" ]] || fail "Fresh destination conflicts with managed path: $name"
    done
  fi
  CONFIGURED_IMAGE="$OFFICIAL_IMAGE"
  COMPOSE_FILE="$INSTALL_DIR/docker-compose.yml"
  DATA_DIR="$INSTALL_DIR/data"
  STATE_FILE="$DATA_DIR/host_updater_state.json"
  LOCK_DIR="$INSTALL_DIR/.ctr_update.lock"
  LOCK_GUARD="$INSTALL_DIR/.ctr_update.lock.acquire"
}

probe_tools() {
  local directory="$1"
  [[ "$(timeout -k 2 20 bash "$directory/ctr_snapshot.sh" --version)" == "$TOOLS_VERSION" ]] || fail "Snapshot wrapper version mismatch."
  [[ "$(timeout -k 2 20 "$directory/ctr-local-inventory" --version)" == "$TOOLS_VERSION" ]] || fail "Inventory version mismatch."
  [[ "$(timeout -k 2 20 "$directory/ctr-snapshot-normalize" --version)" == "$TOOLS_VERSION" ]] || fail "Normalizer version mismatch."
  local whos
  whos="$(timeout -k 2 20 "$directory/whosthere" version)" || fail "WhosThere version probe failed."
  [[ "$whos" =~ (^|[^0-9.])v?0\.8\.3([^0-9.]|$) ]] || fail "WhosThere version mismatch."
}

verify_tools_tree() {
  local directory="$1" expected="$2" validator_op="${3:-archive}"
  [[ -d "$directory" && ! -L "$directory" ]] || return 1
  [[ -f "$directory/bundle-manifest.json" && ! -L "$directory/bundle-manifest.json" ]] || return 1
  # Refuse unfamiliar paths before reading/compressing their contents. The
  # installed layout is deliberately fixed and only two levels deep.
  local path relative size total=0
  while IFS= read -r -d '' path; do
    [[ ! -L "$path" ]] || return 1
    relative="${path#"$directory"/}"
    if [[ -d "$path" ]]; then
      [[ "$relative" == schemas || "$relative" == licenses ]] || return 1
    elif [[ -f "$path" ]]; then
      case "$relative" in
        bundle-manifest.json|ctr_snapshot.sh|ctr-local-inventory|ctr-snapshot-normalize|whosthere|schemas/ctr-local-inventory-v1.schema.json|schemas/ctr-system-snapshot-v1.schema.json|licenses/WhosThere.txt|licenses/CTRoadmap.txt) ;;
        *) return 1 ;;
      esac
      size="$(wc -c < "$path")"
      [[ "$size" -le 67108864 ]] || return 1
      total=$((total + size))
      [[ "$total" -le 268435456 ]] || return 1
    else return 1
    fi
  done < <(find "$directory" -mindepth 1 -maxdepth 2 -print0)
  tar -czf - -C "$directory" . | head -c 67108865 > "$WORK/tools-inspect.tar.gz" || return 1
  host_python "$validator_op" "$ARCH" "$expected" < "$WORK/tools-inspect.tar.gz"
}

recover_tools() {
  local record="$INSTALL_DIR/.ctr-tools-promotion.json" output
  [[ ! -L "$record" ]] || fail "Unsafe tool promotion record."
  [[ -e "$record" ]] || return 0
  output="$(host_python promotion "$ARCH" < "$record")" || fail "Inspect the interrupted tool promotion record."
  local -a pending
  mapfile -t pending < <(printf '%s\n' "$output")
  local candidate="$INSTALL_DIR/${pending[0]}" backup="$INSTALL_DIR/${pending[1]}"
  if [[ -d "$INSTALL_DIR/tools" ]] && verify_tools_tree "$INSTALL_DIR/tools" "${pending[2]}" >/dev/null; then
    [[ ! -e "$candidate" && ! -L "$candidate" ]] || fail "Ambiguous completed tools promotion; candidate retained for inspection."
    rm -- "$record"
  elif [[ ! -e "$INSTALL_DIR/tools" && ! -L "$INSTALL_DIR/tools" && -d "$backup" && ! -L "$backup" ]]; then
    mv -- "$backup" "$INSTALL_DIR/tools"
    rm -- "$record"
    fail "Restored tools after interrupted promotion. Inspect retained candidate $candidate, then rerun."
  else
    fail "Interrupted tool promotion requires inspection; all directories were retained."
  fi
}

stage_tools() {
  TOOLS_VERSION="${RELEASE[4]}"
  TOOLS_CANDIDATE=""
  recover_tools
  if [[ -e "$INSTALL_DIR/tools" || -L "$INSTALL_DIR/tools" ]]; then
    if verify_tools_tree "$INSTALL_DIR/tools" "${RELEASE[7]}" >/dev/null 2>&1; then
      probe_tools "$INSTALL_DIR/tools"
      return
    fi
    verify_tools_tree "$INSTALL_DIR/tools" "" owned-tree >/dev/null || fail "Unmanaged tools contents; move them aside manually before provisioning."
  fi
  acquire_asset "${RELEASE[5]}" "${RELEASE[6]}" 67108864 "$WORK/tools.tar.gz"
  [[ "$(wc -c < "$WORK/tools.tar.gz")" -eq "${RELEASE[8]}" ]] || fail "Snapshot archive size mismatch."
  [[ "$(host_python archive "$ARCH" "${RELEASE[7]}" < "$WORK/tools.tar.gz")" == "$TOOLS_VERSION" ]] || fail "Snapshot bundle validation failed."
  TOOLS_CANDIDATE="$(mktemp -d "$INSTALL_DIR/.ctr-tools.new.XXXXXX")"
  tar -xzf "$WORK/tools.tar.gz" --no-same-owner --no-same-permissions -C "$TOOLS_CANDIDATE"
  chmod 0755 "$TOOLS_CANDIDATE" "$TOOLS_CANDIDATE/schemas" "$TOOLS_CANDIDATE/licenses" \
    "$TOOLS_CANDIDATE/ctr_snapshot.sh" "$TOOLS_CANDIDATE/ctr-local-inventory" "$TOOLS_CANDIDATE/ctr-snapshot-normalize" "$TOOLS_CANDIDATE/whosthere"
  chmod 0644 "$TOOLS_CANDIDATE/bundle-manifest.json" "$TOOLS_CANDIDATE/schemas/"*.json "$TOOLS_CANDIDATE/licenses/"*.txt
  probe_tools "$TOOLS_CANDIDATE"
}

promote_tools() {
  [[ -n "$TOOLS_CANDIDATE" ]] || return 0
  local backup record="$INSTALL_DIR/.ctr-tools-promotion.json"
  backup="$(mktemp -d "$INSTALL_DIR/tools.backup-$(date -u '+%Y%m%dT%H%M%SZ').XXXXXX")"
  rmdir -- "$backup"
  printf '{"schema_version":1,"architecture":"%s","candidate":"%s","backup":"%s","manifest_sha256":"%s"}\n' \
    "$ARCH" "$(basename "$TOOLS_CANDIDATE")" "$(basename "$backup")" "${RELEASE[7]}" > "$WORK/promotion.json"
  mv -- "$WORK/promotion.json" "$record"
  if [[ -d "$INSTALL_DIR/tools" ]]; then mv -- "$INSTALL_DIR/tools" "$backup"; fi
  if ! mv -- "$TOOLS_CANDIDATE" "$INSTALL_DIR/tools"; then
    if [[ -d "$backup" && ! -e "$INSTALL_DIR/tools" ]]; then mv -- "$backup" "$INSTALL_DIR/tools"; fi
    rm -- "$record"
    fail "Tool promotion failed; previous tools restored where possible. Correct the filesystem problem and retry."
  fi
  if ! verify_tools_tree "$INSTALL_DIR/tools" "${RELEASE[7]}" >/dev/null; then
    mv -- "$INSTALL_DIR/tools" "$TOOLS_CANDIDATE"
    if [[ -d "$backup" ]]; then mv -- "$backup" "$INSTALL_DIR/tools"; fi
    fail "Promoted tools failed verification; previous tools restored and recovery record retained."
  fi
  TOOLS_CANDIDATE=""
  rm -- "$record"
}

create_fresh_layout() {
  local marker="$INSTALL_DIR/.ctr-install.json" name path updater_hash
  updater_hash="$(sha_file "$(resolve_script_file)")"
  [[ ! -L "$marker" ]] || fail "Unsafe installation recovery record."
  if [[ -f "$marker" ]]; then
    host_python install-marker "$INSTALL_DIR" "$updater_hash" "${RELEASE[7]}" < "$marker" || fail "Interrupted installation identities changed; inspect retained paths before continuing."
    if [[ -e "$INSTALL_DIR/ctr_update.sh" ]]; then
      [[ ! -L "$INSTALL_DIR/ctr_update.sh" && -f "$INSTALL_DIR/ctr_update.sh" && "$(sha_file "$INSTALL_DIR/ctr_update.sh")" == "$updater_hash" ]] || fail "Interrupted installation updater differs."
    fi
    # No application has started before Compose exists. Only registration state
    # can legitimately occupy these freshly created directories at this point.
    for name in data exports imports; do
      for path in "$INSTALL_DIR/$name"/* "$INSTALL_DIR/$name"/.[!.]* "$INSTALL_DIR/$name"/..?*; do
        [[ -e "$path" || -L "$path" ]] || continue
        [[ "$path" == "$INSTALL_DIR/data/host_updater_state.json" && -f "$path" && ! -L "$path" ]] || fail "Unexpected interrupted-install content: $path; preserved for inspection."
      done
    done
    if [[ -e "$INSTALL_DIR/tools" || -L "$INSTALL_DIR/tools" ]]; then
      verify_tools_tree "$INSTALL_DIR/tools" "${RELEASE[7]}" >/dev/null || fail "Interrupted installation tools differ from their recorded identity."
    fi
  else
    printf '{"schema_version":1,"install_dir":"%s","managed_paths":["data","exports","imports","tools","ctr_update.sh"],"updater_sha256":"%s","tools_manifest_sha256":"%s"}\n' \
      "$(json_escape "$INSTALL_DIR")" "$updater_hash" "${RELEASE[7]}" > "$WORK/install-marker.json"
    mv -- "$WORK/install-marker.json" "$marker"
  fi
  for name in data exports imports; do
    [[ ! -L "$INSTALL_DIR/$name" && ( ! -e "$INSTALL_DIR/$name" || -d "$INSTALL_DIR/$name" ) ]] || fail "Unsafe managed directory: $name"
    mkdir -p -- "$INSTALL_DIR/$name"
  done
  COMPOSE_CANDIDATE="$(mktemp "$INSTALL_DIR/.ctr-compose.new.XXXXXX")"
  cat > "$COMPOSE_CANDIDATE" <<'COMPOSE'
services:
  ctroadmap:
    image: ghcr.io/noobcity99/ctroadmap:beta
    container_name: ctroadmap-beta
    ports:
      - "8088:8088"
    volumes:
      - ./data:/app/data
      - ./exports:/app/exports
      - ./imports:/app/imports:ro
    restart: unless-stopped
COMPOSE
  chmod 0644 "$COMPOSE_CANDIDATE"
  docker compose -f "$COMPOSE_CANDIDATE" config --format json > "$WORK/after.json"
  host_python imports "$INSTALL_DIR" < "$WORK/after.json" >/dev/null
}

prepare_compose_migration() {
  local status
  COMPOSE_CANDIDATE=""
  COMPOSE_HASH="$(sha_file "$COMPOSE_FILE")"
  ENV_HASH=""
  if [[ -f "$INSTALL_DIR/.env" ]]; then ENV_HASH="$(sha_file "$INSTALL_DIR/.env")"; fi
  host_python compose-inputs < "$COMPOSE_FILE" || fail "External Compose includes, extends and env_file inputs are unsupported; use one release file and its .env."
  compose config --format json > "$WORK/before.json"
  status="$(host_python imports "$INSTALL_DIR" < "$WORK/before.json")" || fail "Unsafe imports configuration; no integration was changed."
  [[ ! -L "$INSTALL_DIR/imports" && ( ! -e "$INSTALL_DIR/imports" || -d "$INSTALL_DIR/imports" ) ]] || fail "Imports must be a real directory."
  if [[ "$status" == missing ]]; then
    COMPOSE_CANDIDATE="$(mktemp "$INSTALL_DIR/.ctr-compose.new.XXXXXX")"
    host_python compose-patch < "$COMPOSE_FILE" > "$COMPOSE_CANDIDATE" || fail "Add the read-only imports mount manually for this unsupported Compose layout."
    chmod --reference="$COMPOSE_FILE" "$COMPOSE_CANDIDATE"
    docker compose -f "$COMPOSE_CANDIDATE" config --format json > "$WORK/after.json"
    printf '{"before":%s,"after":%s}\n' "$(cat "$WORK/before.json")" "$(cat "$WORK/after.json")" |
      host_python compare "$INSTALL_DIR" || fail "Compose candidate changed unsupported configuration."
  fi
}

commit_integration() {
  local current_env="" backup
  if [[ "$INSTALL_MODE" -eq 0 ]]; then
    [[ ! -L "$COMPOSE_FILE" && "$(sha_file "$COMPOSE_FILE")" == "$COMPOSE_HASH" ]] || fail "Compose changed during preparation; candidate was not promoted."
    if [[ -f "$INSTALL_DIR/.env" ]]; then current_env="$(sha_file "$INSTALL_DIR/.env")"; fi
    [[ "$current_env" == "$ENV_HASH" ]] || fail "Compose environment changed during preparation."
  fi
  promote_tools
  mkdir -p -- "$INSTALL_DIR/imports"
  if [[ -n "$COMPOSE_CANDIDATE" ]]; then
    if [[ -e "$COMPOSE_FILE" ]]; then
      [[ "$(sha_file "$COMPOSE_FILE")" == "$COMPOSE_HASH" ]] || fail "Compose changed before promotion; original retained."
      backup="$(mktemp "$COMPOSE_FILE.backup-$(date -u '+%Y%m%dT%H%M%SZ').XXXXXX")"
      cp -p -- "$COMPOSE_FILE" "$backup"
    fi
    mv -f -- "$COMPOSE_CANDIDATE" "$COMPOSE_FILE"
    COMPOSE_CANDIDATE=""
  fi
  INTEGRATION_STATUS=prepared
  IMPORTS_STATUS=prepared
}

verify_runtime() {
  local containers version_json
  containers="$(compose ps -q "$SERVICE_NAME")"
  [[ -n "$containers" && "$containers" != *$'\n'* ]] || fail "Expected one running CTRoadmap container."
  printf '{"compose":%s,"containers":%s}\n' "$(compose config --format json)" "$(docker inspect "$containers")" |
    host_python runtime "$INSTALL_DIR" || fail "Runtime mounts failed verification."
  IMPORTS_STATUS=verified
  INTEGRATION_STATUS=complete
  wait_for_health
  capture_after_state
  version_json="$(compose exec -T "$SERVICE_NAME" python -c 'import urllib.request; print(urllib.request.urlopen("http://127.0.0.1:8088/api/app/version", timeout=3).read(1048577).decode())')"
  printf '{"api":%s,"expected":"%s"}\n' "$version_json" "$(json_escape "$CURRENT_VERSION")" |
    host_python identity || fail "Runtime/API version identity differs."
}

host_python() {
  local validator
  validator="$(cat <<'CTR_PY'
import copy, gzip, hashlib, io, json, os, posixpath, re, sys, tarfile
from datetime import datetime

LIMIT = 1024 * 1024
FILES = {'ctr_snapshot.sh', 'ctr-local-inventory', 'ctr-snapshot-normalize', 'whosthere',
         'schemas/ctr-local-inventory-v1.schema.json', 'schemas/ctr-system-snapshot-v1.schema.json',
         'licenses/WhosThere.txt', 'licenses/CTRoadmap.txt'}

def require(ok, message):
    if not ok: raise ValueError(message)

def checksum(value):
    require(isinstance(value, str) and re.fullmatch('[0-9a-f]{64}', value), 'Invalid SHA-256')
    return value

def version(value):
    require(isinstance(value, str) and re.fullmatch(r'(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)', value), 'Invalid updater/tool version')
    return tuple(map(int, value.split('.')))

def unique(pairs):
    result = {}
    for key, value in pairs:
        require(key not in result, 'Duplicate JSON key')
        result[key] = value
    return result

def decode(raw):
    require(len(raw) <= LIMIT, 'JSON exceeds size limit')
    def invalid_constant(value): raise ValueError('Non-finite JSON number')
    return json.loads(raw, object_pairs_hook=unique, parse_constant=invalid_constant)

def read_json(): return decode(sys.stdin.buffer.read(LIMIT + 1))

def bundle_manifest(raw, arch, expected=None):
    if expected: require(hashlib.sha256(raw).hexdigest() == checksum(expected), 'Bundle manifest checksum mismatch')
    m = decode(raw)
    require(type(m['schema_version']) is int and m['schema_version'] == 1 and m['architecture'] == arch, 'Wrong bundle schema/architecture')
    version(m['version'])
    entries = m['files']
    require(len(entries) == len(FILES) and {e['path'] for e in entries} == FILES, 'Unexpected bundle file list')
    for e in entries:
        checksum(e['sha256'])
        require(type(e['size']) is int and 0 <= e['size'] <= 64*LIMIT, 'Invalid member size')
        require(e['mode'] == (0o755 if '/' not in e['path'] else 0o644), 'Invalid bundle permissions')
    return m

def archive(arch, expected, owned=False):
    packed = sys.stdin.buffer.read(64*LIMIT+1)
    require(len(packed) <= 64*LIMIT, 'Archive exceeds size limit')
    with gzip.GzipFile(fileobj=io.BytesIO(packed)) as stream:
        raw = stream.read(256*LIMIT + 512*256 + 10241)
    require(len(raw) <= 256*LIMIT + 512*256 + 10240, 'Expanded archive exceeds limit')
    members = {}
    seen = set()
    with tarfile.open(fileobj=io.BytesIO(raw), mode='r:') as tar:
        for index, member in enumerate(tar):
            require(index < 256, 'Too many archive members')
            name = member.name
            if name.startswith('./'): name = name[2:]
            require(not name.startswith('/') and '..' not in name.split('/') and '\\' not in name, 'Unsafe archive path')
            require(name not in seen, 'Duplicate archive member')
            seen.add(name)
            if member.isdir():
                require(name in ('', '.', 'schemas', 'licenses'), 'Unexpected archive directory')
                continue
            require(member.isfile() and name not in members, 'Links, special or duplicate archive members are forbidden')
            require(name in FILES | {'bundle-manifest.json'}, 'Unexpected archive file')
            require(0 <= member.size <= 64*LIMIT, 'Archive member exceeds size limit')
            members[name] = (tar.extractfile(member).read(), member.mode)
    require('bundle-manifest.json' in members, 'Unmanaged tools directory: no bundle manifest')
    manifest = bundle_manifest(members['bundle-manifest.json'][0], arch, None if owned else expected)
    if not owned:
        require(set(members) == FILES | {'bundle-manifest.json'}, 'Missing bundle member')
        require(sum(len(v[0]) for v in members.values()) <= 256*LIMIT, 'Expanded files exceed limit')
        for e in manifest['files']:
            data, mode = members[e['path']]
            require(len(data) == e['size'] and hashlib.sha256(data).hexdigest() == e['sha256'] and mode == e['mode'], 'Bundle member identity mismatch')
            if e['path'] in ('ctr-local-inventory','ctr-snapshot-normalize','whosthere'):
                require(data[:6] == b'\x7fELF\x02\x01' and len(data)>20 and int.from_bytes(data[18:20],'little') == {'amd64':62,'arm64':183}[arch], 'Wrong executable architecture')
    print(manifest['version'])

def imports(config, install, runtime=False, required=False):
    mounts = config if runtime else config['services']['ctroadmap'].get('volumes', [])
    found = {}
    for m in mounts:
        target = posixpath.normpath(m.get('Destination' if runtime else 'target', ''))
        for wanted in ('/app/data', '/app/exports', '/app/imports'):
            if target == wanted:
                require(wanted not in found, 'Duplicate managed mount')
                require(m.get('Type' if runtime else 'type') == 'bind', 'Managed mount must be a bind')
                source = m.get('Source' if runtime else 'source', '')
                require(isinstance(source, str) and source.startswith('/') and not any(ord(c)<32 for c in source), 'Invalid bind source')
                writable = m.get('RW') if runtime else not m.get('read_only', False)
                require(writable == (wanted != '/app/imports'), 'Managed mount has incorrect write permissions')
                found[wanted] = posixpath.normpath(source)
            elif target == '/' or wanted.startswith(target.rstrip('/')+'/') or target.startswith(wanted+'/'):
                raise ValueError('Overlapping managed mount')
    require('/app/data' in found and '/app/exports' in found, 'Missing data/export bind')
    require(found['/app/data'] != found['/app/exports'], 'Data and exports must have separate sources')
    if '/app/imports' in found:
        path = found['/app/imports']
        for key in ('/app/data','/app/exports'):
            other=found[key]
            require(path != other and not path.startswith(other.rstrip('/')+'/') and not other.startswith(path.rstrip('/')+'/'), 'Imports overlaps a writable host bind source')
    expected = posixpath.join(install, 'imports')
    if '/app/imports' in found: require(found['/app/imports'] == expected, 'Conflicting imports source')
    elif required: raise ValueError('Missing read-only imports mount')
    if not runtime:
        env = config['services']['ctroadmap'].get('environment') or {}
        require(env.get('CTR_IMPORTS_DIR', '/app/imports') in (None, '/app/imports'), 'Unsupported CTR_IMPORTS_DIR')
    return found

def patch_compose():
    import yaml
    raw = sys.stdin.buffer.read(LIMIT+1)
    require(len(raw)<=LIMIT, 'Compose exceeds size limit')
    text = raw.decode('utf-8')
    node = yaml.compose(text, Loader=yaml.SafeLoader)
    def child(parent, key):
        require(isinstance(parent, yaml.MappingNode), 'Unsupported Compose mapping')
        keys = [k.value for k,v in parent.value]
        require(len(keys)==len(set(keys)) and '<<' not in keys, 'Ambiguous Compose keys/merge')
        matches = [v for k,v in parent.value if k.value==key]
        require(len(matches)==1, 'Missing/ambiguous Compose field: '+key)
        return matches[0]
    service = child(child(node, 'services'), 'ctroadmap')
    volumes = child(service, 'volumes')
    require(isinstance(volumes, yaml.SequenceNode) and not volumes.flow_style, 'Automatic migration requires a block volumes list; add the read-only imports bind manually')
    require(service.start_mark.index <= volumes.start_mark.index < volumes.end_mark.index <= service.end_mark.index,
            'Anchored volumes outside the CTR service are unsupported')
    lines = text.splitlines(keepends=True)
    first = volumes.start_mark.line
    # Only insert immediately before the first direct block item; never rewrite YAML.
    match = re.match(r'^( +)-\s', lines[first])
    require(match is not None and all(not isinstance(v, yaml.SequenceNode) for v in volumes.value), 'Unsupported volumes layout')
    require(not any('&' in line or '*' in line for line in lines[service.start_mark.line:service.end_mark.line+1]), 'Anchored/aliased CTR service requires manual migration')
    newline = '\r\n' if '\r\n' in text else '\n'
    lines.insert(first, match[1] + '- ./imports:/app/imports:ro' + newline)
    sys.stdout.buffer.write(''.join(lines).encode())

def main():
    op, *args = sys.argv[1:]
    if op == 'compose-inputs':
        import yaml
        raw=sys.stdin.buffer.read(LIMIT+1)
        require(len(raw)<=LIMIT, 'Compose exceeds size limit')
        config=yaml.safe_load(raw)
        require(isinstance(config,dict) and 'include' not in config, 'External Compose include is unsupported')
        for service in config['services'].values():
            require(isinstance(service,dict) and not any(key in service for key in ('extends','env_file')), 'External service configuration inputs are unsupported')
        return
    if op in ('archive', 'owned-tree'):
        archive(args[0], args[1] if len(args)>1 else None, op=='owned-tree'); return
    if op == 'compose-patch': patch_compose(); return
    p = read_json()
    if op == 'release':
        local, installed, arch, registration = args
        require(type(p.get('manifest_schema')) is int and p['manifest_schema']==2 and p.get('channel')=='beta', 'Unsupported release schema/channel')
        require(isinstance(p.get('latest_version'), str) and re.fullmatch(r'\d+\.\d+\.\d+(?:-(?:alpha|beta|rc)(?:\.\d+)?)?', p['latest_version']), 'Invalid application version')
        target = p['targets']['docker']
        require(target.get('update_method')=='ctr_update_v1', 'Unsupported Docker update method')
        a = target['updater']
        floor = max(version('0.2.0'), version(p.get('migration', {}).get('host_updater', {}).get('minimum_updater_version', '0.2.0')))
        published = version(a['version']); current = version(installed)
        require(published >= floor, 'Advertised updater is below the compatibility minimum')
        require(max(current, published) >= floor, 'Updater generation is incompatible')
        checksum(a['sha256'])
        if local=='1':
            require(p.get('kit_schema')==1 and re.fullmatch('[0-9a-f]{40}', p.get('source_commit','')), 'Invalid private kit identity')
            require(a.get('filename')=='ctr_update.sh' and a.get('source_commit')==p['source_commit'], 'Invalid private updater identity')
            location = a['filename']
        else:
            location = a['url']
            require(re.fullmatch(r'https://raw\.githubusercontent\.com/NoobCity99/CTRoadmap/[0-9a-f]{40}/ctr_update\.sh', location), 'Updater URL must identify an immutable official commit')
        values = [a['version'], location, a['sha256'], str((published>current)-(published<current))]
        if registration=='1': values += ['-']*5
        else:
            tools = target['snapshot_tools']; version(tools['version'])
            b = tools['architectures'][arch]
            filename = 'ctr-snapshot-tools-'+tools['version']+'-linux-'+arch+'.tar.gz'
            require(b.get('filename')==filename, 'Invalid bundle filename/architecture')
            require(b['url']=='https://github.com/NoobCity99/CTRoadmap/releases/download/snapshot-tools-v'+tools['version']+'/'+filename, 'Invalid versioned bundle URL')
            require(type(b['size']) is int and 0 < b['size'] <= 64*LIMIT, 'Invalid bundle size')
            values += [tools['version'], filename if local=='1' else b['url'], checksum(b['sha256']), checksum(b['manifest_sha256']), str(b['size'])]
        print('\n'.join(values + [p['latest_version']]))
    elif op == 'state-read':
        require(isinstance(p, dict) and type(p.get('schema_version')) is int and p['schema_version']==1, 'Unsupported/malformed updater state; inspect it before proceeding')
        version(p.get('updater_version'))
        require(p.get('deployment_type')=='compose_release' and p.get('install_dir')==args[0] and p.get('compose_file') in ('compose.yml','compose.yaml','docker-compose.yml','docker-compose.yaml'), 'Updater state does not describe this installation')
        require(p.get('last_result') in ('registered','running','success','failed'), 'Invalid prior updater result')
        value=p.get('registered_at','')
        require(isinstance(value,str) and len(value)<=64 and not any(ord(c)<32 for c in value), 'Invalid registration timestamp')
        require(datetime.fromisoformat(value.replace('Z','+00:00')).tzinfo is not None, 'Registration timestamp requires a timezone')
        print(value)
    elif op == 'identity':
        require(p['api']['current_version']==p['expected'] and bool(p['expected']), 'Runtime/API version mismatch')
    elif op == 'state-merge':
        previous, new = p['previous'], p['next']
        if args[0]=='1' and previous:
            for key in ('last_run_at','last_result','last_error','previous_version','current_version','previous_image_id','current_image_id',
                        'integration_status','imports_mount_status','snapshot_tools_version','snapshot_tools_architecture'):
                if key in previous: new[key]=previous[key]
        print(json.dumps(new, indent=2))
    elif op == 'imports':
        mounts=imports(p,args[0]); print('prepared' if '/app/imports' in mounts else 'missing')
    elif op == 'compare':
        before, after = p['before'], p['after']
        imports(before,args[0]); imports(after,args[0],required=True)
        changed=copy.deepcopy(after)
        changed['services']['ctroadmap']['volumes']=[v for v in changed['services']['ctroadmap']['volumes'] if v.get('target')!='/app/imports']
        require(changed==before, 'Compose migration changed unrelated resolved configuration')
    elif op == 'runtime':
        expected=imports(p['compose'],args[0],required=True)
        require(len(p['containers'])==1, 'Expected exactly one CTR container')
        actual=imports(p['containers'][0]['Mounts'],args[0],runtime=True,required=True)
        require(actual==expected, 'Runtime managed mounts differ from Compose')
    elif op == 'install-marker':
        require(set(p)=={'schema_version','install_dir','managed_paths','updater_sha256','tools_manifest_sha256'} and
                type(p['schema_version']) is int and p['schema_version']==1 and p['install_dir']==args[0] and
                p['managed_paths']==['data','exports','imports','tools','ctr_update.sh'], 'Unrecognized fresh-install recovery record')
        checksum(p['updater_sha256']); checksum(p['tools_manifest_sha256'])
        if len(args)>1:
            require(p['updater_sha256']==args[1] and p['tools_manifest_sha256']==args[2], 'Interrupted installation identities differ')
    elif op == 'promotion':
        require(type(p.get('schema_version')) is int and p['schema_version']==1 and p.get('architecture')==args[0], 'Unrecognized tool promotion record')
        for key, pattern in (('candidate',r'\.ctr-tools\.new\.[A-Za-z0-9]+'),('backup',r'tools\.backup-[A-Za-z0-9.-]+')):
            require(re.fullmatch(pattern,p[key]), 'Unsafe tool promotion record')
        checksum(p['manifest_sha256'])
        print('\n'.join(p[k] for k in ('candidate','backup','manifest_sha256')))
    else: raise ValueError('Unknown validator operation')

try:
    main()
except (ValueError, KeyError, TypeError, AttributeError, OSError, EOFError, tarfile.TarError, RecursionError) as exc:
    print('Host validation failed: '+str(exc), file=sys.stderr)
    sys.exit(1)
CTR_PY
)"
  timeout --foreground -k 2 60 docker run --rm --pull never -i --network none --read-only --cap-drop ALL --no-healthcheck \
    --security-opt no-new-privileges --entrypoint python "$PARSER_IMAGE" -c "$validator" "$@"
}

main() {
  local completed_at

  parse_args "$@"
  umask 077

  log "CTRoadmap host updater v$UPDATER_VERSION"
  check_prerequisites
  if [[ "$INSTALL_MODE" -eq 1 ]]; then
    prepare_fresh_destination
  else
    detect_installation
    validate_installation
  fi
  acquire_self_guard
  if [[ "${CTR_SELF_DEPTH:-0}" -eq 1 ]]; then
    WORK="${CTR_EXEC_WORK:-}"
    [[ "$WORK" == "$INSTALL_DIR"/.ctr-update-work.* && -d "$WORK" && ! -L "$WORK" && -O "$WORK" ]] || fail "Invalid re-execution workspace."
  else
    WORK="$(mktemp -d "$INSTALL_DIR/.ctr-update-work.XXXXXX")"
  fi
  if [[ "$INSTALL_MODE" -eq 1 ]]; then
    PARSER_IMAGE="$(docker image inspect --format '{{.Id}}' "$OFFICIAL_IMAGE" 2>/dev/null)" || {
      docker pull "$OFFICIAL_IMAGE"
      PARSER_IMAGE="$(docker image inspect --format '{{.Id}}' "$OFFICIAL_IMAGE")"
    }
    [[ -n "$PARSER_IMAGE" ]] || fail "Official validation image is unavailable."
    if [[ -f "$INSTALL_DIR/.ctr-install.json" ]]; then
      [[ ! -L "$INSTALL_DIR/.ctr-install.json" ]] || fail "Unsafe installation recovery record."
      host_python install-marker "$INSTALL_DIR" < "$INSTALL_DIR/.ctr-install.json"
    fi
  fi
  read_registered_at
  check_self
  acquire_lock
  if [[ "$INSTALL_MODE" -eq 1 ]]; then
    create_fresh_layout
  else
    validate_installation
  fi
  register_updater

  if [[ "$REGISTER_ONLY" -eq 1 ]]; then
    write_state "registered" "" ""
    log "Host updater registration completed."
    log "State file: $STATE_FILE"
    return 0
  fi

  validate_update_channel

  RUN_ACTIVE=1
  RUN_STARTED_AT="$(utc_now)"
  if [[ "$INSTALL_MODE" -eq 0 ]]; then capture_before_state; fi
  write_state "running" "$RUN_STARTED_AT" ""

  if [[ "$INSTALL_MODE" -eq 0 ]]; then prepare_compose_migration; fi
  stage_tools
  commit_integration
  write_state "running" "$RUN_STARTED_AT" ""

  log "Install directory: $INSTALL_DIR"
  log "Pulling the current CTRoadmap image..."
  compose pull "$SERVICE_NAME"

  log "Applying the CTRoadmap update..."
  compose up -d --no-build --no-deps "$SERVICE_NAME"

  verify_runtime

  completed_at="$(utc_now)"
  write_state "success" "$completed_at" ""
  RUN_ACTIVE=0
  if [[ "$INSTALL_MODE" -eq 1 ]]; then rm -f -- "$INSTALL_DIR/.ctr-install.json"; fi
  print_summary
}

main "$@"
