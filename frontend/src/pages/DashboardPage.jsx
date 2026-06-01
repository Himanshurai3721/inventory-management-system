import { useEffect, useState } from 'react';
import { apiFetch } from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    apiFetch('/dashboard')
      .then((d) => {
        if (!cancelled) {
          setData(d);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const cards = [
    { label: 'Total Products', value: data?.total_products ?? '—' },
    { label: 'Total Customers', value: data?.total_customers ?? '—' },
    { label: 'Total Orders', value: data?.total_orders ?? '—' },
    { label: 'Low Stock Products', value: data?.low_stock_products?.length ?? '—' },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
      </div>

      <ErrorMessage message={error} onDismiss={() => setError(null)} />

      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="cards-grid">
            {cards.map((card) => (
              <div key={card.label} className="card">
                <div className="card-label">{card.label}</div>
                <div className="card-value">{card.value}</div>
              </div>
            ))}
          </div>

          {data?.low_stock_products?.length > 0 && (
            <div className="low-stock-section">
              <h3>Low Stock Items</h3>
              <ul className="low-stock-list">
                {data.low_stock_products.slice(0, 10).map((p) => (
                  <li key={p.id} className="low-stock-item">
                    {p.name} — {p.quantity} left (SKU: {p.sku})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
