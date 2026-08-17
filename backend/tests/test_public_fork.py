from __future__ import annotations

import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from pydantic import ValidationError

from backend.app import storage
from backend.app.models import Atlas, empty_atlas


class PublicForkSchemaTests(unittest.TestCase):
    def test_empty_atlas_has_canvas_only_default_layers(self) -> None:
        atlas = empty_atlas()
        self.assertEqual([view.id for view in atlas.views], [
                         "hardware", "software", "infrastructure", "everything"])
        for view in atlas.model_dump()["views"]:
            self.assertNotIn("layout_template", view)

    def test_layout_template_is_rejected(self) -> None:
        payload = empty_atlas().model_dump(by_alias=True)
        payload["views"][0]["layout_template"] = "handbook"
        with self.assertRaises(ValidationError):
            Atlas.model_validate(payload)


class DemoStorageTests(unittest.TestCase):
    def setUp(self) -> None:
        self.tempdir = tempfile.TemporaryDirectory()
        self.data_dir = Path(self.tempdir.name) / "data"
        self.exports_dir = Path(self.tempdir.name) / "exports"
        self.demo_path = self.data_dir / "demo.json"
        self.atlas_path = self.data_dir / "atlas.json"
        self.paths = patch.multiple(
            storage,
            DATA_DIR=self.data_dir,
            EXPORTS_DIR=self.exports_dir,
            DEMO_PATH=self.demo_path,
            ATLAS_PATH=self.atlas_path,
        )
        self.paths.start()

    def tearDown(self) -> None:
        self.paths.stop()
        self.tempdir.cleanup()

    def test_valid_demo_is_read_without_creating_canonical_atlas(self) -> None:
        self.data_dir.mkdir(parents=True)
        self.demo_path.write_text(json.dumps(
            empty_atlas().model_dump(by_alias=True)), encoding="utf-8")
        demo = storage.read_demo_atlas()
        self.assertEqual(len(demo.views), 4)
        self.assertFalse(self.atlas_path.exists())

    def test_missing_demo_does_not_create_a_file(self) -> None:
        with self.assertRaises(FileNotFoundError):
            storage.read_demo_atlas()
        self.assertFalse(self.demo_path.exists())
        self.assertFalse(self.atlas_path.exists())

    def test_invalid_json_is_rejected(self) -> None:
        self.data_dir.mkdir(parents=True)
        self.demo_path.write_text("{not json", encoding="utf-8")
        with self.assertRaises(json.JSONDecodeError):
            storage.read_demo_atlas()
        self.assertFalse(self.atlas_path.exists())

    def test_invalid_schema_is_rejected(self) -> None:
        self.data_dir.mkdir(parents=True)
        self.demo_path.write_text(
            '{"views":[{"id":"x","title":"X","layout_template":"handbook"}]}', encoding="utf-8")
        with self.assertRaises(ValidationError):
            storage.read_demo_atlas()
        self.assertFalse(self.atlas_path.exists())


if __name__ == "__main__":
    unittest.main()
# v0.6.0
