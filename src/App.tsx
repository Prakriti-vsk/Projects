import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";

type Category = "Produce" | "Dairy" | "Bakery" | "Pantry" | "Household";
type View = "Overview" | "My lists" | "History" | "Categories" | "Settings";

type ShoppingItem = {
  id: number;
  name: string;
  category: Category;
  quantity: number;
  unit: string;
  price: number;
  purchased: boolean;
};

type HistoryEntry = {
  id: number;
  name: string;
  date: string;
  items: ShoppingItem[];
  total: number;
};

type Preferences = {
  preventDuplicates: boolean;
  showPrices: boolean;
  reminders: boolean;
};

const categories: Category[] = ["Produce", "Dairy", "Bakery", "Pantry", "Household"];

const initialItems: ShoppingItem[] = [
  { id: 1, name: "Avocados", category: "Produce", quantity: 3, unit: "pcs", price: 4.5, purchased: false },
  { id: 2, name: "Sourdough bread", category: "Bakery", quantity: 1, unit: "loaf", price: 4.25, purchased: false },
  { id: 3, name: "Greek yogurt", category: "Dairy", quantity: 2, unit: "tubs", price: 6.4, purchased: false },
  { id: 4, name: "Cherry tomatoes", category: "Produce", quantity: 1, unit: "box", price: 3.75, purchased: true },
  { id: 5, name: "Oat milk", category: "Dairy", quantity: 2, unit: "cartons", price: 7.2, purchased: true },
  { id: 6, name: "Pasta", category: "Pantry", quantity: 2, unit: "packs", price: 5.1, purchased: false },
  { id: 7, name: "Dish soap", category: "Household", quantity: 1, unit: "bottle", price: 4.8, purchased: false },
];

const categoryStyle: Record<Category, string> = {
  Produce: "category category-produce",
  Dairy: "category category-dairy",
  Bakery: "category category-bakery",
  Pantry: "category category-pantry",
  Household: "category category-household",
};

type IconName =
  | "bag"
  | "grid"
  | "list"
  | "history"
  | "tag"
  | "settings"
  | "search"
  | "plus"
  | "chevron"
  | "more"
  | "check"
  | "trash"
  | "x"
  | "spark";

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    bag: <><path d="M6.5 8V6a5.5 5.5 0 0 1 11 0v2" /><path d="M4 8h16l-1 13H5L4 8Z" /></>,
    grid: <><rect x="3" y="3" width="7" height="7" rx="2" /><rect x="14" y="3" width="7" height="7" rx="2" /><rect x="3" y="14" width="7" height="7" rx="2" /><rect x="14" y="14" width="7" height="7" rx="2" /></>,
    list: <><path d="M9 6h12M9 12h12M9 18h12" /><circle cx="4.5" cy="6" r=".8" fill="currentColor" /><circle cx="4.5" cy="12" r=".8" fill="currentColor" /><circle cx="4.5" cy="18" r=".8" fill="currentColor" /></>,
    history: <><path d="M3.5 12a8.5 8.5 0 1 0 2-5.5L3 9" /><path d="M3 4v5h5M12 7.5V12l3 2" /></>,
    tag: <><path d="m20 13-7 7L3 10V3h7l10 10Z" /><circle cx="7.5" cy="7.5" r="1" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    plus: <path d="M12 5v14M5 12h14" />,
    chevron: <path d="m9 18 6-6-6-6" />,
    more: <><circle cx="5" cy="12" r="1" fill="currentColor" /><circle cx="12" cy="12" r="1" fill="currentColor" /><circle cx="19" cy="12" r="1" fill="currentColor" /></>,
    check: <path d="m6 12 4 4 8-9" />,
    trash: <><path d="M4 7h16M9 7V4h6v3M6.5 7l1 14h9l1-14M10 11v6M14 11v6" /></>,
    x: <path d="m6 6 12 12M18 6 6 18" />,
    spark: <><path d="m12 3 1.2 4.8L18 9l-4.8 1.2L12 15l-1.2-4.8L6 9l4.8-1.2L12 3Z" /><path d="m19 15 .6 2.4L22 18l-2.4.6L19 21l-.6-2.4L16 18l2.4-.6L19 15Z" /></>,
  };

  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

