import { Outfit } from 'next/font/google'
import './globals.css'
const f = Outfit({ subsets: ['latin'], weight: ['400', '600', '800'] })
export const metadata = { title: 'Deliverance Ministries & The Way of God Church Int' }
export default function RootLayout({ children }) {
  return <html lang="en"><body className={f.className}>{children}</body></html>
}
