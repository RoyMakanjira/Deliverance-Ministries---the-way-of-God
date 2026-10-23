'use client'
import { useEffect, useState } from 'react'
const Sun = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="4.5" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
const Moon = () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 14.5A9 9 0 1 1 9.5 3a7 7 0 0 0 11.5 11.5z" /></svg>
export default function ThemeToggle() {
  const [dark, setDark] = useState(null)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const read = () => { const t = document.documentElement.dataset.theme; setDark(t ? t === 'dark' : mq.matches) }
    read(); mq.addEventListener('change', read)
    return () => mq.removeEventListener('change', read)
  }, [])
  function flip() {
    const t = dark ? 'light' : 'dark'
    document.documentElement.dataset.theme = t
    try { localStorage.setItem('theme', t) } catch (e) {}
    setDark(!dark)
  }
  if (dark === null) return null
  return <button className="theme-btn" onClick={flip} aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'} title={dark ? 'Light mode' : 'Dark mode'}>{dark ? <Sun /> : <Moon />}</button>
}
