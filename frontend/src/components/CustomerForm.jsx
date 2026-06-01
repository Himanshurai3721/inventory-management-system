import { useState } from 'react';

const EMPTY = { full_name: '', email: '', phone: '' };

function validate(values) {
  const errors = {};

  if (!values.full_name || values.full_name.trim().length === 0)
    errors.full_name = 'Full name is required';
  else if (values.full_name.trim().length > 100)
    errors.full_name = 'Full name must be 100 characters or fewer';

  if (!values.email || values.email.trim().length === 0)
    errors.email = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim()))
    errors.email = 'Enter a valid email address';

  if (!values.phone || values.phone.trim().length === 0)
    errors.phone = 'Phone is required';
  else if (!/^\d{7,15}$/.test(values.phone.trim()))
    errors.phone = 'Phone must be 7–15 digits';

  return errors;
}

export default function CustomerForm({ onSubmit, onCancel, submitting }) {
  const [values, setValues] = useState(EMPTY);
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
      full_name: values.full_name.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
    });
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Add customer">
      <div className="modal">
        <h2 className="modal-title">Add Customer</h2>
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="cf-name">Full Name</label>
            <input
              id="cf-name"
              name="full_name"
              className={`form-input${errors.full_name ? ' error' : ''}`}
              value={values.full_name}
              onChange={handleChange}
              maxLength={100}
              autoFocus
            />
            {errors.full_name && <p className="field-error">{errors.full_name}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="cf-email">Email</label>
            <input
              id="cf-email"
              name="email"
              type="email"
              className={`form-input${errors.email ? ' error' : ''}`}
              value={values.email}
              onChange={handleChange}
              maxLength={254}
            />
            {errors.email && <p className="field-error">{errors.email}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="cf-phone">Phone (digits only)</label>
            <input
              id="cf-phone"
              name="phone"
              type="tel"
              className={`form-input${errors.phone ? ' error' : ''}`}
              value={values.phone}
              onChange={handleChange}
              maxLength={15}
              placeholder="e.g. 1234567890"
            />
            {errors.phone && <p className="field-error">{errors.phone}</p>}
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving…' : 'Add Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
