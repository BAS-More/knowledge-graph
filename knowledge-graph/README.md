# Knowledge-Graph

**Graph-powered code intelligence for AI agents.** Index any codebase into a knowledge graph, then query it via MCP or CLI.

Works with **Cursor**, **Claude Code**, **Codex**, **Windsurf**, **Cline**, **OpenCode**, and any MCP-compatible tool.

[![npm version](https://img.shields.io/npm/v/knowledge-graph.svg)](https://www.npmjs.com/package/knowledge-graph)
[![License: PolyForm Noncommercial](https://img.shields.io/badge/License-PolyForm%20Noncommercial-blue.svg)](https://polyformproject.org/licenses/noncommercial/1.0.0/)

---

## Why?

AI coding tools don't understand your codebase structure. They edit a function without knowing 47 other functions depend on it. Knowledge-Graph fixes this by **precomputing every dependency, call chain, and relationship** into a queryable graph.

**Three commands to give your AI agent full codebase awareness.**

## Quick Start

```bash
# Index your repo (run from repo root)
npx knowledge-graph analyze
```

That's it. This indexes the codebase, installs agent skills, registers Claude Code hooks, and creates `AGENTS.md` / `CLAUDE.md` context files — all in one command.

To configure MCP for your editor, run `npx knowledge-graph setup` once — or set it up manually below.

`knowledge-graph setup` auto-detects your editors and writes the correct global MCP config. You only need to run it once.

### Editor Support

| Editor | MCP | Skills | Hooks (auto-augment) | Support |
|--------|-----|--------|---------------------|---------|
| **Claude Code** | Yes | Yes | Yes (PreToolUse) | **Full** |
| **Cursor** | Yes | Yes | — | MCP + Skills |
| **Codex** | Yes | Yes | — | MCP + Skills |
| **Windsurf** | Yes | — | — | MCP |
| **OpenCode** | Yes | Yes | — | MCP + Skills |

> **Claude Code** gets the deepest integration: MCP tools + agent skills + PreToolUse hooks that automatically enrich grep/glob/bash calls with knowledge graph context.

### Community Integrations

| Agent | Install | Source |
|-------|---------|--------|
| [pi](https://pi.dev) | `pi install npm:pi-knowledge-graph` | [pi-knowledge-graph](https://github.com/tintinweb/pi-knowledge-graph) |

## MCP Setup (manual)

If you prefer to configure manually instead of using `knowledge-graph setup`:

### Claude Code (full support — MCP + skills + hooks)

```bash
# macOS / Linux
claude mcp add knowledge-graph -- npx -y knowledge-graph@latest mcp

# Windows
claude mcp add knowledge-graph -- cmd /c npx -y knowledge-graph@latest mcp
```

### Codex (full support — MCP + skills)

```bash
codex mcp add knowledge-graph -- npx -y knowledge-graph@latest mcp
```

### Cursor / Windsurf

Add to `~/.cursor/mcp.json` (global — works for all projects):

```json
{
  "mcpServers": {
    "knowledge-graph": {
      "command": "npx",
      "args": ["-y", "knowledge-graph@latest", "mcp"]
    }
  }
}
```

### OpenCode

Add to `~/.config/opencode/config.json`:

```json
{
  "mcp": {
    "knowledge-graph": {
      "command": "npx",
      "args": ["-y", "knowledge-graph@latest", "mcp"]
    }
  }
}
```

## How It Works

Knowledge-Graph builds a complete knowledge graph of your codebase through a multi-phase indexing pipeline:

1. **Structure** — Walks the file tree and maps folder/file relationships
2. **Parsing** — Extracts functions, classes, methods, and interfaces using Tree-sitter ASTs
3. **Resolution** — Resolves imports and function calls across files with language-aware logic
   - **Field & Property Type Resolution** — Tracks field types across classes and interfaces for deep chain resolution (e.g., `user.address.city.getName()`)
   - **Return-Type-Aware Variable Binding** — Infers variable types from function return types, enabling accurate call-result binding
4. **Clustering** — Groups related symbols into functional communities
5. **Processes** — Traces execution flows from entry points through call chains
6. **Search** — Builds hybrid search indexes for fast retrieval

The result is a **LadybugDB graph database** stored locally in `.knowledge-graph/` with full-text search and semantic embeddings.

## MCP Tools

Your AI agent gets these tools automatically:

| Tool | What It Does | `repo` Param |
|------|-------------|--------------|
| `list_repos` | Discover all indexed repositories | — |
| `query` | Process-grouped hybrid search (BM25 + semantic + RRF) | Optional |
| `context` | 360-degree symbol view — categorized refs, process participation | Optional |
| `impact` | Blast radius analysis with depth grouping and confidence | Optional |
| `detect_changes` | Git-diff impact — maps changed lines to affected processes | Optional |
| `rename` | Multi-file coordinated rename with graph + text search | Optional |
| `cypher` | Raw Cypher graph queries | Optional |

> With one indexed repo, the `repo` param is optional. With multiple, specify which: `query({query: "auth", repo: "my-app"})`.

## MCP Resources

| Resource | Purpose |
|----------|---------|
| `knowledge-graph://repos` | List all indexed repositories (read first) |
| `knowledge-graph://repo/{name}/context` | Codebase stats, staleness check, and available tools |
| `knowledge-graph://repo/{name}/clusters` | All functional clusters with cohesion scores |
| `knowledge-graph://repo/{name}/cluster/{name}` | Cluster members and details |
| `knowledge-graph://repo/{name}/processes` | All execution flows |
| `knowledge-graph://repo/{name}/process/{name}` | Full process trace with steps |
| `knowledge-graph://repo/{name}/schema` | Graph schema for Cypher queries |

## MCP Prompts

| Prompt | What It Does |
|--------|-------------|
| `detect_impact` | Pre-commit change analysis — scope, affected processes, risk level |
| `generate_map` | Architecture documentation from the knowledge graph with mermaid diagrams |

## CLI Commands

```bash
knowledge-graph setup                   # Configure MCP for your editors (one-time)
knowledge-graph analyze [path]          # Index a repository (or update stale index)
knowledge-graph analyze --force         # Force full re-index
knowledge-graph analyze --embeddings    # Enable embedding generation (slower, better search)
knowledge-graph analyze --skip-agents-md  # Preserve custom AGENTS.md/CLAUDE.md knowledge-graph section edits
knowledge-graph analyze --verbose       # Log skipped files when parsers are unavailable
knowledge-graph mcp                     # Start MCP server (stdio) — serves all indexed repos
knowledge-graph serve                   # Start local HTTP server (multi-repo) for web UI
knowledge-graph index                   # Register an existing .knowledge-graph/ folder into the global registry
knowledge-graph list                    # List all indexed repositories
knowledge-graph status                  # Show index status for current repo
knowledge-graph clean                   # Delete index for current repo
knowledge-graph clean --all --force     # Delete all indexes
knowledge-graph wiki [path]             # Generate LLM-powered docs from knowledge graph
knowledge-graph wiki --model <model>    # Wiki with custom LLM model (default: gpt-4o-mini)

# Repository groups (multi-repo / monorepo service tracking)
knowledge-graph group create <name>     # Create a repository group
knowledge-graph group add <name> <repo> # Add a repo to a group
knowledge-graph group remove <name> <repo> # Remove a repo from a group
knowledge-graph group list [name]       # List groups, or show one group's config
knowledge-graph group sync <name>       # Extract contracts and match across repos/services
knowledge-graph group contracts <name>  # Inspect extracted contracts and cross-links
knowledge-graph group query <name> <q>  # Search execution flows across all repos in a group
knowledge-graph group status <name>     # Check staleness of repos in a group
```

## Remote Embeddings

Set these env vars to use a remote OpenAI-compatible `/v1/embeddings` endpoint instead of the local model:

```bash
export KNOWLEDGE_GRAPH_EMBEDDING_URL=http://your-server:8080/v1
export KNOWLEDGE_GRAPH_EMBEDDING_MODEL=BAAI/bge-large-en-v1.5
export KNOWLEDGE_GRAPH_EMBEDDING_DIMS=1024          # optional, default 384
export KNOWLEDGE_GRAPH_EMBEDDING_API_KEY=your-key   # optional, default: "unused"
knowledge-graph analyze . --embeddings
```

Works with Infinity, vLLM, TEI, llama.cpp, Ollama, LM Studio, or OpenAI. When unset, local embeddings are used unchanged.

## Multi-Repo Support

Knowledge-Graph supports indexing multiple repositories. Each `knowledge-graph analyze` registers the repo in a global registry (`~/.knowledge-graph/registry.json`). The MCP server serves all indexed repos automatically.

## Supported Languages

TypeScript, JavaScript, Python, Java, C, C++, C#, Go, Rust, PHP, Kotlin, Swift, Ruby

### Language Feature Matrix

| Language | Imports | Named Bindings | Exports | Heritage | Type Annotations | Constructor Inference | Config | Frameworks | Entry Points |
|----------|---------|----------------|---------|----------|-----------------|---------------------|--------|------------|-------------|
| TypeScript | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| JavaScript | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ |
| Python | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Java | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ |
| Kotlin | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ |
| C# | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Go | ✓ | — | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Rust | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ |
| PHP | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | ✓ |
| Ruby | ✓ | — | ✓ | ✓ | — | ✓ | — | ✓ | ✓ |
| Swift | — | — | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| C | — | — | ✓ | — | ✓ | ✓ | — | ✓ | ✓ |
| C++ | — | — | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ |

**Imports** — cross-file import resolution · **Named Bindings** — `import { X as Y }` / re-export tracking · **Exports** — public/exported symbol detection · **Heritage** — class inheritance, interfaces, mixins · **Type Annotations** — explicit type extraction for receiver resolution · **Constructor Inference** — infer receiver type from constructor calls (`self`/`this` resolution included for all languages) · **Config** — language toolchain config parsing (tsconfig, go.mod, etc.) · **Frameworks** — AST-based framework pattern detection · **Entry Points** — entry point scoring heuristics

## Agent Skills

Knowledge-Graph ships with skill files that teach AI agents how to use the tools effectively:

- **Exploring** — Navigate unfamiliar code using the knowledge graph
- **Debugging** — Trace bugs through call chains
- **Impact Analysis** — Analyze blast radius before changes
- **Refactoring** — Plan safe refactors using dependency mapping

Installed automatically by both `knowledge-graph analyze` (per-repo) and `knowledge-graph setup` (global).

## Requirements

- Node.js >= 18
- Git repository (uses git for commit tracking)

## Privacy

- All processing happens locally on your machine
- No code is sent to any server
- Index stored in `.knowledge-graph/` inside your repo (gitignored)
- Global registry at `~/.knowledge-graph/` stores only paths and metadata

## Web UI

Knowledge-Graph also has a browser-based UI at [knowledge-graph.vercel.app](https://knowledge-graph.vercel.app) — 100% client-side, your code never leaves the browser.

**Local Backend Mode:** Run `knowledge-graph serve` and open the web UI locally — it auto-detects the server and shows all your indexed repos, with full AI chat support. No need to re-upload or re-index. The agent's tools (Cypher queries, search, code navigation) route through the backend HTTP API automatically.

## License

[PolyForm Noncommercial 1.0.0](https://polyformproject.org/licenses/noncommercial/1.0.0/)

Free for non-commercial use. Contact for commercial licensing.
