export interface RawMerchant {
  externalId: string;
  name: string;
  domain: string;
  logoUrl?: string;
  categoryNames?: string[];
  trackingLinkTemplate: string;
  description?: string;
  rawPayload: unknown;
}

export interface RawCoupon {
  externalId: string;
  merchantExternalId: string;
  title: string;
  code?: string;
  dealType: 'code' | 'sale' | 'printable';
  discountValue?: number;
  discountType?: 'percent' | 'fixed';
  validFrom?: Date;
  validThrough?: Date;
  priority?: number;
  rawPayload: unknown;
}

export interface HealthStatus {
  ok: boolean;
  message: string;
  latencyMs: number;
}

export interface GenerateOpts {
  role: 'primary' | 'secondary' | 'fallback';
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
}

export interface LLMResult {
  text: string;
  model: string;
  provider: string;
  tokensUsed: number;
  latencyMs: number;
}
