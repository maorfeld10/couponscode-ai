import type { LLMAdapter, AdapterKey } from '../types';

// Real adapter implementations (anthropic, openai, google, xai, manus, custom)
// are added in Subsystem 4. This registry is a placeholder.
export const adapterRegistry: Partial<Record<AdapterKey, LLMAdapter>> = {};

export function registerAdapter(adapter: LLMAdapter): void {
  adapterRegistry[adapter.key] = adapter;
}

export function getAdapter(key: AdapterKey): LLMAdapter | undefined {
  return adapterRegistry[key];
}
