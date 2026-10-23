// Runs before the page paints (see app/layout.js) so a saved theme shows without a flash
export const themeScript = `try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}`
