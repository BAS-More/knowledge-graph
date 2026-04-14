import { beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';

// Reset storage between tests
beforeEach(() => {
  sessionStorage.removeItem('knowledge-graph-llm-settings');
  localStorage.removeItem('knowledge-graph-llm-settings'); // legacy key (migration)
});
