import type { LLMAdapter, LLMProviderConfig, AdapterKey } from '../types';
import type { GenerateOpts, LLMResult } from '@couponscode/contracts';

export abstract class BaseLLMAdapter implements LLMAdapter {
  abstract readonly key: AdapterKey;
  abstract generate(
    prompt: string,
    opts: GenerateOpts,
    config: LLMProviderConfig,
  ): Promise<LLMResult>;
}
