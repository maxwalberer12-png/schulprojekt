import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Schul-Assistent – KI-Assistent für Grundschullehrkräfte',
  description:
    'DSGVO-konformer KI-Assistent für Grundschullehrkräfte. Erstellen Sie Berichte, Elternbriefe und Unterrichtsmaterial – schnell, sicher und datenschutzkonform.',
  keywords: 'Schule, Grundschule, Lehrkraft, KI, Assistent, DSGVO',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="de" className={inter.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
