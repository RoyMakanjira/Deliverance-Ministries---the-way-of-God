'use client'
// Top bar of the admin dashboards, matching the site's navigation buttons. children = dashboard links, menu = section links.
export default function AdminBar({ title, onSignOut, children, menu }) {
  return (
    <header>
      <div className="brand"><img src="/logo.png" alt="logo" /><b>{title}</b></div>
      <nav><a href="/">Home</a>{children}<a href="/admin/set-password">Change password</a><button onClick={onSignOut}>Sign out</button></nav>
      {menu && <nav className="admin-menu">{menu}</nav>}
    </header>
  )
}
