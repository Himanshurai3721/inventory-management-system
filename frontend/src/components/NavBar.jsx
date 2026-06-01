export default function NavBar({ currentPage, onNavigate }) {
  const links = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'products', label: 'Products' },
    { id: 'customers', label: 'Customers' },
    { id: 'orders', label: 'Orders' },
  ];

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="navbar-brand">Inventory Manager</div>
      <ul className="navbar-links">
        {links.map((link) => (
          <li key={link.id}>
            <button
              type="button"
              className={`nav-link${currentPage === link.id ? ' active' : ''}`}
              onClick={() => onNavigate(link.id)}
              aria-current={currentPage === link.id ? 'page' : undefined}
            >
              {link.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
