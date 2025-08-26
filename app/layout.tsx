import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script';
import './globals.css'
import ClientWrapper from './client-wrapper';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Starchive - Find the Right Tools for Your Next Project',
  description: 'Discover curated repositories from GitHub stars to help you find the right technology for your project.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <Script defer src="https://analytics.prosa.space/script.js" data-website-id="caa1ffea-c611-445a-93ee-e37061db2e33" />
      </head>
      <body className={inter.className}>
        <ClientWrapper>
          {children}
        </ClientWrapper>
      </body>
    </html>
  )
}