function SecondaryView({ view, items, listName, history, preferences, onPreferencesChange, onOpenList, onCreateList, onRestore }: {
  view: Exclude<View, "Overview">;
  items: ShoppingItem[];
  listName: string;
  history: HistoryEntry[];
  preferences: Preferences;
  onPreferencesChange: (preferences: Preferences) => void;
  onOpenList: () => void;
  onCreateList: () => void;
  onRestore: (entry: HistoryEntry) => void;
}) {
  const purchased = items.filter((item) => item.purchased).length;
  const categoryCounts = categories.map((name) => ({
    name,
    count: items.filter((item) => item.category === name).length,
  }));

  const headings: Record<Exclude<View, "Overview">, [string, string, string]> = {
    "My lists": ["Shopping lists", "All your lists, organized in one place.", "Lists"],
    History: ["Shopping history", "Review your completed shopping trips.", "Activity"],
    Categories: ["Categories", "See how your items are organized.", "Manage"],
    Settings: ["Settings", "Customize your Basketly experience.", "Preferences"],
  };
  const [title, description, eyebrow] = headings[view];

  return (
    <div className="content secondary-content">
      <section className="page-heading">
        <div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{description}</p></div>
        {view === "My lists" && <button className="primary-button" onClick={onCreateList}><Icon name="plus" size={18} /> New list</button>}
      </section>

      {view === "My lists" && (
        <section className="list-cards">
          <button className="list-card current" onClick={onOpenList}>
            <div className="list-card-icon"><Icon name="bag" /></div>
            <span className="list-card-status">Active</span>
            <h2>{listName}</h2>
            <p>{items.length} items · {purchased} purchased</p>
            <div className="progress light"><span style={{ width: `${items.length ? (purchased / items.length) * 100 : 0}%` }} /></div>
            <strong>Open list <Icon name="chevron" size={15} /></strong>
          </button>
          <button className="list-card new-list-card" onClick={onCreateList}>
            <div className="list-card-icon muted-icon"><Icon name="plus" /></div>
            <h2>Create a new list</h2><p>Start fresh for your next shopping trip</p>
            <strong>New list <Icon name="chevron" size={15} /></strong>
          </button>
        </section>
      )}

      {view === "History" && (
        <section className="panel">
          <div className="panel-title"><div><h2>Recent trips</h2><p>Your completed shopping lists are saved here</p></div></div>
          {history.map((entry) => (
            <div className="history-row" key={entry.id}>
              <div className="history-icon"><Icon name="check" size={17} /></div>
              <div><strong>{entry.name}</strong><span>{entry.date}</span></div>
              <span>{entry.items.length} items</span><strong>${entry.total.toFixed(2)}</strong>
              <button onClick={() => onRestore(entry)}>Restore <Icon name="chevron" size={14} /></button>
            </div>
          ))}
          {!history.length && <div className="empty-state"><div><Icon name="history" /></div><strong>No completed trips yet</strong><p>Complete your active list to add it here.</p></div>}
        </section>
      )}

      {view === "Categories" && (
        <section className="category-grid">
          {categoryCounts.map(({ name, count }) => (
            <article className="category-card" key={name}>
              <div className={categoryStyle[name]}><Icon name="tag" size={18} /></div>
              <h2>{name}</h2><p>{count} {count === 1 ? "item" : "items"} in your active list</p>
              <button onClick={onOpenList}>View items <Icon name="chevron" size={14} /></button>
            </article>
          ))}
        </section>
      )}

      {view === "Settings" && (
        <section className="panel settings-panel">
          <div className="settings-group"><div><h2>Shopping preferences</h2><p>Control how your lists behave.</p></div></div>
          <label className="setting-row"><div><strong>Prevent duplicate items</strong><span>Increase quantity when an item already exists</span></div><input type="checkbox" checked={preferences.preventDuplicates} onChange={(event) => onPreferencesChange({ ...preferences, preventDuplicates: event.target.checked })} /></label>
          <label className="setting-row"><div><strong>Show estimated prices</strong><span>Display item prices and list totals</span></div><input type="checkbox" checked={preferences.showPrices} onChange={(event) => onPreferencesChange({ ...preferences, showPrices: event.target.checked })} /></label>
          <label className="setting-row"><div><strong>Purchase reminders</strong><span>Remind me about unfinished shopping lists</span></div><input type="checkbox" checked={preferences.reminders} onChange={(event) => onPreferencesChange({ ...preferences, reminders: event.target.checked })} /></label>
          <div className="settings-group lower"><div><h2>Account</h2><p>Your personal profile information.</p></div></div>
          <div className="profile-setting"><div className="avatar">AM</div><div><strong>Alex Morgan</strong><span>alex@example.com</span></div><button onClick={() => window.alert("Profile editing will be enabled when Flask authentication is connected.")}>Edit profile</button></div>
        </section>
      )}
    </div>
  );
}

