import { Outfit } from 'next/font/google'
import './globals.css'
import ThemeToggle from '@/components/ThemeToggle'
import { themeScript } from '@/lib/theme'
const f = Outfit({ subsets: ['latin'], weight: ['400', '600', '800'] })
export const metadata = { title: 'Deliverance Ministries & The Way of God Church Int' }
export default function RootLayout({ children }) {
  return <html lang="en" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
    <body className={f.className}>{children}<ThemeToggle /></body></html>
}
