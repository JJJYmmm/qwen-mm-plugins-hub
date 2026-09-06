"""Build Hub-owned cookbooks and verify local case assets; no network or upstream prose import."""

import argparse
from hashlib import sha256
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def export_cookbooks(*, update_assets: bool = False) -> None:
    catalog = json.loads((ROOT / "data/catalog.json").read_text())
    asset_manifest = ROOT / "case-assets.json"
    assets = {}
    for file in sorted((ROOT / "public/cases").rglob("*")):
        if file.is_symlink():
            raise ValueError(f"Case assets cannot be symlinks: {file}")
        if file.is_file():
            content = file.read_bytes()
            if len(content) >= 25 * 1024 * 1024:
                raise ValueError(
                    f"Case file exceeds the per-file hosting budget: {file}"
                )
            assets[file.relative_to(ROOT / "public").as_posix()] = {
                "sha256": sha256(content).hexdigest(),
                "bytes": len(content),
            }
    if update_assets:
        asset_manifest.write_text(json.dumps(assets, indent=2) + "\n")
    elif assets != json.loads(asset_manifest.read_text()):
        raise ValueError(
            "Case assets changed; review them and run scripts/export_cookbooks.py --update-assets"
        )
    output = {}
    for plugin in catalog["plugins"]:
        path = f"content/cookbooks/{plugin['id']}/usage.md"
        markdown = (ROOT / path).read_text()
        if (
            "qianwen-res.oss-accelerate.aliyuncs.com/Qwen-MM-Plugins/asserts/"
            in markdown
        ):
            raise ValueError(f"Unmigrated demo URL: {path}")
        output[plugin["id"]] = {
            "markdown": markdown,
            "sourceUrl": f"https://github.com/JJJYmmm/qwen-mm-plugins-hub/blob/main/{path}",
        }
    (ROOT / "data/cookbooks.json").write_text(
        json.dumps(output, ensure_ascii=False, indent=2) + "\n"
    )
    print(f"Built {len(output)} Hub cookbooks; verified {len(assets)} case files")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--update-assets", action="store_true")
    args = parser.parse_args()
    export_cookbooks(update_assets=args.update_assets)
