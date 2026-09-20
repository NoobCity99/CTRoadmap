#!/usr/bin/env bash

# CTRoadmap host updater
#
# This script is intentionally host-side and operator-invoked. It does not
# modify Atlas content, prune Docker resources, install packages, use sudo, or
# migrate the installation directory.

set -Eeuo pipefail

readonly UPDATER_VERSION="0.1.1"
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
readonly LOCK_TOKEN="$BASHPID.$RANDOM.$RANDOM"
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
    printf '  "last_error": %s\n' "$(json_string_or_null "$error_message")"
    printf '}\n'
  } > "$temp_file"

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
  if [[ "$LOCK_GUARD_HELD" -eq 1 ]]; then
    rmdir "$LOCK_GUARD" 2>/dev/null || true
    LOCK_GUARD_HELD=0
  fi
}

cleanup() {
  local exit_code=$?
  if [[ -n "$STATE_TMP" && -f "$STATE_TMP" ]]; then
    rm -f "$STATE_TMP"
  fi
  release_lock
  release_lock_guard
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
  --install-dir PATH  Use this CTRoadmap installation directory.
                      CTR_INSTALL_DIR provides the same override.
  --register-only     Install/register this updater without updating CTRoadmap.
  --health-timeout N  Wait up to N seconds for /api/health (default: 90).
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
}

check_command() {
  command -v "$1" >/dev/null 2>&1 || fail "$1 is required but was not found."
}

check_prerequisites() {
  [[ -z "$COMPOSE_FILE_FROM_ENV" ]] || fail "COMPOSE_FILE overrides are unsupported. Run from a single-file CTR release installation."
  check_command docker
  check_command date
  check_command mktemp

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

  if [[ -f "$INSTALL_DIR/.env" ]] && grep -Eq '^[[:space:]]*(export[[:space:]]+)?COMPOSE_FILE[[:space:]]*=' "$INSTALL_DIR/.env"; then
    fail "COMPOSE_FILE in .env is unsupported. Use a single-file CTR release configuration."
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
  mkdir "$LOCK_GUARD" 2>/dev/null ||
    fail "Another updater is acquiring/recovering the lock, or an acquisition guard was abandoned: $LOCK_GUARD. Do not remove it until you have verified no updater is active."
  LOCK_GUARD_HELD=1
  if [[ -e "$LOCK_DIR" || -L "$LOCK_DIR" ]]; then
    [[ -d "$LOCK_DIR" && ! -L "$LOCK_DIR" && -f "$LOCK_DIR/pid" && ! -L "$LOCK_DIR/pid" ]] ||
      fail "Incomplete or unrecognized updater lock: $LOCK_DIR. It has been preserved; verify no updater is active before manual recovery."
    IFS= read -r existing_pid < "$LOCK_DIR/pid" || true
    [[ "$existing_pid" =~ ^[1-9][0-9]*$ ]] ||
      fail "Incomplete updater lock: $LOCK_DIR. It has been preserved; verify no updater is active before manual recovery."
    if kill -0 "$existing_pid" 2>/dev/null || [[ -d "/proc/$existing_pid" ]]; then
      fail "Another CTRoadmap update is already running (PID $existing_pid)."
    fi
    # Same-owner locks avoid mistaking permission denial/hidden processes for
    # dead processes. Cross-user recovery requires operator inspection.
    [[ -O "$LOCK_DIR/pid" && -d /proc/self && -r /proc/uptime ]] ||
      fail "Cannot prove the updater lock is stale for this user; it has been preserved: $LOCK_DIR"
    [[ ! -L "$LOCK_DIR/token" ]] || fail "Unrecognized updater lock token; lock preserved."
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

  if [[ -f "$STATE_FILE" ]]; then
    stored="$(sed -n 's/^[[:space:]]*"registered_at"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' "$STATE_FILE" | head -n 1)"
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
    backup_file="$target_file.backup-$timestamp"
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

main() {
  local completed_at

  parse_args "$@"

  log "CTRoadmap host updater v$UPDATER_VERSION"
  check_prerequisites
  detect_installation
  validate_installation
  acquire_lock
  read_registered_at
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
  capture_before_state
  write_state "running" "$RUN_STARTED_AT" ""

  log "Install directory: $INSTALL_DIR"
  log "Pulling the current CTRoadmap image..."
  compose pull "$SERVICE_NAME"

  log "Applying the CTRoadmap update..."
  compose up -d --no-build --no-deps "$SERVICE_NAME"

  wait_for_health
  capture_after_state

  completed_at="$(utc_now)"
  write_state "success" "$completed_at" ""
  RUN_ACTIVE=0
  print_summary
}

main "$@"
