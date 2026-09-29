from __future__ import annotations

import base64
import re
from pathlib import Path


SOURCE = Path(__file__).resolve().parents[2] / "continetz.html"
OUTPUT = Path(__file__).resolve().parents[1] / "assets" / "images"
FILENAMES = (
    "continetz-logo.png",
    "earth-map.jpg",
    "textiles.jpg",
    "stone-surfaces.jpg",
    "packaging.jpg",
)


def extract_assets() -> None:
    source = SOURCE.read_text(encoding="utf-8")
    assets = re.findall(r"data:image/[^\"']+", source)

    if len(assets) != len(FILENAMES):
        raise ValueError(f"Expected {len(FILENAMES)} embedded images, found {len(assets)}")

    OUTPUT.mkdir(parents=True, exist_ok=True)

    for filename, data_uri in zip(FILENAMES, assets):
        encoded = data_uri.split(",", 1)[1]
        (OUTPUT / filename).write_bytes(base64.b64decode(encoded))


if __name__ == "__main__":
    extract_assets()