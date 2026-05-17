export function AuthShell({ title, subtitle, children, aside }) {
  return (
    <div className="screen auth-screen">
      <section className="hero-panel">
        <div className="brand-badge">QuestPro</div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
        {aside}
      </section>
      <section className="form-panel">{children}</section>
    </div>
  );
}

export function AppShell({ header, children }) {
  return (
    <div className="screen app-screen">
      <header className="topbar">{header}</header>
      <main className="main-content">{children}</main>
    </div>
  );
}
