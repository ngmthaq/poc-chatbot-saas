# Atomic Design

Organize all UI components into five levels based on complexity and composition.

## Atoms

Smallest, indivisible elements. Context-agnostic, fully reusable.

```javascript
function Button({ label, variant, onClick, disabled }) {
  return (
    <button className={variant} onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
}
```

## Molecules

Small groups of atoms functioning as a unit. Single clear purpose, minimal internal state.

```javascript
function SearchField({ onSearch }) {
  const [query, setQuery] = useState('');
  return (
    <div>
      <Input value={query} onChange={setQuery} />
      <Button label="Search" onClick={() => onSearch(query)} />
    </div>
  );
}
```

## Organisms

Complex UI sections composed of molecules and/or atoms. May contain business logic or state.

```javascript
function Header({ user, onSearch, onLogout }) {
  return (
    <header>
      <Logo />
      <NavBar items={mainNavItems} />
      <SearchField onSearch={onSearch} />
      <UserMenu user={user} onLogout={onLogout} />
    </header>
  );
}
```

## Templates

Page-level layout structures. Accept content via props/slots — no real data, no data fetching.

```javascript
function DashboardTemplate({ sidebar, header, mainContent, footer }) {
  return (
    <div className="dashboard-layout">
      <div className="sidebar">{sidebar}</div>
      <div className="main">
        {header}
        {mainContent}
        {footer}
      </div>
    </div>
  );
}
```

## Pages

Specific instances of templates with real data, API connections, routing, and side effects.

```javascript
function DashboardPage() {
  const user = useCurrentUser();
  const stats = useDashboardStats();
  return (
    <DashboardTemplate
      sidebar={<Sidebar user={user} />}
      header={<Header user={user} onSearch={handleSearch} />}
      mainContent={<StatsGrid stats={stats} />}
      footer={<Footer />}
    />
  );
}
```

## Folder Structure

```text
components/
├── atoms/         # Button, Input, Icon, Badge
├── molecules/     # SearchField, FormField, NavItem
├── organisms/     # Header, ProductCard, CommentSection
├── templates/     # DashboardTemplate, AuthTemplate
└── pages/         # HomePage, UserProfilePage
```

## Atomic Design Enforcement Rules

1. Before creating a component, determine its level: "Does it compose other components? Which level are those?"
2. Atoms must never import other components from the same design system.
3. Molecules compose atoms — never duplicate atom logic inline.
4. Templates accept content via props/slots/children — never fetch data or hardcode organisms.
5. Pages are the **only** level that connects to routing, data fetching, and global state.
6. Flag misplacements: "This molecule imports an organism — hierarchy inversion."
