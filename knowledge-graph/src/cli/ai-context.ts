/**
 * AI Context Generator
 *
 * Creates AGENTS.md and CLAUDE.md with full inline Knowledge-Graph context.
 * AGENTS.md is the standard read by Cursor, Windsurf, OpenCode, Codex, Cline, etc.
 * CLAUDE.md is for Claude Code which only reads that file.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { type GeneratedSkillInfo } from './skill-gen.js';

// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface RepoStats {
  files?: number;
  nodes?: number;
  edges?: number;
  communities?: number;
  clusters?: number; // Aggregated cluster count (what tools show)
  processes?: number;
}

export interface AIContextOptions {
  skipAgentsMd?: boolean;
  noStats?: boolean;
}

const KNOWLEDGE_GRAPH_START_MARKER = '<!-- knowledge-graph:start -->';
const KNOWLEDGE_GRAPH_END_MARKER = '<!-- knowledge-graph:end -->';

/**
 * Generate the full Knowledge-Graph context content.
 *
 * Design principles (learned from real agent behavior and industry research):
 * - Inline critical workflows — skills are skipped 56% of the time (Vercel eval data)
 * - Use RFC 2119 language (MUST, NEVER, ALWAYS) — models follow imperative rules
 * - Three-tier boundaries (Always/When/Never) — proven to change model behavior
 * - Keep under 120 lines — adherence degrades past 150 lines
 * - Exact tool commands with parameters — vague directives get ignored
 * - Self-review checklist — forces model to verify its own work
 */
async function findGroupsContainingRegistryName(registryName: string): Promise<string[]> {
  const { listGroups, getDefaultKnowledgeGraphDir, getGroupDir } =
    await import('../core/group/storage.js');
  const { loadGroupConfig } = await import('../core/group/config-parser.js');
  const names = await listGroups();
  const hits: string[] = [];
  for (const g of names) {
    try {
      const config = await loadGroupConfig(getGroupDir(getDefaultKnowledgeGraphDir(), g));
      if (Object.values(config.repos).some((r) => r === registryName)) hits.push(config.name);
    } catch {
      // skip invalid or unreadable groups
    }
  }
  return hits;
}

