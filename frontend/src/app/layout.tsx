import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Trao AI — Intelligent Travel Planner',
    template: '%s | Trao AI',
  },
  description:
    'Plan your perfect trip with Trao AI. Generate personalized day-by-day itineraries, smart budget breakdowns, hotel recommendations, and weather-aware packing lists — powered by Google Gemini AI.',
  keywords: [
    'AI travel planner',
    'itinerary generator',
    'trip planning',
    'travel AI',
    'Gemini AI travel',
    'smart packing list',
  ],
  authors: [{ name: 'Trao AI' }],
  creator: 'Trao AI',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    title: 'Trao AI — Intelligent Travel Planner',
    description:
      'Generate AI-powered travel itineraries tailored to your style, budget, and interests.',
    siteName: 'Trao AI',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Trao AI — Intelligent Travel Planner',
    description:
      'Generate AI-powered travel itineraries tailored to your style, budget, and interests.',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} antialiased bg-white text-gray-900`}>
        {children}
      </body>
    </html>
  );
}
