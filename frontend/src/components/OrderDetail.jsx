export default function OrderDetail({ order, productsMap, customerName, onClose }) {
  const total = Number(order.total_amount).toFixed(2);
  const createdAt = new Date(order.created_at).toLocaleString();

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Order details">
      <div className="modal" style={{ maxWidth: 600 }}>
        <div className="order-detail-header">
          <h2 className="modal-title">Order #{order.id}</h2>
          <div className="order-detail-meta">
            <span>
              <strong>Customer:</strong> {customerName || `ID ${order.customer_id}`}
            </span>
            <span>
              <strong>Total:</strong> ${total}
            </span>
            <span>
              <strong>Date:</strong> {createdAt}
            </span>
          </div>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Qty</th>
                <th className="text-right">Unit Price</th>
                <th className="text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items && order.items.length > 0 ? (
                order.items.map((item) => {
                  const productName =
                    productsMap?.[item.product_id]?.name ?? `Product #${item.product_id}`;
                  const unitPrice = Number(item.unit_price).toFixed(2);
                  const subtotal = (Number(item.unit_price) * item.quantity).toFixed(2);
                  return (
                    <tr key={item.id}>
                      <td>{productName}</td>
                      <td>{item.quantity}</td>
                      <td className="text-right">${unitPrice}</td>
                      <td className="text-right">${subtotal}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="empty-state">
                    No items
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="form-actions" style={{ marginTop: '1rem' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
