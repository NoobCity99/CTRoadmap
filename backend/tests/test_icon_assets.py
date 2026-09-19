from __future__ import annotations

import asyncio
import io
import os
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from fastapi import HTTPException, UploadFile
from starlette.datastructures import Headers

from backend.app import icon_assets
from backend.app.models import Atlas, empty_atlas


class IconAssetTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.icons = self.root / "data" / "assets" / "icons"
        self.paths = patch.object(icon_assets, "ICONS_DIR", self.icons)
        self.paths.start()

    def tearDown(self):
        self.paths.stop()
        self.temp.cleanup()

    def upload(self, content=b"image", media_type="image/png", filename="../../client.png"):
        file = UploadFile(io.BytesIO(content), filename=filename, headers=Headers({"content-type": media_type}))
        try:
            return asyncio.run(icon_assets.upload_icon(file))
        finally:
            asyncio.run(file.close())

    def test_empty_library_does_not_require_directory(self):
        self.assertEqual(icon_assets.list_icons().icons, [])
        self.assertFalse(self.icons.exists())

    def test_upload_list_serve_delete_for_each_supported_type(self):
        for media_type, extension in icon_assets.ICON_MEDIA_TYPES.items():
            with self.subTest(media_type=media_type):
                result = self.upload(b"image-data", media_type)
                self.assertRegex(result.filename, rf"^[0-9a-f]{{32}}\{extension}$")
                self.assertEqual((self.icons / result.filename).read_bytes(), b"image-data")
                listed = icon_assets.list_icons().icons[0]
                self.assertEqual(listed.id, f"uploaded:{result.filename}")
                response = icon_assets.get_icon(result.filename)
                self.assertEqual(response.media_type, media_type)
                self.assertEqual(Path(response.path), self.icons / result.filename)
                self.assertEqual(icon_assets.delete_icon(result.filename), {"status": "deleted"})
                self.assertEqual(icon_assets.list_icons().icons, [])

    def test_upload_validation_and_boundary(self):
        for content, media_type, status in [(b"svg", "image/svg+xml", 415), (b"x", "text/plain", 415), (b"", "image/png", 400), (b"x" * (icon_assets.MAX_ICON_BYTES + 1), "image/png", 413)]:
            with self.subTest(status=status), self.assertRaises(HTTPException) as raised:
                self.upload(content, media_type)
            self.assertEqual(raised.exception.status_code, status)
        self.assertFalse(self.icons.exists())
        accepted = self.upload(b"x" * icon_assets.MAX_ICON_BYTES)
        self.assertEqual((self.icons / accepted.filename).stat().st_size, icon_assets.MAX_ICON_BYTES)

    def test_unsafe_missing_and_unsupported_paths_are_not_served_or_deleted(self):
        self.icons.mkdir(parents=True)
        outside = self.root / "outside.png"
        outside.write_bytes(b"outside")
        (self.icons / "bad.svg").write_text("<svg/>")
        (self.icons / "linked.png").symlink_to(outside)
        (self.icons / "directory.png").mkdir()
        for name in ["../outside.png", str(outside), "..\\outside.png", "bad.svg", "missing.png", "linked.png", "directory.png"]:
            for action in [icon_assets.get_icon, icon_assets.delete_icon]:
                with self.subTest(name=name, action=action.__name__), self.assertRaises(HTTPException) as raised:
                    action(name)
                self.assertEqual(raised.exception.status_code, 404)
        self.assertEqual(icon_assets.list_icons().icons, [])
        self.assertEqual(outside.read_bytes(), b"outside")

    def test_library_order_and_atlas_reference_round_trip(self):
        first = self.upload()
        second = self.upload(media_type="image/webp")
        os.utime(self.icons / first.filename, (1, 1))
        os.utime(self.icons / second.filename, (2, 2))
        self.assertEqual([x.filename for x in icon_assets.list_icons().icons], [second.filename, first.filename])
        payload = empty_atlas().model_dump(by_alias=True)
        ref = {"kind": "uploaded", **first.model_dump(), "id": f"uploaded:{first.filename}"}
        payload["tiles"] = [{"id": "node", "type": "node", "title": "Node", "fields": {"icon_ref": ref}}]
        atlas = Atlas.model_validate(payload)
        self.assertEqual(Atlas.model_validate_json(atlas.model_dump_json()).tiles[0].fields["icon_ref"], ref)

    def test_public_routes_are_registered_before_the_api_catch_all(self):
        from backend.app.main import app
        paths = [getattr(route, "path", "") for route in app.routes]
        self.assertLess(paths.index("/api/assets/icons"), paths.index("/api/{full_path:path}"))
        self.assertNotIn("/api/auth/status", paths)


if __name__ == "__main__":
    unittest.main()
