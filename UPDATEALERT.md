Implement **Update Advisory v1** for CTRoadmap beta.

Scope:

* Advisory-only update feature.
* Do **not** auto-update.
* Do **not** run Docker commands.
* Do **not** use/mount Docker socket.
* Do **not** add command execution or system-management behavior.

Requirements:

1. Bake app version/build metadata into the Docker image using env vars and OCI labels:

   * `CTR_VERSION`
   * `CTR_BUILD_SHA`
   * `CTR_BUILD_DATE`

2. Add backend endpoints:

   * `GET /api/app/version`
   * `GET /api/app/update`

3. Add a simple remote update manifest check using a public JSON file, ideally `latest.json`.

   * Compare current version to latest version.
   * Use a short timeout.
   * Gracefully handle offline/check-failed state.

4. Persist update-check state in:

   * `data/update_state.json`

   Include fields like:

   * `last_checked_at`
   * `last_result`
   * `latest_seen_version`
   * `update_checks_enabled`
   * `check_interval_hours`

5. Add Settings UI section:

   * Current version
   * Build SHA/date
   * Update check enabled/disabled
   * Last checked time
   * Update status
   * Privacy note: only a public version file is downloaded; no atlas data is uploaded.

6. Add a small toolbar badge/toast when an update is available.

   * Include buttons/actions:

     * View release notes
     * Copy update command
     * Remind me later

7. Use browser `localStorage` for dismiss/snooze state so users are not nagged repeatedly about the same version.

8. Add passive fallback reminder:

   * If update checks are disabled or fail, periodically remind the user that beta Docker updates can be checked manually.

9. Update README with:

   * Versioned Docker build example
   * `latest.json` format
   * Update command:
     `cd ~/ctroadmap-beta && docker compose pull && docker compose up -d`


Design Update Advisory v1 to be deployment-agnostic.

Do not hardcode Docker as the only update path. Introduce a deployment/channel concept such as:

- deployment_type: docker | linux_desktop | windows_desktop
- channel: beta | stable
- current_version
- build_sha
- build_date

The remote latest.json should support multiple targets, for example:

{
  "latest_version": "0.1.3-beta",
  "channel": "beta",
  "targets": {
    "docker": {
      "update_command": "cd ~/ctroadmap-beta && docker compose pull && docker compose up -d",
      "release_notes_url": "..."
    },
    "linux_desktop": {
      "download_url": "...",
      "sha256": "...",
      "notes": "Download and install the latest Linux desktop package."
    },
    "windows_desktop": {
      "download_url": "...",
      "sha256": "...",
      "notes": "Download and run the latest Windows installer."
    }
  }
}

For now, only Docker needs to be fully functional, but structure the backend/frontend so Linux and Windows desktop update instructions can be added later without redesigning the feature.

Keep it advisory-only: no auto-install, no command execution, no Docker socket, no updater daemon.
Keep implementation simple, local-first, and consistent with CTRoadmap’s current non-executing atlas/editor scope.
