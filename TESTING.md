# Testing — Knowledge-Graph

How we structure tests and which commands to run locally and in CI.

## Packages

| Package        | Path           | Runner   | Notes                          |
| -------------- | -------------- | -------- | ------------------------------ |
| CLI + MCP core | `knowledge-graph/`    | Vitest   | Primary test surface in CI     |
| Web UI         | `knowledge-graph-web/`| Vitest   | Unit/component tests           |
| Web UI E2E     | `knowledge-graph-web/`| Playwright | Run when changing UI flows   |

## Commands (local)

From repository root, unless noted:

**`knowledge-graph` (CLI / library)**

```bash
cd knowledge-graph
npm install
npm run build
npm test                    # unit: vitest run test/unit
npm run test:integration    # integration suite
npm run test:all
npm run test:coverage
npx tsc --noEmit            # typecheck (matches CI)
```

**`knowledge-graph-web`**

```bash
cd knowledge-graph-web
npm install
npm test                    # unit tests (vitest)
npx tsc -b --noEmit         # typecheck (matches CI)
npm run test:coverage
npm run test:e2e            # Playwright (requires knowledge-graph serve + npm run dev)
```

## Pre-commit hook

A husky pre-commit hook (`.husky/pre-commit`) runs automatically on every `git commit`:

- **`knowledge-graph-web/` files staged** → `tsc -b --noEmit` + `vitest run`
- **`knowledge-graph/` files staged** → `tsc --noEmit` + `vitest run --project default`

Skip with `git commit --no-verify` (use sparingly).

## Test categories

- **Unit** — Pure logic, parsers, graph/query helpers; fast; no network.
- **Integration** — Real combinations (filesystem, MCP wiring, larger pipelines) as already organized under `knowledge-graph/test/integration`.
- **Eval-style / golden sets** — For agent- or classification-style behavior, keep labeled inputs and expected outputs (JSON or table-driven tests) and run them in CI when relevant.
- **E2E (web)** — Critical user paths only; prefer `data-testid` attributes for stable selectors. Tests run against real backend (`knowledge-graph serve`) and Vite dev server.

## Performance metrics (targets)

Set targets to match team expectations, then tune to this repo’s CI reality:

| Metric              | Target (initial) | Notes                                      |
| ------------------- | ---------------- | ------------------------------------------ |
| Unit coverage       | Align with CI    | CI runs Vitest with coverage in `knowledge-graph` |
| Unit wall time      | Fast PR feedback | Use `vitest run test/unit` for tight loop  |
| Integration duration| &lt; few minutes | Guard heavy tests with env flags if needed |

## Regression testing

Re-run the full relevant suite when:

- Prompt or agent-behavior documentation changes (if tests encode behavior)
- Model or embedding-related code paths change
- Graph schema, query contracts, or MCP tool shapes change
- Dependencies with parsing or runtime impact upgrade

## CI integration

GitHub Actions (`.github/workflows/ci.yml`) orchestrate:

- **`ci-quality.yml`** — `tsc --noEmit` for `knowledge-graph/` + `tsc -b --noEmit` for `knowledge-graph-web/`
- **`ci-tests.yml`** — `vitest run` with coverage (ubuntu) + cross-platform (macOS, Windows)
- **`ci-e2e.yml`** — Playwright E2E tests, gated on `knowledge-graph-web/**` changes

Local checks before pushing:

```bash
cd knowledge-graph && npx tsc --noEmit && npm test
cd ../knowledge-graph-web && npx tsc -b --noEmit && npm test
```

Or rely on the pre-commit hook which runs these automatically for staged files.

## User acceptance / beta (optional)

For staged releases or UI betas: deploy to a staging environment, collect structured feedback, watch errors and latency, then iterate before a wider release.
