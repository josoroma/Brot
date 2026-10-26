"""Package the Brot artwork, generator, README, skill, and minimal tooling."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

root = Path(__file__).resolve().parent.parent
paths = ["brand", "expressions", "scripts", "skills", "README.md", "LICENSE", "package.json"]
target = root / "brot-animated-bots.zip"
with ZipFile(target, "w", ZIP_DEFLATED) as archive:
    for name in paths:
        path = root / name
        files = sorted(path.rglob("*")) if path.is_dir() else [path]
        for file in files:
            if file.is_file() and "__pycache__" not in str(file):
                archive.write(file, Path("brot-animated-bots") / file.relative_to(root))
print(f"Packaged {target.name} ({target.stat().st_size:,} bytes)")