function LoginPage({
  email,
  password,
  error,
  rememberMe,
  onEmailChange,
  onPasswordChange,
  onRememberMeChange,
  onSubmit,
  onForgotPassword,
  onSocialLogin,
}: {
  email: string;
  password: string;
  error: string;
  rememberMe: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onRememberMeChange: (value: boolean) => void;
  onSubmit: (event: FormEvent) => void;
  onForgotPassword: () => void;
  onSocialLogin: (provider: string) => void;
}) {
  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-top">
          <div className="brand login-brand">
            <div className="brand-mark"><Icon name="bag" size={21} /></div>
            <span>Basketly</span>
          </div>
          <p className="login-subtitle">Plan smarter. Shop easier.</p>
        </div>

        <div className="login-header">
          <p className="eyebrow">Welcome back</p>
          <h1>Sign in to your account</h1>
        </div>

        <form className="login-form" onSubmit={onSubmit}>
          <label>
            Email address
            <input
              type="email"
              value={email}
              onChange={(event) => onEmailChange(event.target.value)}
              placeholder="alex@example.com"
              autoComplete="email"
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => onPasswordChange(event.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </label>

          <div className="login-form-row">
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => onRememberMeChange(event.target.checked)}
              />
              <span>Remember me</span>
            </label>
            <button type="button" className="text-link" onClick={onForgotPassword}>Forgot password?</button>
          </div>

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="primary-button login-button">
            <Icon name="check" size={16} />
            Login
          </button>
        </form>

        <div className="divider"><span>or continue with</span></div>

        <div className="social-grid">
          <button type="button" className="social-button" onClick={() => onSocialLogin("Google")}>
            <span className="social-mark google">G</span>
            Google
          </button>
          <button type="button" className="social-button" onClick={() => onSocialLogin("Apple")}>
            <span className="social-mark apple">A</span>
            Apple
          </button>
          <button type="button" className="social-button" onClick={() => onSocialLogin("Facebook")}>
            <span className="social-mark facebook">f</span>
            Facebook
          </button>
        </div>

        <div className="login-footer">
          <span>Need an account?</span>
          <button type="button" onClick={() => onSocialLogin("Create account")}>Create one</button>
        </div>
      </div>
    </div>
  );
}

function LogoutPage({ onLoginAgain }: { onLoginAgain: () => void }) {
  return (
    <div className="login-page logout-page">
      <div className="login-card logout-card">
        <div className="brand login-brand">
          <div className="brand-mark"><Icon name="bag" size={21} /></div>
          <span>Basketly</span>
        </div>

        <div className="logout-illustration" aria-hidden="true">
          <div className="logout-ring"><Icon name="bag" size={34} /></div>
        </div>

        <div className="login-header">
          <p className="eyebrow">Signed out</p>
          <h1>You’re all logged out</h1>
        </div>

        <p className="logout-message">Your Basketly session has ended. Sign in again to pick up where you left off and keep your shopping list organized.</p>

        <div className="logout-actions">
          <button type="button" className="primary-button login-button" onClick={onLoginAgain}>
            <Icon name="check" size={16} />
            Log in again
          </button>
          <button type="button" className="secondary-ghost-button" onClick={() => window.alert("You can still browse your saved local data when you sign back in.")}>
            Learn more
          </button>
        </div>
      </div>
    </div>
  );
}

function readSaved<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) as T : fallback;
  } catch {
    return fallback;
  }
}

