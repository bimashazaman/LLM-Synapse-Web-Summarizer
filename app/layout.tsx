import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

// Initialize the Inter font
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'WebSummarizer - AI-Powered Website Summaries',
  description:
    'Get instant AI-powered summaries of any website content with WebSummarizer.',
  keywords: 'website summary, AI summary, web content, summarization tool',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='en' className={inter.variable}>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
