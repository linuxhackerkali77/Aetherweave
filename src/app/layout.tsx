import { ReactNode } from 'react';
import { Inter, Source_Code_Pro, Space_Grotesk } from 'next/font/google';
import { cn } from '@/lib/utils';
import '@/app/globals.css';
import ClientLayout from '@/components/providers/ClientLayout';

const sourceCodePro = Source_Code_Pro({
  subsets: ['latin'],
  variable: '--font-mono',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-headline',
});

export const metadata = {
  title: 'AetherDash - Cyberpunk Digital Hub | AI-Powered Productivity Platform',
  description: 'Experience the future with AetherDash - a cyberpunk-themed digital hub featuring AI assistance, real-time communication, task management, and advanced productivity tools. Built for the modern digital workspace.',
  keywords: 'cyberpunk, digital hub, AI assistant, productivity, task management, real-time chat, video calls, note taking, file management, dashboard',
  authors: [{ name: 'AetherDash Team' }],
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'AetherDash - Cyberpunk Digital Hub',
    description: 'Experience the future with AetherDash - a cyberpunk-themed digital hub featuring AI assistance, real-time communication, and advanced productivity tools.',
    url: 'https://aetherdash.com',
    siteName: 'AetherDash',
    images: [
      {
        url: 'https://aetherdash.com/og-image.jpg',
        width: 1200,
        height: 630,
      }
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AetherDash - Cyberpunk Digital Hub',
    description: 'Experience the future with AetherDash - a cyberpunk-themed digital hub featuring AI assistance and productivity tools.',
    images: ['https://aetherdash.com/og-image.jpg'],
    creator: '@aetherdash',
  },
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  manifest: '/manifest.json',
  themeColor: '#0ea5e9',
  applicationName: 'AetherDash',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://api.aetherdash.com" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            'name': 'AetherDash',
            'description': 'A cyberpunk-themed digital hub featuring AI assistance, real-time communication, and advanced productivity tools.',
            'url': 'https://aetherdash.com',
            'applicationCategory': 'ProductivityApplication',
            'operatingSystem': 'Web Browser',
            'offers': {
              '@type': 'Offer',
              'price': '0',
              'priceCurrency': 'USD'
            },
            'author': {
              '@type': 'Organization',
              'name': 'AetherDash Team'
            },
            'screenshot': 'https://aetherdash.com/screenshot.jpg',
            'featureList': [
              'AI Assistant',
              'Real-time Chat',
              'Video Calls',
              'Task Management',
              'Note Taking',
              'File Management',
              'Dashboard Analytics'
            ]
          })
        }} />
      </head>
      <body className={cn('min-h-screen font-sans antialiased no-scrollbar overflow-hidden', inter.variable, sourceCodePro.variable, spaceGrotesk.variable)} suppressHydrationWarning>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
