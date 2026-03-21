import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PRD Builder',
  description: 'Product Requirements Document Builder',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-slate-900 text-white">{children}</body>
    </html>
  )
}
