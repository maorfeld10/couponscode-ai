import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'couponscode.ai',
  description: 'Verified coupons, promo codes, and deals from your favorite brands.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
