<!-- version: 1.3.0 -->
<!--
  Metadata: version, last reviewed, scope, model policy, reference docs, changelog.
  Last updated: 2026-03-22
-->

Last reviewed: 2026-04-13

**Project:** Knowledge-Graph · **Environment:** dev · **Maintainer:** repository maintainers (see GitHub)

Follow **AGENTS.md** for the canonical rules; this file adds Claude Code–specific deltas. Cursor-specific notes live only in `AGENTS.md`.

## Scope

See the **Scope** table in [AGENTS.md](AGENTS.md) for read/write/execute/off-limits boundaries. Cursor-specific workflow notes also live only in AGENTS.md.

## Model Configuration

- **Primary:** Pin per **Claude Code** / Anthropic org policy (explicit model id). Do not rely on an unversioned `latest` alias for governed workflows.
- **Fallback:** As configured in Claude Code (organization default or user override).
- **Notes:** The Knowledge-Graph CLI analyzer does not call an LLM.

## Execution Sequence (complex tasks)

Same discipline as [AGENTS.md](AGENTS.md): before large multi-step work, state which **AGENTS.md** / **GUARDRAILS.md** rules apply, current **Scope**, and planned validation commands (`npm test`, `tsc`, etc.). When pausing, summarize progress in the chat or a **local** scratch file (do not add `HANDOFF.md` to the repo), then `/clear` and resume with that summary.

## Claude Code hooks

Prefer **PreToolUse** hooks for hard gates (e.g. tests before `git_commit`). Adapt hook commands to `knowledge-graph/` npm scripts.

## Context budget

If always-on instructions grow, load deep conventions via conditional reads (e.g. *“When writing new code, read STANDARDS.md”*) instead of pasting long blocks here. In Cursor, prefer `.cursor/index.mdc` plus optional `.cursor/rules/*.mdc` globs (see [AGENTS.md](AGENTS.md) § Context budget).

## Reference Documentation

- **This repository:** [AGENTS.md](AGENTS.md) (Cursor + monorepo notes), [ARCHITECTURE.md](ARCHITECTURE.md), [CONTRIBUTING.md](CONTRIBUTING.md), [GUARDRAILS.md](GUARDRAILS.md).
- **Knowledge-Graph:** `.claude/skills/knowledge-graph/`; MCP and indexed-repo rules live only in [AGENTS.md](AGENTS.md) (`knowledge-graph:start` … `knowledge-graph:end`). See **Knowledge-Graph rules** below.

## Changelog

| Date | Version | Change |
|------|---------|--------|
| 2026-04-13 | 1.3.0 | Updated Knowledge-Graph index stats after DAG refactor. |
| 2026-03-24 | 1.2.0 | Removed duplicated knowledge-graph:start block and scope table; replaced with pointers to AGENTS.md. |
| 2026-03-23 | 1.1.0 | Updated agent instructions to match AGENTS.md. |
| 2026-03-22 | 1.0.0 | Added structured header and changelog. |

---

## Knowledge-Graph rules

Knowledge-Graph MCP rules are in the `<!-- knowledge-graph:start -->
# Knowledge-Graph — Code Intelligence

This project is indexed by Knowledge-Graph as **Knowledge-Graph** (4325 symbols, 10556 relationships, 300 execution flows). Use the Knowledge-Graph MCP tools to understand code, assess impact, and navigate safely.

> If any Knowledge-Graph tool warns the index is stale, run `npx knowledge-graph analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `knowledge-graph_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `knowledge-graph_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `knowledge-graph_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `knowledge-graph_context({name: "symbolName"})`.

## When Debugging

1. `knowledge-graph_query({query: "<error or symptom>"})` — find execution flows related to the issue
2. `knowledge-graph_context({name: "<suspect function>"})` — see all callers, callees, and process participation
3. `READ knowledge-graph://repo/Knowledge-Graph/process/{processName}` — trace the full execution flow step by step
4. For regressions: `knowledge-graph_detect_changes({scope: "compare", base_ref: "main"})` — see what your branch changed

## When Refactoring

