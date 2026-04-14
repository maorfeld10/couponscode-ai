import type { GenerateOpts, LLMResult } from '@couponscode/contracts';

export type AdapterKey = 'anthropic' | 'openai' | 'google' | 'xai' | 'manus' | 'custom';

export interface LLMProviderConfig {
  id: string;
  name: string;
  adapterKey: AdapterKey;
  model: string;
  role: 'primary' | 'secondary' | 'fallback';
  priority: number;
  isActive: boolean;
  apiKeyRef: string;
  config: Record<string, unknown>;
}

export interface LLMAdapter {
  readonly key: AdapterKey;
  generate(prompt: string, opts: GenerateOpts, config: LLMProviderConfig): Promise<LLMResult>;
}

export type { GenerateOpts, LLMResult };
