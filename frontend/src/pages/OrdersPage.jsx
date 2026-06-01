import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '../api/client';
import ErrorMessage from '../components/ErrorMessage';
import LoadingSpinner from '../components/LoadingSpinner';
import OrderDetail from '../components/OrderDetail';
import OrderForm from '../components/OrderForm';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [detailOrder, setDetailOrder] = useState(null); // full order with items
  const [detailLoading, setDetailLoading] = useState(false);

  // Build lookup maps
  const customersMap = Object.fromEntries(customers.map((c) => [c.id, c]));
  const productsMap = Object.fromEntries(products.map((p) => [p.id, p]));

  const loadAll = useCallback(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      apiFetch('/orders'),
      apiFetch('/customers'),
      apiFetch('/products'),
    ])
      .then(([ordersData, customersData, productsData]) => {
        setOrders(ordersData);
        setCustomers(customersData);
        setProducts(productsData);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  async function handleCreateOrder(values) {
    setSubmitting(true);
    setError(null);
    try {
      await apiFetch('/orders', {
        method: 'POST',
        body: JSON.stringify(values),
      });
      setShowForm(false);
      loadAll();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleViewOrder(order) {
    setDetailLoading(true);
    setError(null);
    try {
      const full = await apiFetch(`/orders/${order.id}`);
      setDetailOrder(full);
    } catch (err) {
      setError(err.message);
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleDeleteOrder(order) {
    if (!window.confirm(`Delete order #${order.id}? This cannot be undone.`)) return;
    setError(null);
    try {
      await apiFetch(`/orders/${order.id}`, { method: 'DELETE' });
      setOrders((prev) => prev.filter((o) => o.id !== order.id));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Orders</h1>
        <button type="button" className="btn btn-primary" onClick={() => setShowForm(true)}>
          + Create Order
        </button>
      </div>

      <ErrorMessage message={error} onDismiss={() => setError(null)} />

      {loading || detailLoading ? (
        <LoadingSpinner />
      ) : orders.length === 0 ? (
        <p className="empty-state">No orders yet. Create one to get started.</p>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>#{o.id}</td>
                  <td>{customersMap[o.customer_id]?.full_name ?? `ID ${o.customer_id}`}</td>
                  <td>${Number(o.total_amount).toFixed(2)}</td>
                  <td>{new Date(o.created_at).toLocaleString()}</td>
                  <td>
                    <div className="actions">
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleViewOrder(o)}
                      >
                        View
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteOrder(o)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <OrderForm
          customers={customers}
          products={products}
          onSubmit={handleCreateOrder}
          onCancel={() => setShowForm(false)}
          submitting={submitting}
        />
      )}

      {detailOrder && (
        <OrderDetail
          order={detailOrder}
          productsMap={productsMap}
          customerName={customersMap[detailOrder.customer_id]?.full_name}
          onClose={() => setDetailOrder(null)}
        />
      )}
    </div>
  );
}