function generateKnowledgeGraphContent(
  projectName: string,
  stats: RepoStats,
  generatedSkills?: GeneratedSkillInfo[],
  groupNames?: string[],
  noStats?: boolean,
): string {
  const generatedRows =
    generatedSkills && generatedSkills.length > 0
      ? generatedSkills
          .map(
            (s) =>
              `| Work in the ${s.label} area (${s.symbolCount} symbols) | \`.claude/skills/generated/${s.name}/SKILL.md\` |`,
          )
          .join('\n')
      : '';

  const skillsTable = `| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | \`.claude/skills/knowledge-graph/knowledge-graph-exploring/SKILL.md\` |
| Blast radius / "What breaks if I change X?" | \`.claude/skills/knowledge-graph/knowledge-graph-impact-analysis/SKILL.md\` |
| Trace bugs / "Why is X failing?" | \`.claude/skills/knowledge-graph/knowledge-graph-debugging/SKILL.md\` |
| Rename / extract / split / refactor | \`.claude/skills/knowledge-graph/knowledge-graph-refactoring/SKILL.md\` |
| Tools, resources, schema reference | \`.claude/skills/knowledge-graph/knowledge-graph-guide/SKILL.md\` |
| Index, status, clean, wiki CLI commands | \`.claude/skills/knowledge-graph/knowledge-graph-cli/SKILL.md\` |${generatedRows ? '\n' + generatedRows : ''}`;

  return `${KNOWLEDGE_GRAPH_START_MARKER}
# Knowledge-Graph — Code Intelligence

This project is indexed by Knowledge-Graph as **${projectName}**${noStats ? '' : ` (${stats.nodes || 0} symbols, ${stats.edges || 0} relationships, ${stats.processes || 0} execution flows)`}. Use the Knowledge-Graph MCP tools to understand code, assess impact, and navigate safely.

> If any Knowledge-Graph tool warns the index is stale, run \`npx knowledge-graph analyze\` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run \`knowledge-graph_impact({target: "symbolName", direction: "upstream"})\` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run \`knowledge-graph_detect_changes()\` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use \`knowledge-graph_query({query: "concept"})\` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use \`knowledge-graph_context({name: "symbolName"})\`.

## When Debugging

1. \`knowledge-graph_query({query: "<error or symptom>"})\` — find execution flows related to the issue
2. \`knowledge-graph_context({name: "<suspect function>"})\` — see all callers, callees, and process participation
3. \`READ knowledge-graph://repo/${projectName}/process/{processName}\` — trace the full execution flow step by step
4. For regressions: \`knowledge-graph_detect_changes({scope: "compare", base_ref: "main"})\` — see what your branch changed

## When Refactoring

- **Renaming**: MUST use \`knowledge-graph_rename({symbol_name: "old", new_name: "new", dry_run: true})\` first. Review the preview — graph edits are safe, text_search edits need manual review. Then run with \`dry_run: false\`.
- **Extracting/Splitting**: MUST run \`knowledge-graph_context({name: "target"})\` to see all incoming/outgoing refs, then \`knowledge-graph_impact({target: "target", direction: "upstream"})\` to find all external callers before moving code.
- After any refactor: run \`knowledge-graph_detect_changes({scope: "all"})\` to verify only expected files changed.

## Never Do

- NEVER edit a function, class, or method without first running \`knowledge-graph_impact\` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use \`knowledge-graph_rename\` which understands the call graph.
- NEVER commit changes without running \`knowledge-graph_detect_changes()\` to check affected scope.

## Tools Quick Reference

| Tool | When to use | Command |
|------|-------------|---------|
| \`query\` | Find code by concept | \`knowledge-graph_query({query: "auth validation"})\` |
| \`context\` | 360-degree view of one symbol | \`knowledge-graph_context({name: "validateUser"})\` |
| \`impact\` | Blast radius before editing | \`knowledge-graph_impact({target: "X", direction: "upstream"})\` |
| \`detect_changes\` | Pre-commit scope check | \`knowledge-graph_detect_changes({scope: "staged"})\` |
| \`rename\` | Safe multi-file rename | \`knowledge-graph_rename({symbol_name: "old", new_name: "new", dry_run: true})\` |
| \`cypher\` | Custom graph queries | \`knowledge-graph_cypher({query: "MATCH ..."})\` |

## Impact Risk Levels

| Depth | Meaning | Action |
|-------|---------|--------|
| d=1 | WILL BREAK — direct callers/importers | MUST update these |
| d=2 | LIKELY AFFECTED — indirect deps | Should test |
| d=3 | MAY NEED TESTING — transitive | Test if critical path |

## Resources

| Resource | Use for |
|----------|---------|
| \`knowledge-graph://repo/${projectName}/context\` | Codebase overview, check index freshness |
| \`knowledge-graph://repo/${projectName}/clusters\` | All functional areas |
| \`knowledge-graph://repo/${projectName}/processes\` | All execution flows |
| \`knowledge-graph://repo/${projectName}/process/{name}\` | Step-by-step execution trace |

## Self-Check Before Finishing

Before completing any code modification task, verify:
1. \`knowledge-graph_impact\` was run for all modified symbols
2. No HIGH/CRITICAL risk warnings were ignored
3. \`knowledge-graph_detect_changes()\` confirms changes match expected scope
4. All d=1 (WILL BREAK) dependents were updated

## Keeping the Index Fresh

After committing code changes, the Knowledge-Graph index becomes stale. Re-run analyze to update it:

\`\`\`bash
npx knowledge-graph analyze
\`\`\`

If the index previously included embeddings, preserve them by adding \`--embeddings\`:

\`\`\`bash
npx knowledge-graph analyze --embeddings
\`\`\`

To check whether embeddings exist, inspect \`.knowledge-graph/meta.json\` — the \`stats.embeddings\` field shows the count (0 means no embeddings). **Running analyze without \`--embeddings\` will delete any previously generated embeddings.**

> Claude Code users: A PostToolUse hook handles this automatically after \`git commit\` and \`git merge\`.

${
  groupNames && groupNames.length > 0
    ? `## Cross-Repo Groups

This repository is listed under Knowledge-Graph **group(s): ${groupNames.join(', ')}** (see \`~/.knowledge-graph/groups/\`). For blast radius across repository boundaries, use MCP tools \`group_impact\`, \`group_sync\`, \`group_query\`, \`group_contracts\`, \`group_status\`, and \`group_list\`. From the terminal: \`npx knowledge-graph group list\`, \`npx knowledge-graph group sync <name>\`, \`npx knowledge-graph group impact <name> --target <symbol> --repo <group-path>\`.

`
    : ''
}## CLI

${skillsTable}

${KNOWLEDGE_GRAPH_END_MARKER}`;
}

/**
 * Check if a file exists
 */
async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Create or update Knowledge-Graph section in a file
 * - If file doesn't exist: create with Knowledge-Graph content
 * - If file exists without Knowledge-Graph section: append
 * - If file exists with Knowledge-Graph section: replace that section
 */
async function upsertKnowledgeGraphSection(
  filePath: string,
  content: string,
): Promise<'created' | 'updated' | 'appended'> {
  const exists = await fileExists(filePath);

  if (!exists) {
    await fs.writeFile(filePath, content, 'utf-8');
    return 'created';
  }

  const existingContent = await fs.readFile(filePath, 'utf-8');

  // Check if Knowledge-Graph section already exists
  const startIdx = existingContent.indexOf(KNOWLEDGE_GRAPH_START_MARKER);
  const endIdx = existingContent.indexOf(KNOWLEDGE_GRAPH_END_MARKER);

  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    // Replace existing section
    const before = existingContent.substring(0, startIdx);
    const after = existingContent.substring(endIdx + KNOWLEDGE_GRAPH_END_MARKER.length);
    const newContent = before + content + after;
    await fs.writeFile(filePath, newContent.trim() + '\n', 'utf-8');
    return 'updated';
  }

  // Append new section
  const newContent = existingContent.trim() + '\n\n' + content + '\n';
  await fs.writeFile(filePath, newContent, 'utf-8');
  return 'appended';
}

/**
 * Install Knowledge-Graph skills to .claude/skills/knowledge-graph/
 * Works natively with Claude Code, Cursor, and GitHub Copilot
 */
async function installSkills(repoPath: string): Promise<string[]> {
  const skillsDir = path.join(repoPath, '.claude', 'skills', 'knowledge-graph');
  const installedSkills: string[] = [];

  // Skill definitions bundled with the package
  const skills = [
    {
      name: 'knowledge-graph-exploring',
      description:
        'Use when the user asks how code works, wants to understand architecture, trace execution flows, or explore unfamiliar parts of the codebase. Examples: "How does X work?", "What calls this function?", "Show me the auth flow"',
    },
    {
      name: 'knowledge-graph-debugging',
      description:
        'Use when the user is debugging a bug, tracing an error, or asking why something fails. Examples: "Why is X failing?", "Where does this error come from?", "Trace this bug"',
    },
    {
      name: 'knowledge-graph-impact-analysis',
      description:
        'Use when the user wants to know what will break if they change something, or needs safety analysis before editing code. Examples: "Is it safe to change X?", "What depends on this?", "What will break?"',
    },
    {
      name: 'knowledge-graph-refactoring',
      description:
        'Use when the user wants to rename, extract, split, move, or restructure code safely. Examples: "Rename this function", "Extract this into a module", "Refactor this class", "Move this to a separate file"',
    },
    {
      name: 'knowledge-graph-guide',
      description:
        'Use when the user asks about Knowledge-Graph itself — available tools, how to query the knowledge graph, MCP resources, graph schema, or workflow reference. Examples: "What Knowledge-Graph tools are available?", "How do I use Knowledge-Graph?"',
    },
    {
      name: 'knowledge-graph-cli',
      description:
        'Use when the user needs to run Knowledge-Graph CLI commands like analyze/index a repo, check status, clean the index, generate a wiki, or list indexed repos. Examples: "Index this repo", "Reanalyze the codebase", "Generate a wiki"',
    },
  ];

  for (const skill of skills) {
    const skillDir = path.join(skillsDir, skill.name);
    const skillPath = path.join(skillDir, 'SKILL.md');

    try {
      // Create skill directory
      await fs.mkdir(skillDir, { recursive: true });

      // Try to read from package skills directory
      const packageSkillPath = path.join(__dirname, '..', '..', 'skills', `${skill.name}.md`);
      let skillContent: string;

      try {
        skillContent = await fs.readFile(packageSkillPath, 'utf-8');
      } catch {
        // Fallback: generate minimal skill content
        skillContent = `---
name: ${skill.name}
description: ${skill.description}
---

# ${skill.name.charAt(0).toUpperCase() + skill.name.slice(1)}

${skill.description}

Use Knowledge-Graph tools to accomplish this task.
`;
      }

      await fs.writeFile(skillPath, skillContent, 'utf-8');
      installedSkills.push(skill.name);
    } catch (err) {
      // Skip on error, don't fail the whole process
      console.warn(`Warning: Could not install skill ${skill.name}:`, err);
    }
  }

  return installedSkills;
}

/**
 * Generate AI context files after indexing
 */
export async function generateAIContextFiles(
  repoPath: string,
  _storagePath: string,
  projectName: string,
  stats: RepoStats,
  generatedSkills?: GeneratedSkillInfo[],
  options?: AIContextOptions,
): Promise<{ files: string[] }> {
  const groupNames = await findGroupsContainingRegistryName(projectName);
  const content = generateKnowledgeGraphContent(
    projectName,
    stats,
    generatedSkills,
    groupNames,
    options?.noStats,
  );
  const createdFiles: string[] = [];

  if (!options?.skipAgentsMd) {
    // Create AGENTS.md (standard for Cursor, Windsurf, OpenCode, Cline, etc.)
    const agentsPath = path.join(repoPath, 'AGENTS.md');
    const agentsResult = await upsertKnowledgeGraphSection(agentsPath, content);
    createdFiles.push(`AGENTS.md (${agentsResult})`);

    // Create CLAUDE.md (for Claude Code)
    const claudePath = path.join(repoPath, 'CLAUDE.md');
    const claudeResult = await upsertKnowledgeGraphSection(claudePath, content);
    createdFiles.push(`CLAUDE.md (${claudeResult})`);
  } else {
    createdFiles.push('AGENTS.md (skipped via --skip-agents-md)');
    createdFiles.push('CLAUDE.md (skipped via --skip-agents-md)');
  }

  // Install skills to .claude/skills/knowledge-graph/
  const installedSkills = await installSkills(repoPath);
  if (installedSkills.length > 0) {
    createdFiles.push(`.claude/skills/knowledge-graph/ (${installedSkills.length} skills)`);
  }

  return { files: createdFiles };
}
