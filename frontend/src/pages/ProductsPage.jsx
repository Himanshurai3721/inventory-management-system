import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '../api/client';
import ErrorMessage from '../components/ErrorMessage';
import LoadingSpinner from '../components/LoadingSpinner';
import ProductForm from '../components/ProductForm';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null); // product object when editing
  const [submitting, setSubmitting] = useState(false);

  const loadProducts = useCallback(() => {
    setLoading(true);
    setError(null);
    apiFetch('/products')
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  function openAdd() {
    setEditTarget(null);
    setShowForm(true);
  }

  function openEdit(product) {
    setEditTarget(product);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditTarget(null);
  }

  async function handleSubmit(values) {
    setSubmitting(true);
    setError(null);
    try {
      if (editTarget) {
        await apiFetch(`/products/${editTarget.id}`, {
          method: 'PUT',
          body: JSON.stringify(values),
        });
      } else {
        await apiFetch('/products', {
          method: 'POST',
          body: JSON.stringify(values),
        });
      }
      closeForm();
      loadProducts();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(product) {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    setError(null);
    try {
      await apiFetch(`/products/${product.id}`, { method: 'DELETE' });
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Products</h1>
        <button type="button" className="btn btn-primary" onClick={openAdd}>
          + Add Product
        </button>
      </div>

      <ErrorMessage message={error} onDismiss={() => setError(null)} />

      {loading ? (
        <LoadingSpinner />
      ) : products.length === 0 ? (
        <p className="empty-state">No products yet. Add one to get started.</p>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>SKU</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.sku}</td>
                  <td>${Number(p.price).toFixed(2)}</td>
                  <td>{p.quantity}</td>
                  <td>
                    <div className="actions">
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => openEdit(p)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(p)}
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
        <ProductForm
          initialValues={editTarget}
          onSubmit={handleSubmit}
          onCancel={closeForm}
          submitting={submitting}
        />
      )}
    </div>
  );
}
