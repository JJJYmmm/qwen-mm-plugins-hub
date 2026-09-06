# Qwen MM Plugins Hub

[Website](https://jjjymmm.github.io/qwen-mm-plugins-hub/) · [Plugin repository](https://github.com/QwenLM/Qwen-MM-Plugins)

A searchable plugin directory with contributor/tag filters, Skill previews, actual MCP definitions, Qwen3.5 token estimates, English documentation, and hosted cookbooks.

## Add a plugin in two places

1. **Qwen-MM-Plugins:** add the capability using its normal packaging convention, including its entry in `plugin-versions.json`, Skill, manifests, and MCP tools where applicable. Document every tool in its handler's Google-style docstring. The framework derives both the real MCP schema and Hub descriptions from it; no website-specific tool definition is needed.
2. **This Hub:** add `content/cookbooks/<cap>/usage.md` and any case files under `public/cases/<cap>/<case>/`. Commit and push to Hub main. GitHub Actions discovers plugins from upstream main, generates content and token estimates, validates the site, and deploys GitHub Pages.

There is no plugin registration table or media checksum inventory to update. Generated files in `data/` are build output; do not edit them manually. A missing cookbook stops the build and names the file to add.

### Cookbook

Optional YAML front matter controls discovery metadata. Contributors are GitHub accounts and default to QwenLM.

```markdown
---
title: My Plugin
category: Understanding
tags: [image, video]
contributors: [QwenLM]
order: 10
---

# My Plugin

Installation, workflows, and examples.

[Demo](../../../public/cases/my-plugin/demo/assert/demo.mp4)

[Interactive case](../../../public/cases/my-plugin/demo/index.html)
```

Categories and tags are collected from cookbooks automatically. For a different contributor, add this optional field in the same front matter—no separate registration:

```yaml
contributors: [MyTeam, another-contributor]
```

Profile links and avatars are derived from those accounts; the first account supplies the plugin avatar. No API lookup or separate logo field is required. Accounts are case-insensitive; tags are normalized and deduplicated. Prefer one or two task/modality tags, not synonyms or details already in the category. All tags remain searchable; the filter initially shows the six most-used plus any selected tags.

Title defaults to the capitalized capability ID, category to Other, and order to 99.

### Cases and media

```text
public/cases/<cap>/<case>/
  index.html       # optional interactive case
  assert/
    demo.mp4
    screenshot.png
    ...
```

Relative cookbook links work in GitHub and are rewritten to same-site URLs, including the GitHub Pages base path. Put each video or HTML case link in its own paragraph, with a descriptive label. The Hub replaces that link with a player or iframe, without a duplicate caption or download prompt; inline prose links remain links. Case iframes use `sandbox="allow-scripts"` with no same-origin privileges. HTML case assets should use relative `assert/...` links. Keep useful output illustrations, but do not repeat a screenshot of an adjacent player or interactive case.

Use H.264/YUV420P MP4, AAC audio when present, and faststart for video playback/download. Keep individual files below 25 MiB for the configured hosts. Uploading means committing reviewed public files, not using a browser upload service. Do not include credentials or private traces.

## One content build

```text
upstream plugin-versions.json + manifests + Skills + MCP registry + docs/en
                             +
Hub cookbook Markdown/front matter + public/cases files
                             ↓
python -m scripts.build_content --source <plugin-checkout>
                             ↓
data/catalog.json + data/cookbooks.json + data/docs.json
                             ↓
npm run build → dist/client → GitHub Pages
```

Production always reads **remote upstream main**, not a mix of branches. Every Skill/tool source link pins the same commit. Cookbook source links point to this Hub. The plugin repository's `support_hub` branch contains the unified docstring convention; it must reach upstream main before production reflects those source changes.

The exporter imports registries but never invokes handlers, startup hooks, or MCP servers. It ignores local Qwen configuration and exports an explicit set of public fields. Capability imports must keep optional heavy dependencies lazy, as required by the plugin repository.

### English documentation

The [Docs section](https://jjjymmm.github.io/qwen-mm-plugins-hub/docs/) opens directly on Installation. English Markdown is discovered from committed `docs/en/**/*.md` in the same upstream snapshot as the plugin catalog and refreshed on each Hub build. New pages appear automatically; filenames supply URL slugs and the first H1 supplies the title.

Maintain these documents **in the plugin repository**, not in generated `data/docs.json`. In particular, its configuration reference remains owned by `scripts/gen_env_docs.py` and the upstream consistency tests. Cookbooks and case files remain Hub-owned.

Rendered English document links stay inside the Hub, including links from cookbooks. Source-file and untranslated-page links use the upstream commit. Command examples and source Markdown are unchanged; the upstream language selector is hidden in the English-only website. Both GitHub Pages and root-domain URLs are checked during the static build.

## Development and checks

Use Node 24 and Python 3.12+.

```bash
npm ci
python3 -m venv .venv
.venv/bin/pip install -e '../Qwen-MM-Plugins[omni-memory]' -r scripts/requirements-export.txt
.venv/bin/python -m scripts.build_content --source ../Qwen-MM-Plugins
.venv/bin/python -m unittest discover -s tests -p 'test_*.py'
npm test
npm run dev
npm run build
```

The committed generated data supports frontend-only development without Python. To rebuild production content locally, use a clean, updated checkout of upstream main as `--source`. To test unpublished plugin changes, point it at that checkout; do not publish its generated data as a main snapshot.

Tests cover automatic plugin and documentation discovery, optional cookbook metadata, media paths, Skill hierarchy, tool definitions and token estimates. The static build checks all generated routes, documentation and cookbook anchors, media previews, and exported asset links. The postbuild directory indexes let detail URLs work without an application server.

GitHub Actions runs on Hub main pushes and manual workflow dispatch. To refresh after an upstream change without editing Hub, run **Build and deploy plugin directory** from Actions. Failed builds leave the current published site intact. Pages must use GitHub Actions as its source. `SITE_BASE_PATH=/qwen-mm-plugins-hub` is set in CI; omit it for root-domain hosting.

## Content and token conventions

Skill previews show the first 50 source lines, with full expansion and copy. The file tree includes tracked Skill files and immutable source links.

Main documentation snapshots and immutable plugin release tags are distinct. The installation view shows both; source changes require the normal plugin release process to reach tag-pinned installs.

Token estimates use the official Qwen3.5-9B tokenizer, with its revision, SHA-256 and engine version pinned in `tokenizer.config.json`. They count the full original SKILL.md and each displayed `{name, description, inputSchema}` JSON definition separately. Tool totals sum those definitions; Skill metadata is shown separately. Cookbooks, bundled reference files, tool results, chat wrappers, conversation and media tokens are excluded. These are content estimates, not always-loaded context or billing totals. The tokenizer is a verified build-time cache, not shipped to visitors.

The layout follows Hugging Face Transformers documentation conventions using the existing React components. See [third-party notices](THIRD_PARTY_NOTICES.md) for sources, licenses and migration provenance.
