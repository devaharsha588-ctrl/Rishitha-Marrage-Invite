import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, DM_Sans } from 'next/font/google';
import './globals.css';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-serif',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-sans',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://krishna-rishitha.wedding'),
  title: 'Krishna & Rishitha — Wedding Invitation',
  description:
    'Wedding celebration of Krishna and Rishitha in Penugonda, Andhra Pradesh on December 13, 2026.',
  openGraph: {
    title: 'Krishna & Rishitha — Wedding Invitation',
    description:
      'Join Krishna & Rishitha for their wedding celebration in Penugonda.',
    type: 'website',
    images: [
      {
        url: '/images/hero.webp',
        width: 1920,
        height: 1080,
        alt: 'Krishna & Rishitha — Wedding Invitation',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Krishna & Rishitha — Wedding Invitation',
    description:
      'Join Krishna & Rishitha for their wedding celebration in Penugonda.',
    images: ['/images/hero.webp'],
  },
};

export const viewport: Viewport = {
  themeColor: '#2A0C11',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${dmSans.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
