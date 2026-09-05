# Qwen MM Plugins Hub

A searchable directory of Qwen multimodal plugins, with contributor and capability filters, Skill previews, and actual MCP tool definitions.

[Website](https://jjjymmm.github.io/qwen-mm-plugins-hub/) · [Plugin source](https://github.com/QwenLM/Qwen-MM-Plugins)

The website is maintained independently of the plugin distribution. Every published build reads **the remote upstream `main` branch only**. All plugin content in a build shares one source commit; every Skill and tool links to that commit. This is a main-branch documentation snapshot, not a promise that the code matches an immutable release tag.

## Content maintenance

| Content                                               | Source of truth                                                 |
| ----------------------------------------------------- | --------------------------------------------------------------- |
| Included plugins                                      | Upstream `plugin-versions.json`                                 |
| Version, package description, Skill/MCP presence      | Capability `.codex-plugin/plugin.json`                          |
| Skill preview and raw text                            | Capability `skill/SKILL.md`                                     |
| Tool name and description                             | The actual MCP registry (`SPECS`, from `TOOL`)                  |
| Parameters, defaults, required fields, nested schemas | Pydantic argument models, through the framework's `tool_schema` |
| Requirements                                          | Server `SYSTEM_DEPS` labels                                     |
| Contributors, categories, tags, display titles        | `catalog.config.json` in this repository                        |

Do not duplicate tool descriptions into website-specific docstrings. Maintain `TOOL.description` and `Field(description=...)` where the agent-facing definitions already live. Module docstrings are also exported as supplementary metadata. A later upstream change to derive `TOOL.description` from docstrings would automatically flow through the existing registry exporter.

To add a contributor, add a record to `contributors`, then put that ID in the plugin's `contributors` list in `catalog.config.json`. The default is Qwen Team. Tags and categories are curated discovery metadata; they are independent of API documentation. New plugins on upstream main appear automatically with fallback display metadata, even before a curated entry is added.

The exporter imports registry modules but never calls handlers, starts an MCP server, or invokes startup hooks. It disables the local Qwen config file and exports an explicit allowlist of public fields. Import failures stop the build instead of silently omitting tools. Only use trusted source checkouts.

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
.venv/bin/pip install -e '.sources/upstream[omni-memory]' PyYAML
.venv/bin/python scripts/export_catalog.py --source .sources/upstream
```

For an existing source clone, fetch and fast-forward its main branch before exporting. The exporter runs each capability in an isolated subprocess so registry imports cannot interfere with each other.

```bash
npm test
npm run build
```

The build checks TypeScript, prerenders all routes, and verifies all page script/style/font references. Static files are in `dist/client/`; no Python, API keys, or application server are needed to serve the site.

## Publishing and updates

The GitHub Actions workflow exports the latest upstream main on every push to this website's main branch. Use **Actions → Build and deploy plugin directory → Run workflow** to refresh the content without a source edit. Successful builds deploy to GitHub Pages. Failed builds leave the last successful deployment intact.

Pages must use **GitHub Actions** as its build source. The workflow sets `SITE_BASE_PATH=/qwen-mm-plugins-hub`; change it if you rename the repository or use a custom domain. For root-domain hosts, build without `SITE_BASE_PATH`.

Navigation uses ordinary links so detail URLs work on static hosts without an RSC server. The small postbuild step supplies directory indexes because Vinext's current trailing-slash prerender path redirects internal RSC requests. Both root and project-subpath outputs are checked before deployment.

The layout is inspired by Hugging Face Hub. Typography and neutral documentation styling are adapted from its open-source doc-builder; see [third-party notices](THIRD_PARTY_NOTICES.md). It is a Qwen plugin directory, not a Hugging Face service.
