import { useState } from 'react';

export default function OrderForm({ customers, products, onSubmit, onCancel, submitting }) {
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState([{ product_id: '', quantity: 1 }]);
  const [errors, setErrors] = useState({});

  function addItem() {
    setItems((prev) => [...prev, { product_id: '', quantity: 1 }]);
  }

  function removeItem(index) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function updateItem(index, field, value) {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
    if (errors[`item_${index}_${field}`]) {
      setErrors((e) => ({ ...e, [`item_${index}_${field}`]: undefined }));
    }
  }

  function validate() {
    const errs = {};
    if (!customerId) errs.customer = 'Please select a customer';
    if (items.length === 0) errs.items = 'At least one item is required';
    items.forEach((item, i) => {
      if (!item.product_id) errs[`item_${i}_product_id`] = 'Select a product';
      const qty = parseInt(item.quantity, 10);
      if (isNaN(qty) || qty < 1) errs[`item_${i}_quantity`] = 'Qty ≥ 1';
    });
    return errs;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onSubmit({
      customer_id: parseInt(customerId, 10),
      items: items.map((item) => ({
        product_id: parseInt(item.product_id, 10),
        quantity: parseInt(item.quantity, 10),
      })),
    });
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Create order">
      <div className="modal" style={{ maxWidth: 560 }}>
        <h2 className="modal-title">Create Order</h2>
        <form onSubmit={handleSubmit} noValidate>
          {/* Customer */}
          <div className="form-group">
            <label className="form-label" htmlFor="of-customer">Customer</label>
            <select
              id="of-customer"
              className={`form-input${errors.customer ? ' error' : ''}`}
              value={customerId}
              onChange={(e) => {
                setCustomerId(e.target.value);
                if (errors.customer) setErrors((er) => ({ ...er, customer: undefined }));
              }}
            >
              <option value="">— Select customer —</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name} ({c.email})
                </option>
              ))}
            </select>
            {errors.customer && <p className="field-error">{errors.customer}</p>}
          </div>

          {/* Items */}
          <div className="form-group">
            <label className="form-label">Order Items</label>
            {errors.items && <p className="field-error">{errors.items}</p>}
            <div className="order-items-list">
              {items.map((item, i) => (
                <div key={i} className="order-item-row">
                  <div className="form-group" style={{ flex: 2 }}>
                    <select
                      className={`form-input${errors[`item_${i}_product_id`] ? ' error' : ''}`}
                      value={item.product_id}
                      onChange={(e) => updateItem(i, 'product_id', e.target.value)}
                      aria-label={`Product for item ${i + 1}`}
                    >
                      <option value="">— Product —</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (stock: {p.quantity})
                        </option>
                      ))}
                    </select>
                    {errors[`item_${i}_product_id`] && (
                      <p className="field-error">{errors[`item_${i}_product_id`]}</p>
                    )}
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <input
                      type="number"
                      min="1"
                      className={`form-input${errors[`item_${i}_quantity`] ? ' error' : ''}`}
                      value={item.quantity}
                      onChange={(e) => updateItem(i, 'quantity', e.target.value)}
                      aria-label={`Quantity for item ${i + 1}`}
                    />
                    {errors[`item_${i}_quantity`] && (
                      <p className="field-error">{errors[`item_${i}_quantity`]}</p>
                    )}
                  </div>
                  {items.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => removeItem(i)}
                      aria-label={`Remove item ${i + 1}`}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button type="button" className="btn btn-secondary btn-sm" onClick={addItem}>
              + Add Item
            </button>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={submitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Creating…' : 'Create Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
