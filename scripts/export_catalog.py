"""Export real MCP ToolSpec.meta and Skill source without invoking handlers.

Each plugin uses a fresh process so source overrides cannot share imports.
Missing imports and invalid versions fail the build instead of hiding tools.
"""

from __future__ import annotations

import argparse
import importlib
import inspect
import json
import os
from pathlib import Path
import re
import subprocess
import sys
from urllib.parse import quote

import yaml

ROOT = Path(__file__).resolve().parents[1]


def git(source: Path, *args: str) -> str:
    return subprocess.check_output(["git", "-C", str(source), *args], text=True).strip()


def worker(source: Path, cap: str) -> dict:
    """Read exactly the definitions advertised by the MCP registry."""
    folder = source / "src" / "capabilities" / cap
    sys.path[:0] = [str(source / "src"), str(folder)]
    manifest = json.loads((folder / ".codex-plugin/plugin.json").read_text())
    skill_path = folder / "skill/SKILL.md"
    raw = skill_path.read_text()
    parts = raw.split("---", 2)
    if len(parts) != 3 or parts[0].strip():
        raise ValueError(f"Missing Skill front matter: {cap}")
    front = yaml.safe_load(parts[1])
    tools, requirements = [], []
    module_doc = ""
    if manifest.get("mcpServers"):
        module = importlib.import_module("qwen_mm_plugins_" + cap.replace("-", "_"))
        if module.__version__ != manifest["version"]:
            raise ValueError(f"Manifest/server version mismatch: {cap}")
        module_doc = inspect.getdoc(module) or ""
        requirements = [
            {key: d[key] for key in ("label", "tools", "hint")}
            for d in getattr(module, "SYSTEM_DEPS", [])
        ]
        for spec in module.SPECS:
            path = Path(inspect.getfile(spec.handle)).resolve()
            tools.append(
                {
                    **spec.meta,
                    "sourcePath": path.relative_to(source).as_posix(),
                    "sourceLine": inspect.getsourcelines(spec.handle)[1],
                }
            )
    markdown = parts[2].strip()
    prerequisite = re.search(
        r"^## Prerequisites?\b[^\n]*\n.*?(?=^## |\Z)", markdown, re.M | re.S
    )
    return {
        "name": manifest["name"],
        "version": manifest["version"],
        "description": manifest["description"],
        "moduleDocstring": module_doc,
        "requirements": requirements,
        "skill": {
            "name": front["name"],
            "description": front.get("description", ""),
            "markdown": markdown,
            "prerequisites": prerequisite.group().strip() if prerequisite else "",
            "raw": raw,
            "path": skill_path.relative_to(source).as_posix(),
        },
        "tools": sorted(tools, key=lambda t: t["name"]),
        "kind": "Skill + MCP" if manifest.get("mcpServers") else "Skill only",
    }


def export(source: Path, extras: list[str]) -> dict:
    config = json.loads((ROOT / "catalog.config.json").read_text())
    release_catalog = json.loads((source / "plugin-versions.json").read_text())
    versions = release_catalog["plugins"]
    sources = {cap: source for cap in versions}
    for extra in extras:
        cap, location = extra.split("=", 1)
        if cap not in sources:
            sources[cap] = Path(location).resolve()
    plugins = []
    for cap, checkout in sources.items():
        env = {
            k: v
            for k, v in os.environ.items()
            if not k.startswith(
                ("QWEN_", "DASHSCOPE_", "MEM_", "SERPER_", "TAVILY_", "EXA_")
            )
        }
        env["QWEN_MM_CONFIG"] = os.devnull
        result = subprocess.check_output(
            [sys.executable, __file__, "--source", str(checkout), "--worker", cap],
            text=True,
            env=env,
        )
        data = json.loads(result)
        sha = git(checkout, "rev-parse", "HEAD")
        skill_folder = f"src/capabilities/{cap}/skill/"
        skill_files = git(
            checkout, "ls-tree", "-rz", "--name-only", "HEAD", "--", skill_folder
        ).split("\0")
        info = config["plugins"].get(cap, {})
        source_url = config["repository"] + "/blob/" + sha + "/"
        release_version = versions.get(cap)
        release_tag = (
            release_catalog["tag_format"].format(cap=cap, version=release_version)
            if release_version
            else None
        )
        contributors = info.get("contributors", config["defaults"]["contributors"])
        if any(c not in config["contributors"] for c in contributors):
            raise ValueError(f"Unknown contributor for {cap}")
        plugins.append(
            {
                **data,
                "id": cap,
                "release": {
                    "version": release_version,
                    "tag": release_tag,
                    "url": config["repository"] + "/tree/" + release_tag,
                }
                if release_tag
                else None,
                "title": info.get("title", cap.replace("-", " ").title()),
                "category": info.get("category", "Other"),
                "tags": info.get("tags", []),
                "contributors": contributors,
                "icon": info.get("icon", "box"),
                "color": info.get("color", "purple"),
                "order": info.get("order", 99),
                "channel": info.get("channel", "Development")
                if checkout != source
                else "Main",
                "source": {
                    "repository": config["repository"],
                    "commit": sha,
                    "date": git(checkout, "show", "-s", "--format=%cI", "HEAD"),
                    "url": source_url,
                    "path": f"src/capabilities/{cap}",
                },
                "skill": {
                    **data["skill"],
                    "sourceUrl": source_url + data["skill"]["path"],
                    "directoryUrl": source_url.replace("/blob/", "/tree/")
                    + skill_folder,
                    "files": [
                        {
                            "path": path.removeprefix(skill_folder),
                            "sourceUrl": source_url + quote(path, safe="/"),
                        }
                        for path in skill_files
                        if path
                    ],
                },
                "tools": [
                    {
                        **tool,
                        "sourceUrl": source_url
                        + tool["sourcePath"]
                        + "#L"
                        + str(tool["sourceLine"]),
                    }
                    for tool in data["tools"]
                ],
                "cookbookUrl": source_url + f"cookbooks/{cap}/usage.md",
            }
        )
    return {
        "repository": config["repository"],
        "contributors": config["contributors"],
        "categories": config["categories"],
        "plugins": sorted(plugins, key=lambda p: (p["order"], p["id"])),
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, required=True)
    parser.add_argument("--extra-source", action="append", default=[])
    parser.add_argument("--worker")
    parser.add_argument("--output", type=Path, default=ROOT / "data/catalog.json")
    args = parser.parse_args()
    if args.worker:
        print(json.dumps(worker(args.source.resolve(), args.worker)))
        return
    catalog = export(args.source.resolve(), args.extra_source)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + "\n")
    print(
        f"Exported {len(catalog['plugins'])} plugins / {sum(len(p['tools']) for p in catalog['plugins'])} tools"
    )


if __name__ == "__main__":
    main()
