export const Events = {
  IngestionMerchantUpserted: 'ingestion.merchant.upserted',
  IngestionRunCompleted: 'ingestion.run.completed',
  ContentDraftCreated: 'content.draft.created',
  ContentPublished: 'content.published',
  ClickRecorded: 'click.recorded',
  ConversionReceived: 'conversion.received',
  RefreshCompleted: 'refresh.completed',
} as const;

export type EventName = (typeof Events)[keyof typeof Events];

export interface IngestionMerchantUpsertedPayload {
  merchantId: string;
  isNew: boolean;
}

export interface IngestionRunCompletedPayload {
  runId: string;
  networkKey: string;
  recordsProcessed: number;
  status: 'success' | 'failure';
}

export interface RefreshCompletedPayload {
  runId: string;
  itemsUpdated: number;
}
