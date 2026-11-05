// Runs before the page paints (see app/layout.js) so a saved theme shows without a flash
export const themeScript = `try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}`
// Supabase invite links land on the homepage: pass them on to the password page before anything else reads the link
export const inviteScript = `if(/[#&](type=(invite|recovery)|error_code=)/.test(location.hash)&&location.pathname!=='/admin/set-password')location.replace('/admin/set-password'+location.hash)`
