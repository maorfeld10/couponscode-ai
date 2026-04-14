import { Inngest } from 'inngest';

export const inngest = new Inngest({
  id: 'couponscode-ingestion',
  eventKey: process.env.INNGEST_EVENT_KEY,
});
