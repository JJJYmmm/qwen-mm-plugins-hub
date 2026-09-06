# Qwen MM Plugins Hub

A searchable directory of Qwen multimodal plugins, with contributor and capability filters, Skill previews, and actual MCP tool definitions.

[Website](https://jjjymmm.github.io/qwen-mm-plugins-hub/) · [Plugin source](https://github.com/QwenLM/Qwen-MM-Plugins)

The website is maintained independently of the plugin distribution. Every published build reads plugin metadata, Skills and tools from **the remote upstream `main` branch only**. Those records share one source commit; every Skill and tool links to that commit. This is a main-branch documentation snapshot, not a promise that the code matches an immutable release tag. Cookbooks and cases are maintained separately in this Hub.

## Content maintenance

| Content                                               | Source of truth                                                       |
| ----------------------------------------------------- | --------------------------------------------------------------------- |
| Included plugins                                      | Upstream `plugin-versions.json`                                       |
| Version, package description, Skill/MCP presence      | Capability `.codex-plugin/plugin.json`                                |
| Skill preview and raw text                            | Capability `skill/SKILL.md`                                           |
| Tool name and description                             | The actual MCP registry (`SPECS`, from `TOOL`)                        |
| Parameters, defaults, required fields, nested schemas | Pydantic argument models, through the framework's `tool_schema`       |
| Default release target                                | Upstream `plugin-versions.json` version and tag format                |
| Skill file hierarchy                                  | Git-tracked files under capability `skill/` at the source commit      |
| Requirements                                          | Server `SYSTEM_DEPS` tool names/hints and Skill prerequisite sections |
| Contributors, categories, tags, display titles        | `catalog.config.json` in this repository                              |
| Token estimates                                       | Exported Skill/tool text and the pinned `tokenizer.config.json`       |

Do not duplicate tool definitions in the website. The plugin repository's [`support_hub` branch](https://github.com/QwenLM/Qwen-MM-Plugins/tree/support_hub) adds handler-docstring descriptions to the actual MCP registry: omit `TOOL.description` to use the handler's docstring, with Google-style `Args:` entries filling missing Pydantic field descriptions. Explicit `TOOL.description` and `Field(description=...)` remain compatible. See the [authoring convention](https://github.com/QwenLM/Qwen-MM-Plugins/blob/support_hub/docs/en/hub.md), including plain mode for long examples. The existing Hub exporter consumes this automatically after those changes reach upstream main; it does not parse or handwrite a separate definition. Module docstrings remain supplementary metadata.

To add a contributor, add a record to `contributors`, then put that ID in the plugin's `contributors` list in `catalog.config.json`. The default is Qwen Team. Tags and categories are curated discovery metadata; they are independent of API documentation. New plugins on upstream main are discovered automatically with fallback display metadata. Add their `content/cookbooks/<cap>/usage.md` before publishing; the cookbook check intentionally rejects missing source files.

The exporter imports registry modules but never calls handlers, starts an MCP server, or invokes startup hooks. It disables the local Qwen config file and exports an explicit allowlist of public fields. Import failures stop the build instead of silently omitting tools. Only use trusted source checkouts.

Skill previews initially show 50 source lines (Markdown body in Preview; front matter included in Raw), with the full document available on expansion. Copy Skill always copies the complete source. The file browser includes tracked files only, preserves nested directories, and links each file to the immutable documentation snapshot. Directory cards link directly to `#skill` and `#tools`; individual definitions have `#tool-<name>` permalinks, and `#files` opens the Skill directory.

Cookbooks are now maintained in this Hub repository, independently of the plugin snapshot. Each plugin's Cookbook action opens `/plugins/<cap>/cookbook/`, with sanitized Markdown, inline videos and sandboxed interactive case previews. `content/cookbooks/<cap>/usage.md` is the only editable cookbook source; the plugin repository's `support_hub` branch keeps migration links instead of duplicate prose or case assets. The Skill/tool exporter still reads upstream main.

## Cookbook and case maintenance

Each case owns its files:

```text
content/cookbooks/edu-agent/usage.md
public/cases/edu-agent/case-edu-agent-math/
  assert/
    case-edu-agent-math.mp4
    case-edu-agent-math.jpg
public/cases/core/case-core-cc-basic-use/
  index.html
  assert/
    image-<hash>.webp
```

Use `../../../public/cases/<cap>/<case>/assert/<file>` relative links in cookbook Markdown. They resolve on GitHub and are rewritten to the deployed Hub's `/cases/` URLs, including its GitHub Pages base path. Link a case's `index.html` to embed an isolated preview. Videos have controls and load on demand; case frames use `sandbox="allow-scripts"` without same-origin privileges. Source Markdown links target this repository. Do not embed credentials or private traces in these public files.

After adding or replacing reviewed media, run:

```bash
.venv/bin/python scripts/export_cookbooks.py --update-assets
npm test
npm run build
```

`case-assets.json` records each deployed file's checksum and size. Ordinary CI runs verify the manifest and stop if media changes unexpectedly. Files must stay below 25 MiB to fit both configured hosts. `cookbook-media.json` preserves original remote URLs/checksums as migration provenance; runtime previews do not fetch those URLs. Existing HTML trace images were extracted losslessly into each case's `assert/` directory. The one-time migration helper retains its staging copy under ignored `.sources/`; it is not a maintenance or CI command.

The Hub is a static site: upload means commit reviewed files to this repository and let CI publish, not a browser-based upload service. No storage account or runtime API keys are needed.

Recordings use H.264/YUV420P MP4 for both browser playback and download. The three imported HEVC recordings were converted in place with MP4 faststart; no alternate video copies are deployed. Original checksums remain in `cookbook-media.json` for provenance. For new recordings, use H.264 video and AAC audio when present; enable `-movflags +faststart` when exporting MP4.

The release target comes from the upstream version catalog at build time. It is not a live latest-release lookup or an end-to-end installation certification. The install page explicitly distinguishes this target from the main snapshot and the shared Python distribution version. Newer installers can select newer releases.

## Token estimates

Cards and plugin detail pages show separate Skill and tool-definition estimates; each tool also displays its own count. The default reference is the official [Qwen/Qwen3.5-9B tokenizer](https://huggingface.co/Qwen/Qwen3.5-9B/blob/c202236235762e1c871ad0ccb60c8ee5ba337b9a/tokenizer.json). `tokenizer.config.json` pins the model revision, tokenizer SHA-256 and `tokenizers` engine version. This is an explicit reference model, not a claim that every Qwen-family tokenizer is interchangeable.

- **Full Skill:** the complete original `SKILL.md`, including YAML front matter and final whitespace, not the 50-line preview. Bundled reference files and cookbooks are excluded.
- **Tools:** each tool's `{name, description, inputSchema}` serialized as UTF-8 JSON with two-space indentation and unescaped Unicode. The exported `definitionText` is both the counted text and the content of **Copy definition**. The plugin total is the sum of individual definitions, without an outer array or client-specific wrappers.
- **Discovery metadata:** a separate count of the Skill's name and description, serialized with the same JSON settings. This is shown in the expandable methodology note and is not added to the full Skill count. Clients may format or load this metadata differently.

The exporter uses the actual tokenizer with no padding, truncation, or added special tokens. It downloads only `tokenizer.json` into the ignored `.sources/tokenizers/` cache and verifies its checksum before use. No model weights, remote model code, inference calls, or credentials are required, and the tokenizer is not shipped to visitors. Checksum failures stop publication instead of falling back to character-based guesses.

These are content-size estimates, **not always-loaded context or billed usage**: clients may select tools, load Skills on demand, and add chat templates, system instructions or function wrappers. Tool results, conversation history and image/audio/video inputs are not included. Updating the reference requires an intentional config/engine change, regenerated catalog and updated golden-token tests.

## Development

Node 24 and Python 3.12+ are recommended.

```bash
npm ci
npm run dev
```

The committed `data/catalog.json` is a source snapshot, so frontend development does not require Python or API credentials.

To regenerate from upstream main:

```bash
git clone --depth 1 --branch main https://github.com/QwenLM/Qwen-MM-Plugins.git .sources/upstream
python3 -m venv .venv
.venv/bin/pip install -e '.sources/upstream[omni-memory]' -r scripts/requirements-export.txt
.venv/bin/python scripts/export_catalog.py --source .sources/upstream
.venv/bin/python scripts/export_cookbooks.py
```

For an existing source clone, fetch and fast-forward its main branch before exporting. The exporter runs each capability in an isolated subprocess so registry imports cannot interfere with each other.

```bash
npm test
npm run build
```

The build checks TypeScript, prerenders all routes, and verifies all page script/style/font references. Static files are in `dist/client/`; no Python, API keys, or application server are needed to serve the site.

After exporting once, the tokenizer tests run entirely offline. They check fixed English, Chinese, code and emoji token IDs, prevent truncation, validate checksums, and recompute every exported estimate:

```bash
.venv/bin/python -m unittest discover -s tests -p 'test_token_estimates.py'
```

CI runs these checks after regenerating the catalog, before publishing.

## Publishing and updates

The GitHub Actions workflow exports the latest upstream main on every push to this website's main branch. Use **Actions → Build and deploy plugin directory → Run workflow** to refresh the content without a source edit. Successful builds deploy to GitHub Pages. Failed builds leave the last successful deployment intact.

Pages must use **GitHub Actions** as its build source. The workflow sets `SITE_BASE_PATH=/qwen-mm-plugins-hub`; change it if you rename the repository or use a custom domain. For root-domain hosts, build without `SITE_BASE_PATH`.

Navigation uses ordinary links so detail URLs work on static hosts without an RSC server. The small postbuild step supplies directory indexes because Vinext's current trailing-slash prerender path redirects internal RSC requests. Both root and project-subpath outputs are checked before deployment.

The layout follows the Transformers documentation site: a persistent categorized plugin navigation, central prose, and a contextual page outline on wide screens. The directory retains its contributor/tag filters. `app/docs-theme.css` contains the documentation layout and typography overrides. Source Sans 3 (the successor to Source Sans Pro) and IBM Plex Mono are self-hosted by the build; the source-level theme reference is Hugging Face’s open-source doc-builder. See [third-party notices](THIRD_PARTY_NOTICES.md). It is a Qwen plugin directory, not a Hugging Face service.
