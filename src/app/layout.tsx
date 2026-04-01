import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/app/globals.css'
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Arsip Digital Offline',
  description: 'Pencatatan Dokumen Fisik Santri di Lapangan',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className={inter.className}>
        {children}
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  )
}
