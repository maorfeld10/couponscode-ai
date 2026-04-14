import type { GenerateOpts, LLMResult } from '@couponscode/contracts';
import type { LLMProviderConfig } from './types';
import { getAdapter } from './adapters';

export async function route(
  prompt: string,
  opts: GenerateOpts,
  providers: LLMProviderConfig[],
): Promise<LLMResult> {
  const candidates = providers
    .filter((p) => p.isActive && p.role === opts.role)
    .sort((a, b) => a.priority - b.priority);

  if (candidates.length === 0) {
    throw new Error(`No active LLM providers for role: ${opts.role}`);
  }

  let lastError: unknown;
  for (const provider of candidates) {
    const adapter = getAdapter(provider.adapterKey);
    if (!adapter) {
      lastError = new Error(`No adapter registered for: ${provider.adapterKey}`);
      continue;
    }
    try {
      return await adapter.generate(prompt, opts, provider);
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError ?? new Error('All LLM providers failed');
}
