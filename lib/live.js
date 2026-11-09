import { supabase as db } from '@/lib/supabase'
// The live stream is the content row 'live': title = what is on, body = the stream link (empty = not live)
export const getLive = async () => {
  const { data } = await db.from('content').select('title,body').eq('key', 'live').maybeSingle()
  return data?.body ? { title: data.title || 'Live service', url: data.body } : null
}
// Player address for a YouTube or Facebook link; null for anything else (the page then shows a "Watch" button)
export const embedUrl = url => {
  const yt = url.match(/(?:youtu\.be\/|[?&]v=|\/live\/|\/embed\/|\/shorts\/)([\w-]{11})/)
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?autoplay=1&mute=1`
  if (/facebook\.com|fb\.watch/.test(url)) return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&autoplay=true&mute=true`
  return null
}