function App() {
  const [items, setItems] = useState<ShoppingItem[]>(() => readSaved("basketly-items", initialItems));
  const [listName, setListName] = useState(() => readSaved("basketly-list-name", "Weekly essentials"));
  const [budget, setBudget] = useState(() => readSaved("basketly-budget", 60));
  const [history, setHistory] = useState<HistoryEntry[]>(() => readSaved("basketly-history", []));
  const [preferences, setPreferences] = useState<Preferences>(() => readSaved("basketly-preferences", {
    preventDuplicates: true,
    showPrices: true,
    reminders: false,
  }));
  const [activeView, setActiveView] = useState<View>("Overview");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"All" | "Pending" | "Purchased">("All");
  const [categoryFilter, setCategoryFilter] = useState<"All" | Category>("All");
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Category>("Produce");
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [loginEmail, setLoginEmail] = useState("alex@example.com");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  useEffect(() => {
    localStorage.setItem("basketly-items", JSON.stringify(items));
    localStorage.setItem("basketly-list-name", JSON.stringify(listName));
    localStorage.setItem("basketly-budget", JSON.stringify(budget));
    localStorage.setItem("basketly-history", JSON.stringify(history));
    localStorage.setItem("basketly-preferences", JSON.stringify(preferences));
  }, [items, listName, budget, history, preferences]);

  const filteredItems = useMemo(() => items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filter === "All" || (filter === "Purchased" ? item.purchased : !item.purchased);
    const matchesCategory = categoryFilter === "All" || item.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  }), [items, search, filter, categoryFilter]);

  const purchased = items.filter((item) => item.purchased).length;
  const total = items.reduce((sum, item) => sum + item.price, 0);
  const budgetDifference = budget - total;
  const userName = useMemo(() => {
    const value = loginEmail.trim();
    if (!value) return "Alex";
    const base = value.split("@")[0].replace(/[._-]/g, " ").trim();
    if (!base) return "Alex";
    return base.split(" ").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
  }, [loginEmail]);

  function handleLogin(event: FormEvent) {
    event.preventDefault();
    const email = loginEmail.trim();
    const password = loginPassword.trim();

    if (!email || !password) {
      setLoginError("Please enter both email and password.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setLoginError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setLoginError("Password must be at least 6 characters long.");
      return;
    }

    setLoginError("");
    setIsLoggingOut(false);
    setIsLoggedIn(true);
  }

  function handleForgotPassword() {
    const email = loginEmail.trim();
    if (!email) {
      setLoginError("Enter your email to receive a reset link.");
      return;
    }

    setLoginError("");
    window.alert(`Password reset link sent to ${email}.`);
  }

  function handleSocialLogin(provider: string) {
    const message = provider === "Create account"
      ? "Account creation is ready for the next auth integration."
      : `${provider} sign-in is ready for the next auth connection.`;
    window.alert(message);
  }

  function handleLogout() {
    setIsLoggingOut(true);
    setIsLoggedIn(false);
  }

  function handleLoginAgain() {
    setLoginError("");
    setLoginPassword("");
    setIsLoggingOut(false);
    setIsLoggedIn(false);
  }

  function togglePurchased(id: number) {
    setItems((current) => current.map((item) => item.id === id ? { ...item, purchased: !item.purchased } : item));
  }

  function updateQuantity(id: number, amount: number) {
    setItems((current) => current.map((item) => item.id === id ? { ...item, quantity: Math.max(1, item.quantity + amount) } : item));
  }

  function addItem(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    const duplicate = preferences.preventDuplicates
      ? items.find((item) => item.name.toLowerCase() === name.trim().toLowerCase())
      : undefined;
    if (duplicate) {
      setItems((current) => current.map((item) => item.id === duplicate.id ? { ...item, quantity: item.quantity + quantity } : item));
    } else {
      setItems((current) => [...current, {
        id: Date.now(), name: name.trim(), category, quantity, unit: "pcs",
        price: Number(price) || 0, purchased: false,
      }]);
    }
    setName("");
    setQuantity(1);
    setPrice("");
    setShowAdd(false);
  }

  function createNewList() {
    if (items.length && !window.confirm("Start a new list? Complete the current list first if you want it saved in history.")) return;
    const nextName = window.prompt("Enter a name for the new shopping list:", "New shopping list");
    if (!nextName?.trim()) return;
    setListName(nextName.trim());
    setItems([]);
    setSearch("");
    setFilter("All");
    setCategoryFilter("All");
    setActiveView("Overview");
  }

  function completeList() {
    if (!items.length) return;
    if (purchased !== items.length && !window.confirm("Some items are still pending. Complete this list anyway?")) return;
    const entry: HistoryEntry = {
      id: Date.now(),
      name: listName,
      date: new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date()),
      items,
      total,
    };
    setHistory((current) => [entry, ...current]);
    setItems([]);
    setListName("New shopping list");
    setActiveView("History");
  }

  function restoreList(entry: HistoryEntry) {
    if (items.length && !window.confirm("Replace your active list with this historical list?")) return;
    setItems(entry.items.map((item) => ({ ...item, purchased: false })));
    setListName(`${entry.name} copy`);
    setActiveView("Overview");
  }

  function editBudget() {
    const value = window.prompt("Set your shopping budget:", String(budget));
    if (value === null) return;
    const nextBudget = Number(value);
    if (Number.isFinite(nextBudget) && nextBudget >= 0) setBudget(nextBudget);
  }

  function exportCsv() {
    const rows = [
      ["Item", "Category", "Quantity", "Unit", "Price", "Status"],
      ...items.map((item) => [item.name, item.category, String(item.quantity), item.unit, item.price.toFixed(2), item.purchased ? "Purchased" : "Pending"]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${listName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  if (!isLoggedIn && isLoggingOut) {
    return <LogoutPage onLoginAgain={handleLoginAgain} />;
  }

  if (!isLoggedIn) {
    return (
      <LoginPage
        email={loginEmail}
        password={loginPassword}
        error={loginError}
        rememberMe={rememberMe}
        onEmailChange={setLoginEmail}
        onPasswordChange={setLoginPassword}
        onRememberMeChange={setRememberMe}
        onSubmit={handleLogin}
        onForgotPassword={handleForgotPassword}
        onSocialLogin={handleSocialLogin}
      />
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark"><Icon name="bag" size={21} /></div>
          <span>Basketly</span>
        </div>
        <nav className="nav">
          <p className="nav-label">Workspace</p>
          <button className={`nav-item ${activeView === "Overview" ? "active" : ""}`} onClick={() => setActiveView("Overview")}><Icon name="grid" /><span>Overview</span></button>
          <button className={`nav-item ${activeView === "My lists" ? "active" : ""}`} onClick={() => setActiveView("My lists")}><Icon name="list" /><span>My lists</span><span className="nav-count">1</span></button>
          <button className={`nav-item ${activeView === "History" ? "active" : ""}`} onClick={() => setActiveView("History")}><Icon name="history" /><span>History</span><span className="nav-count">{history.length}</span></button>
          <p className="nav-label nav-section">Manage</p>
          <button className={`nav-item ${activeView === "Categories" ? "active" : ""}`} onClick={() => setActiveView("Categories")}><Icon name="tag" /><span>Categories</span></button>
          <button className={`nav-item ${activeView === "Settings" ? "active" : ""}`} onClick={() => setActiveView("Settings")}><Icon name="settings" /><span>Settings</span></button>
        </nav>
        <div className="smart-card">
          <div className="smart-icon"><Icon name="spark" size={18} /></div>
          <strong>Shop smarter</strong>
          <p>Organize your weekly run and never miss an item.</p>
          <button onClick={() => setActiveView("My lists")}>View your lists <Icon name="chevron" size={15} /></button>
        </div>
        <div className="user-card">
          <div className="avatar">AM</div>
          <div><strong>Alex Morgan</strong><span>{loginEmail}</span></div>
          <button aria-label="Log out" onClick={handleLogout} className="logout-button"><Icon name="x" size={14} /></button>
        </div>
      </aside>

      <main>
        <header className="topbar">
          <div className="mobile-brand">
            <div className="brand-mark"><Icon name="bag" size={19} /></div>
            <span>Basketly</span>
          </div>
          <div className="search-box">
            <Icon name="search" size={19} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search your items..." />
            <kbd>⌘ K</kbd>
          </div>
          <div className="header-date"><span>{new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(new Date())}</span><strong>{new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short" }).format(new Date())}</strong></div>
          <button className="avatar small" onClick={() => setActiveView("Settings")}>AM</button>
        </header>

        {activeView === "Overview" ? <div className="content">
          <section className="page-heading">
            <div>
              <p className="eyebrow">My shopping</p>
              <h1>Good morning, {userName}</h1>
              <p>Here’s what you need to pick up on your next run.</p>
            </div>
            <button className="primary-button" onClick={() => setShowAdd(true)}><Icon name="plus" size={18} /> Add item</button>
          </section>

          <section className="stats-grid">
            <article className="stat-card featured">
              <div className="stat-top"><span>This week</span><span className="trend">On track</span></div>
              <div className="stat-value">{items.length}<small> items</small></div>
              <div className="progress"><span style={{ width: `${items.length ? (purchased / items.length) * 100 : 0}%` }} /></div>
              <p><strong>{purchased} purchased</strong><span>{items.length - purchased} remaining</span></p>
            </article>
            <article className="stat-card">
              <div className="stat-icon green"><Icon name="check" /></div>
              <p>Purchased</p><strong className="large">{purchased}</strong>
              <span className="muted">of {items.length} items</span>
            </article>
            <article className="stat-card">
              <div className="stat-icon amber"><Icon name="tag" /></div>
              <p>Est. total</p><strong className="large">{preferences.showPrices ? `$${total.toFixed(2)}` : "Hidden"}</strong>
              <span className={budgetDifference >= 0 ? "positive" : "negative"}>{preferences.showPrices ? `${budgetDifference >= 0 ? `$${budgetDifference.toFixed(2)} under` : `$${Math.abs(budgetDifference).toFixed(2)} over`} $${budget.toFixed(0)} budget` : "Enable prices in Settings"}</span>
              <button className="text-action" onClick={editBudget}>Edit budget</button>
            </article>
          </section>

          <section className="list-section">
            <div className="list-heading">
              <div><h2>{listName}</h2><p>{items.length} items · Changes saved automatically</p></div>
              <div className="heading-actions">
                <select aria-label="Filter by category" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value as "All" | Category)}>
                  <option value="All">All categories</option>
                  {categories.map((value) => <option key={value}>{value}</option>)}
                </select>
                <button className="secondary-button" onClick={exportCsv} disabled={!items.length}>Export CSV</button>
                <button className="complete-button" onClick={completeList} disabled={!items.length}><Icon name="check" size={15} /> Complete</button>
              </div>
            </div>
            <div className="tabs">
              {(["All", "Pending", "Purchased"] as const).map((value) => (
                <button key={value} className={filter === value ? "active" : ""} onClick={() => setFilter(value)}>
                  {value}<span>{value === "All" ? items.length : value === "Pending" ? items.length - purchased : purchased}</span>
                </button>
              ))}
            </div>

            <div className="items">
              {filteredItems.map((item) => (
                <article className={`item-row ${item.purchased ? "is-purchased" : ""}`} key={item.id}>
                  <button className="check-button" onClick={() => togglePurchased(item.id)} aria-label={`Mark ${item.name} as ${item.purchased ? "pending" : "purchased"}`}>
                    {item.purchased && <Icon name="check" size={15} />}
                  </button>
                  <div className="item-main">
                    <strong>{item.name}</strong>
                    <span className={categoryStyle[item.category]}>{item.category}</span>
                  </div>
                  <div className="quantity">
                    <button onClick={() => updateQuantity(item.id, -1)} aria-label="Decrease quantity">−</button>
                    <span>{item.quantity} {item.unit}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} aria-label="Increase quantity">+</button>
                  </div>
                  <strong className="price">{preferences.showPrices ? `$${item.price.toFixed(2)}` : "—"}</strong>
                  <button className="delete-button" onClick={() => setItems((current) => current.filter(({ id }) => id !== item.id))} aria-label={`Delete ${item.name}`}><Icon name="trash" size={18} /></button>
                </article>
              ))}
              {!filteredItems.length && (
                <div className="empty-state">
                  <div><Icon name="search" /></div>
                  <strong>No items found</strong>
                  <p>Try changing your search or filters.</p>
                </div>
              )}
            </div>
          </section>
        </div> : <SecondaryView
          view={activeView}
          items={items}
          listName={listName}
          history={history}
          preferences={preferences}
          onPreferencesChange={setPreferences}
          onOpenList={() => setActiveView("Overview")}
          onCreateList={createNewList}
          onRestore={restoreList}
        />}
      </main>

      {showAdd && (
        <div className="modal-backdrop" onMouseDown={() => setShowAdd(false)}>
          <form className="modal" onSubmit={addItem} onMouseDown={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div><p className="eyebrow">{listName}</p><h2>Add a new item</h2></div>
              <button type="button" className="icon-button" onClick={() => setShowAdd(false)} aria-label="Close"><Icon name="x" /></button>
            </div>
            <label>Item name<input autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Bananas" /></label>
            <div className="form-grid">
              <label>Category<select value={category} onChange={(event) => setCategory(event.target.value as Category)}>{categories.map((value) => <option key={value}>{value}</option>)}</select></label>
              <label>Quantity<input type="number" min="1" value={quantity} onChange={(event) => setQuantity(Math.max(1, Number(event.target.value)))} /></label>
            </div>
            <label>Estimated price<input type="number" min="0" step="0.01" value={price} onChange={(event) => setPrice(event.target.value)} placeholder="0.00" /></label>
            <p className="form-note">If this item already exists, its quantity will be updated.</p>
            <div className="modal-actions"><button type="button" onClick={() => setShowAdd(false)}>Cancel</button><button className="primary-button" type="submit"><Icon name="plus" size={18} /> Add to list</button></div>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;
