import { Outfit } from 'next/font/google'
import './globals.css'
import ThemeToggle from '@/components/ThemeToggle'
import { themeScript, inviteScript } from '@/lib/theme'
import { getLive } from '@/lib/live'
const f = Outfit({ subsets: ['latin'], weight: ['400', '600', '800'] })
export const revalidate = 60 // so the live bar comes and goes on every page
export const metadata = { title: 'Deliverance Ministries & The Way of God Church Int' }
export default async function RootLayout({ children }) {
  const live = await getLive()
  return <html lang="en" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: inviteScript }} /><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
    <body className={f.className}>{live && <a className="live-bar" href="/live"><span className="live-dot" /> LIVE NOW · {live.title} — Watch</a>}{children}<ThemeToggle /></body></html>
}
