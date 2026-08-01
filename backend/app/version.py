from __future__ import annotations

import os
from typing import Literal

from pydantic import BaseModel


ReleaseChannel = Literal["beta", "stable"]

DEFAULT_VERSION = "0.4.0-beta"
DEFAULT_CHANNEL: ReleaseChannel = "beta"


class AppVersion(BaseModel):
    deployment_type: Literal["docker"] = "docker"
    channel: ReleaseChannel = DEFAULT_CHANNEL
    current_version: str = DEFAULT_VERSION
    build_sha: str = "unknown"
    build_date: str = "unknown"


def get_app_version() -> AppVersion:
    channel = os.environ.get("CTR_CHANNEL", DEFAULT_CHANNEL)
    return AppVersion(
        channel=channel if channel in {"beta", "stable"} else DEFAULT_CHANNEL,
        current_version=os.environ.get("CTR_VERSION", DEFAULT_VERSION),
        build_sha=os.environ.get("CTR_BUILD_SHA", "unknown"),
        build_date=os.environ.get("CTR_BUILD_DATE", "unknown"),
    )