- **Renaming**: MUST use `knowledge-graph_rename({symbol_name: "old", new_name: "new", dry_run: true})` first. Review the preview — graph edits are safe, text_search edits need manual review. Then run with `dry_run: false`.
- **Extracting/Splitting**: MUST run `knowledge-graph_context({name: "target"})` to see all incoming/outgoing refs, then `knowledge-graph_impact({target: "target", direction: "upstream"})` to find all external callers before moving code.
- After any refactor: run `knowledge-graph_detect_changes({scope: "all"})` to verify only expected files changed.

## Never Do

- NEVER edit a function, class, or method without first running `knowledge-graph_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `knowledge-graph_rename` which understands the call graph.
- NEVER commit changes without running `knowledge-graph_detect_changes()` to check affected scope.

## Tools Quick Reference

| Tool | When to use | Command |
|------|-------------|---------|
| `query` | Find code by concept | `knowledge-graph_query({query: "auth validation"})` |
| `context` | 360-degree view of one symbol | `knowledge-graph_context({name: "validateUser"})` |
| `impact` | Blast radius before editing | `knowledge-graph_impact({target: "X", direction: "upstream"})` |
| `detect_changes` | Pre-commit scope check | `knowledge-graph_detect_changes({scope: "staged"})` |
| `rename` | Safe multi-file rename | `knowledge-graph_rename({symbol_name: "old", new_name: "new", dry_run: true})` |
| `cypher` | Custom graph queries | `knowledge-graph_cypher({query: "MATCH ..."})` |

## Impact Risk Levels

| Depth | Meaning | Action |
|-------|---------|--------|
| d=1 | WILL BREAK — direct callers/importers | MUST update these |
| d=2 | LIKELY AFFECTED — indirect deps | Should test |
| d=3 | MAY NEED TESTING — transitive | Test if critical path |

## Resources

| Resource | Use for |
|----------|---------|
| `knowledge-graph://repo/Knowledge-Graph/context` | Codebase overview, check index freshness |
| `knowledge-graph://repo/Knowledge-Graph/clusters` | All functional areas |
| `knowledge-graph://repo/Knowledge-Graph/processes` | All execution flows |
| `knowledge-graph://repo/Knowledge-Graph/process/{name}` | Step-by-step execution trace |

## Self-Check Before Finishing

Before completing any code modification task, verify:
1. `knowledge-graph_impact` was run for all modified symbols
2. No HIGH/CRITICAL risk warnings were ignored
3. `knowledge-graph_detect_changes()` confirms changes match expected scope
4. All d=1 (WILL BREAK) dependents were updated

## Keeping the Index Fresh

After committing code changes, the Knowledge-Graph index becomes stale. Re-run analyze to update it:

```bash
npx knowledge-graph analyze
```

If the index previously included embeddings, preserve them by adding `--embeddings`:

```bash
npx knowledge-graph analyze --embeddings
```

To check whether embeddings exist, inspect `.knowledge-graph/meta.json` — the `stats.embeddings` field shows the count (0 means no embeddings). **Running analyze without `--embeddings` will delete any previously generated embeddings.**

> Claude Code users: A PostToolUse hook handles this automatically after `git commit` and `git merge`.

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/knowledge-graph/knowledge-graph-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/knowledge-graph/knowledge-graph-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/knowledge-graph/knowledge-graph-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/knowledge-graph/knowledge-graph-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/knowledge-graph/knowledge-graph-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/knowledge-graph/knowledge-graph-cli/SKILL.md` |

<!-- knowledge-graph:end -->`  block in **[AGENTS.md](AGENTS.md)** — load that section when working with MCP tools or the graph index.

<!-- knowledge-graph:start -->
# Knowledge-Graph — Code Intelligence

This project is indexed by Knowledge-Graph as **Knowledge-Graph** (3298 symbols, 7954 relationships, 185 execution flows). Use the Knowledge-Graph MCP tools to understand code, assess impact, and navigate safely.

> If any Knowledge-Graph tool warns the index is stale, run `npx knowledge-graph analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `knowledge-graph_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `knowledge-graph_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `knowledge-graph_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `knowledge-graph_context({name: "symbolName"})`.

