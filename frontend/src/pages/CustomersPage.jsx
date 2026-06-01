import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '../api/client';
import CustomerForm from '../components/CustomerForm';
import ErrorMessage from '../components/ErrorMessage';
import LoadingSpinner from '../components/LoadingSpinner';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadCustomers = useCallback(() => {
    setLoading(true);
    setError(null);
    apiFetch('/customers')
      .then((data) => {
        setCustomers(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  async function handleSubmit(values) {
    setSubmitting(true);
    setError(null);
    try {
      await apiFetch('/customers', {
        method: 'POST',
        body: JSON.stringify(values),
      });
      setShowForm(false);
      loadCustomers();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(customer) {
    if (
      !window.confirm(
        `Delete customer "${customer.full_name}"? This will fail if they have orders.`
      )
    )
      return;
    setError(null);
    try {
      await apiFetch(`/customers/${customer.id}`, { method: 'DELETE' });
      setCustomers((prev) => prev.filter((c) => c.id !== customer.id));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Customers</h1>
        <button type="button" className="btn btn-primary" onClick={() => setShowForm(true)}>
          + Add Customer
        </button>
      </div>

      <ErrorMessage message={error} onDismiss={() => setError(null)} />

      {loading ? (
        <LoadingSpinner />
      ) : customers.length === 0 ? (
        <p className="empty-state">No customers yet. Add one to get started.</p>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id}>
                  <td>{c.full_name}</td>
                  <td>{c.email}</td>
                  <td>{c.phone}</td>
                  <td>
                    <div className="actions">
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(c)}
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
        <CustomerForm
          onSubmit={handleSubmit}
          onCancel={() => setShowForm(false)}
          submitting={submitting}
        />
      )}
    </div>
  );
}
