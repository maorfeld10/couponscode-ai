import { z } from 'zod';

export const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
});

export const clickRequestSchema = z.object({
  merchantId: z.string().uuid(),
  couponId: z.string().uuid().optional(),
  clickType: z.enum(['show_code', 'get_deal']),
  sessionId: z.string().optional(),
});

export const newsletterSignupSchema = z.object({
  email: z.string().email().max(254),
  source: z.string().max(64).optional(),
});

export type ClickRequest = z.infer<typeof clickRequestSchema>;
export type NewsletterSignup = z.infer<typeof newsletterSignupSchema>;