## When Debugging

1. `knowledge-graph_query({query: "<error or symptom>"})` — find execution flows related to the issue
2. `knowledge-graph_context({name: "<suspect function>"})` — see all callers, callees, and process participation
3. `READ knowledge-graph://repo/Knowledge-Graph/process/{processName}` — trace the full execution flow step by step
4. For regressions: `knowledge-graph_detect_changes({scope: "compare", base_ref: "main"})` — see what your branch changed

## When Refactoring

- **Renaming**: MUST use `knowledge-graph_rename({symbol_name: "old", new_name: "new", dry_run: true})` first. Review the preview — graph edits are safe, text_search edits need manual review. Then run with `dry_run: false`.
- **Extracting/Splitting**: MUST run `knowledge-graph_context({name: "target"})` to see all incoming/outgoing refs, then `knowledge-graph_impact({target: "target", direction: "upstream"})` to find all external callers before moving code.
- After any refactor: run `knowledge-graph_detect_changes({scope: "all"})` to verify only expected files changed.

## Never Do

- NEVER edit a function, class, or method without first running `knowledge-graph_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `knowledge-graph_rename` which understands the call graph.
- NEVER commit changes without running `knowledge-graph_detect_changes()` to check affected scope.

## Tools Quick Reference

| Tool | When to use | Command |
|------|-------------|---------|
| `query` | Find code by concept | `knowledge-graph_query({query: "auth validation"})` |
| `context` | 360-degree view of one symbol | `knowledge-graph_context({name: "validateUser"})` |
| `impact` | Blast radius before editing | `knowledge-graph_impact({target: "X", direction: "upstream"})` |
| `detect_changes` | Pre-commit scope check | `knowledge-graph_detect_changes({scope: "staged"})` |
| `rename` | Safe multi-file rename | `knowledge-graph_rename({symbol_name: "old", new_name: "new", dry_run: true})` |
| `cypher` | Custom graph queries | `knowledge-graph_cypher({query: "MATCH ..."})` |

## Impact Risk Levels

| Depth | Meaning | Action |
|-------|---------|--------|
| d=1 | WILL BREAK — direct callers/importers | MUST update these |
| d=2 | LIKELY AFFECTED — indirect deps | Should test |
| d=3 | MAY NEED TESTING — transitive | Test if critical path |

## Resources

| Resource | Use for |
|----------|---------|
| `knowledge-graph://repo/Knowledge-Graph/context` | Codebase overview, check index freshness |
| `knowledge-graph://repo/Knowledge-Graph/clusters` | All functional areas |
| `knowledge-graph://repo/Knowledge-Graph/processes` | All execution flows |
| `knowledge-graph://repo/Knowledge-Graph/process/{name}` | Step-by-step execution trace |

## Self-Check Before Finishing

Before completing any code modification task, verify:
1. `knowledge-graph_impact` was run for all modified symbols
2. No HIGH/CRITICAL risk warnings were ignored
3. `knowledge-graph_detect_changes()` confirms changes match expected scope
4. All d=1 (WILL BREAK) dependents were updated

## Keeping the Index Fresh

After committing code changes, the Knowledge-Graph index becomes stale. Re-run analyze to update it:

```bash
npx knowledge-graph analyze
```

If the index previously included embeddings, preserve them by adding `--embeddings`:

```bash
npx knowledge-graph analyze --embeddings
```

To check whether embeddings exist, inspect `.knowledge-graph/meta.json` — the `stats.embeddings` field shows the count (0 means no embeddings). **Running analyze without `--embeddings` will delete any previously generated embeddings.**

> Claude Code users: A PostToolUse hook handles this automatically after `git commit` and `git merge`.

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/knowledge-graph/knowledge-graph-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/knowledge-graph/knowledge-graph-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/knowledge-graph/knowledge-graph-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/knowledge-graph/knowledge-graph-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/knowledge-graph/knowledge-graph-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/knowledge-graph/knowledge-graph-cli/SKILL.md` |

<!-- knowledge-graph:end -->
