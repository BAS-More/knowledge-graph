/**
 * Unit Tests: MCP Tool Definitions
 *
 * Tests: KNOWLEDGE_GRAPH_TOOLS from tools.ts
 * - All 16 tools are defined (per-repo + group_*)
 * - Each tool has valid name, description, inputSchema
 * - Required fields are correct
 * - Optional repo parameter is present on tools that need it
 */
import { describe, it, expect } from 'vitest';
import { KNOWLEDGE_GRAPH_TOOLS } from '../../src/mcp/tools.js';

const GROUP_TOOLS = new Set([
  'group_list',
  'group_sync',
  'group_contracts',
  'group_query',
  'group_status',
]);

describe('KNOWLEDGE_GRAPH_TOOLS', () => {
  it('exports all tools (7 base + 3 route/tool/shape + 1 api_impact + 5 group)', () => {
    expect(KNOWLEDGE_GRAPH_TOOLS).toHaveLength(16);
  });

  it('contains all expected tool names', () => {
    const names = KNOWLEDGE_GRAPH_TOOLS.map((t) => t.name);
    expect(names).toEqual(
      expect.arrayContaining([
        'list_repos',
        'query',
        'cypher',
        'context',
        'detect_changes',
        'rename',
        'impact',
        'api_impact',
      ]),
    );
  });

  it('each tool has name, description, and inputSchema', () => {
    for (const tool of KNOWLEDGE_GRAPH_TOOLS) {
      expect(tool.name).toBeTruthy();
      expect(typeof tool.name).toBe('string');
      expect(tool.description).toBeTruthy();
      expect(typeof tool.description).toBe('string');
      expect(tool.inputSchema).toBeDefined();
      expect(tool.inputSchema.type).toBe('object');
      expect(tool.inputSchema.properties).toBeDefined();
      expect(Array.isArray(tool.inputSchema.required)).toBe(true);
    }
  });

  it('query tool requires "query" parameter', () => {
    const queryTool = KNOWLEDGE_GRAPH_TOOLS.find((t) => t.name === 'query')!;
    expect(queryTool.inputSchema.required).toContain('query');
    expect(queryTool.inputSchema.properties.query).toBeDefined();
    expect(queryTool.inputSchema.properties.query.type).toBe('string');
  });

  it('cypher tool requires "query" parameter', () => {
    const cypherTool = KNOWLEDGE_GRAPH_TOOLS.find((t) => t.name === 'cypher')!;
    expect(cypherTool.inputSchema.required).toContain('query');
  });

  it('context tool has no required parameters', () => {
    const contextTool = KNOWLEDGE_GRAPH_TOOLS.find((t) => t.name === 'context')!;
    expect(contextTool.inputSchema.required).toEqual([]);
  });

  it('impact tool requires target and direction', () => {
    const impactTool = KNOWLEDGE_GRAPH_TOOLS.find((t) => t.name === 'impact')!;
    expect(impactTool.inputSchema.required).toContain('target');
    expect(impactTool.inputSchema.required).toContain('direction');
  });

  it('rename tool requires new_name', () => {
    const renameTool = KNOWLEDGE_GRAPH_TOOLS.find((t) => t.name === 'rename')!;
    expect(renameTool.inputSchema.required).toContain('new_name');
  });

  it('detect_changes tool has no required parameters', () => {
    const detectTool = KNOWLEDGE_GRAPH_TOOLS.find((t) => t.name === 'detect_changes')!;
    expect(detectTool.inputSchema.required).toEqual([]);
  });

  it('list_repos tool has no parameters', () => {
    const listTool = KNOWLEDGE_GRAPH_TOOLS.find((t) => t.name === 'list_repos')!;
    expect(Object.keys(listTool.inputSchema.properties)).toHaveLength(0);
    expect(listTool.inputSchema.required).toEqual([]);
  });

  it('per-repo tools have optional repo parameter for backend selection', () => {
    for (const tool of KNOWLEDGE_GRAPH_TOOLS) {
      if (tool.name === 'list_repos') continue;
      if (GROUP_TOOLS.has(tool.name)) continue;
      expect(tool.inputSchema.properties.repo).toBeDefined();
      expect(tool.inputSchema.properties.repo.type).toBe('string');
      expect(tool.inputSchema.required).not.toContain('repo');
    }
  });

  it('group_contracts has optional repo filter', () => {
    const groupContracts = KNOWLEDGE_GRAPH_TOOLS.find((t) => t.name === 'group_contracts')!;
    expect(groupContracts.inputSchema.properties).toHaveProperty('repo');
    expect(groupContracts.inputSchema.required).not.toContain('repo');
  });

  it('group tools without backend repo param omit repo property', () => {
    for (const name of ['group_list', 'group_status', 'group_sync', 'group_query'] as const) {
      const tool = KNOWLEDGE_GRAPH_TOOLS.find((t) => t.name === name)!;
      expect(tool.inputSchema.properties).not.toHaveProperty('repo');
    }
  });

  it('group_query requires name and query', () => {
    const groupQuery = KNOWLEDGE_GRAPH_TOOLS.find((t) => t.name === 'group_query')!;
    expect(groupQuery.inputSchema.required).toContain('name');
    expect(groupQuery.inputSchema.required).toContain('query');
  });

  it('detect_changes scope has correct enum values', () => {
    const detectTool = KNOWLEDGE_GRAPH_TOOLS.find((t) => t.name === 'detect_changes')!;
    const scopeProp = detectTool.inputSchema.properties.scope;
    expect(scopeProp.enum).toEqual(['unstaged', 'staged', 'all', 'compare']);
  });

  it('api_impact tool has no required parameters', () => {
    const apiImpactTool = KNOWLEDGE_GRAPH_TOOLS.find((t) => t.name === 'api_impact')!;
    expect(apiImpactTool).toBeDefined();
    expect(apiImpactTool.inputSchema.required).toEqual([]);
    expect(apiImpactTool.inputSchema.properties.route).toBeDefined();
    expect(apiImpactTool.inputSchema.properties.file).toBeDefined();
    expect(apiImpactTool.inputSchema.properties.repo).toBeDefined();
  });

  it('impact relationTypes is array of strings', () => {
    const impactTool = KNOWLEDGE_GRAPH_TOOLS.find((t) => t.name === 'impact')!;
    const relProp = impactTool.inputSchema.properties.relationTypes;
    expect(relProp.type).toBe('array');
    expect(relProp.items).toEqual({ type: 'string' });
  });

  it('route_map description defers to api_impact for pre-change analysis', () => {
    const routeMapTool = KNOWLEDGE_GRAPH_TOOLS.find((t) => t.name === 'route_map')!;
    expect(routeMapTool.description).toContain('api_impact');
    expect(routeMapTool.description).toContain('pre-change analysis');
  });

  it('shape_check description defers to api_impact for pre-change analysis', () => {
    const shapeCheckTool = KNOWLEDGE_GRAPH_TOOLS.find((t) => t.name === 'shape_check')!;
    expect(shapeCheckTool.description).toContain('api_impact');
    expect(shapeCheckTool.description).toContain('pre-change analysis');
  });
});
