"""Validate the self-contained Brot SVG artwork."""
from pathlib import Path
from xml.etree import ElementTree as ET

ROOT = Path(__file__).resolve().parent.parent
NS = "{http://www.w3.org/2000/svg}"
assets = sorted((ROOT / "expressions").glob("*.svg")) + [ROOT / "brand" / "brot-animated-logo.svg"]

assert assets and all(path.is_file() for path in assets)
for asset in assets:
    source = asset.read_text()
    tree = ET.fromstring(source)
    assert tree.tag == NS + "svg", asset
    assert tree.attrib.get("role") == "img", asset
    assert tree.find(NS + "title") is not None, asset
    assert tree.find(NS + "desc") is not None, asset
    assert not any(token in source for token in ["NaN", "Infinity", "<image", "<script", 'href="http', "href='http"]), asset
    assert 'dur="5s"' in source, asset
    for element in tree.iter():
        assert not any(key.startswith("on") for key in element.attrib), asset

print(f"PASS: {len(assets)} self-contained Brot SVGs; valid XML, accessible names, native animation, and no external resources.")
