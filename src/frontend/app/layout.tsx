import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'بیمه‌یار هوشمند - SmartSure',
  description: 'پلتفرم بیمه دیجیتال یکپارچه با هوش مصنوعی، اینترنت اشیا و بلاک‌چین',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fa" dir="rtl">
      <body className={inter.className}>{children}</body>
    </html>
  )
}

