import { useState } from 'react';

const EMPTY = { name: '', sku: '', price: '', quantity: '' };

function validate(values) {
  const errors = {};
  if (!values.name || values.name.trim().length === 0) errors.name = 'Name is required';
  else if (values.name.trim().length > 200) errors.name = 'Name must be 200 characters or fewer';

  if (!values.sku || values.sku.trim().length === 0) errors.sku = 'SKU is required';
  else if (values.sku.trim().length > 100) errors.sku = 'SKU must be 100 characters or fewer';

  const price = parseFloat(values.price);
  if (values.price === '' || isNaN(price)) errors.price = 'Price is required';
  else if (price < 0.01) errors.price = 'Price must be at least 0.01';

  const qty = parseInt(values.quantity, 10);
  if (values.quantity === '' || isNaN(qty)) errors.quantity = 'Quantity is required';
  else if (qty < 0) errors.quantity = 'Quantity must be 0 or more';

  return errors;
}

export default function ProductForm({ initialValues, onSubmit, onCancel, submitting }) {
  const [values, setValues] = useState(
    initialValues
      ? {
          name: initialValues.name ?? '',
          sku: initialValues.sku ?? '',
          price: initialValues.price != null ? String(initialValues.price) : '',
          quantity: initialValues.quantity != null ? String(initialValues.quantity) : '',
        }
      : EMPTY
  );
  const [errors, setErrors] = useState({});

  function handleChange(e) {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: undefined }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate(values);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onSubmit({
      name: values.name.trim(),
      sku: values.sku.trim(),
      price: parseFloat(values.price),
      quantity: parseInt(values.quantity, 10),
    });
  }

  const isEdit = Boolean(initialValues);

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label={isEdit ? 'Edit product' : 'Add product'}>
      <div className="modal">
        <h2 className="modal-title">{isEdit ? 'Edit Product' : 'Add Product'}</h2>
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="pf-name">Name</label>
            <input
              id="pf-name"
              name="name"
              className={`form-input${errors.name ? ' error' : ''}`}
              value={values.name}
              onChange={handleChange}
              maxLength={200}
              autoFocus
            />
            {errors.name && <p className="field-error">{errors.name}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="pf-sku">SKU</label>
            <input
              id="pf-sku"
              name="sku"
              className={`form-input${errors.sku ? ' error' : ''}`}
              value={values.sku}
              onChange={handleChange}
              maxLength={100}
            />
            {errors.sku && <p className="field-error">{errors.sku}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="pf-price">Price ($)</label>
            <input
              id="pf-price"
              name="price"
              type="number"
              step="0.01"
              min="0.01"
              className={`form-input${errors.price ? ' error' : ''}`}
              value={values.price}
              onChange={handleChange}
            />
            {errors.price && <p className="field-error">{errors.price}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="pf-quantity">Quantity</label>
            <input
              id="pf-quantity"
              name="quantity"
              type="number"
              step="1"
              min="0"
              className={`form-input${errors.quantity ? ' error' : ''}`}
              value={values.quantity}
              onChange={handleChange}
            />
            {errors.quantity && <p className="field-error">{errors.quantity}</p>}
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
