# Contributing to Knowledge-Graph

How to propose changes, run checks locally, and open pull requests.

## License

This project uses the [PolyForm Noncommercial License 1.0.0](https://polyformproject.org/licenses/noncommercial/1.0.0/). By contributing, you agree your contributions are licensed under the same terms unless stated otherwise.

## Where to discuss

- **Issues & feature ideas:** use [GitHub Issues](https://github.com/BAS-More/knowledge-graph/issues) for the upstream repo, or your fork’s tracker if you work from a fork.
- **Community:** see the Discord link in the root [README.md](README.md).

## Development setup

1. Clone the repository.
2. **CLI / MCP package:** `cd knowledge-graph && npm install && npm run build`
3. **Web UI (if needed):** `cd knowledge-graph-web && npm install`
4. Run tests as described in [TESTING.md](TESTING.md).

## Branch and pull requests

- Use short-lived branches off the default branch of the repo you are targeting.
- Prefer **conventional commits** (short prefix + description), for example:

  ```text
  feat: add graph export option
  fix: correct MCP tool schema for query
  test: cover cluster merge edge case
  docs: clarify analyze flags
  ```

- **PR title:** `[area] Short description` (e.g. `[cli] Fix index refresh race`).
- **PR description:** what changed, why, how to verify (commands), and any risk or rollback notes.

## Before you open a PR

- [ ] Tests pass for the packages you touched (`knowledge-graph` and/or `knowledge-graph-web`).
- [ ] Typecheck passes: `npx tsc --noEmit` in `knowledge-graph/` and `npx tsc -b --noEmit` in `knowledge-graph-web/`.
- [ ] No secrets, tokens, or machine-specific paths committed.
- [ ] Documentation updated if behavior or public CLI/MCP contract changes.
- [ ] Pre-commit hook runs clean (`.husky/pre-commit` — typecheck + unit tests for staged packages).

## Code review

Maintainers may request changes for correctness, tests, performance, or consistency with existing patterns. Keeping diffs focused makes review faster.

## AI-assisted contributions

If you use coding agents, follow project context files (e.g. `AGENTS.md`, `CLAUDE.md`) and avoid drive-by refactors unrelated to the issue. Prefer incremental, test-backed changes.
