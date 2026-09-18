import "./OwnerOrderDetails.css";

const statusLabels = {
  placed: "Order Placed",
  confirmed: "Order Confirmed",
  preparing: "Preparing Order",
  shipped: "Shipped",
  "out-for-delivery": "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Order Cancelled",
};

export default function OwnerOrderDetails({ order, onBack }) {
  if (!order) {
    return (
      <section className="owner-order-details-page">
        <div className="owner-order-details-empty">
          <div className="owner-details-icon">📦</div>
          <h3>Order Not Found</h3>
          <p>The selected order could not be found.</p>
          <button
            type="button"
            className="owner-back-btn"
            onClick={onBack}
          >
            ← Back to Dashboard
          </button>
        </div>
      </section>
    );
  }

  const totalItems =
    order.items?.reduce(
      (total, item) => total + Number(item.quantity || 0),
      0
    ) || 0;

  const paymentMethod =
    order.paymentMethod === "upi"
      ? "UPI"
      : order.paymentMethod === "card"
        ? "Debit / Credit Card"
        : "Cash on Delivery";

  const orderDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "Not available";

  const orderTime = order.createdAt
    ? new Date(order.createdAt).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <section className="owner-order-details-page">
      <div className="owner-order-details-top">
        <button
          type="button"
          className="owner-back-btn"
          onClick={onBack}
        >
          ← Back to Dashboard
        </button>

        <div className="owner-details-title">
          <span>SMARTMED ADMIN</span>
          <h2>Order Details</h2>
          <p>View complete information about this customer order.</p>
        </div>
      </div>

      <div className="owner-details-card">
        <div className="owner-details-header">
          <div>
            <span>ORDER ID</span>
            <h3>{order.orderId}</h3>
            <p>
              {orderDate}
              {orderTime ? ` • ${orderTime}` : ""}
            </p>
          </div>

          <div className="owner-details-status">
            <span>Current Status</span>
            <strong className={order.status === "cancelled" ? "cancelled" : ""}>
              {statusLabels[order.status] || "Order Placed"}
            </strong>
          </div>
        </div>

        <div className="owner-details-section">
          <h4>👤 Customer Information</h4>

          <div className="owner-details-grid">
            <div>
              <span>Customer Name</span>
              <strong>{order.customer?.name || "Not available"}</strong>
            </div>

            <div>
              <span>Mobile Number</span>
              <strong>{order.customer?.mobile || "Not available"}</strong>
            </div>

            <div>
              <span>Email Address</span>
              <strong>{order.customer?.email || "Not available"}</strong>
            </div>

            <div>
              <span>Payment Method</span>
              <strong>{paymentMethod}</strong>
            </div>
          </div>
        </div>

        <div className="owner-details-section">
          <h4>📍 Delivery Address</h4>

          <div className="owner-delivery-address">
            {order.customer?.address || "Address not available"}
          </div>
        </div>

        <div className="owner-details-section">
          <div className="owner-products-heading">
            <h4>💊 Ordered Products</h4>
            <span>
              {totalItems} {totalItems === 1 ? "Item" : "Items"}
            </span>
          </div>

          <div className="owner-details-products">
            {order.items?.map((item, index) => (
              <div
                className="owner-details-product"
                key={`${item.id}-${index}`}
              >
                <div>
                  <strong>{item.name}</strong>

                  <span>
                    Quantity: {item.quantity}
                  </span>

                  <span>
                    Price: ₹{Number(item.price || 0).toFixed(2)} each
                  </span>
                </div>

                <strong>
                  ₹
                  {(
                    Number(item.price || 0) *
                    Number(item.quantity || 0)
                  ).toFixed(2)}
                </strong>
              </div>
            ))}
          </div>
        </div>

        <div className="owner-details-summary">
          <div>
            <span>Subtotal</span>
            <strong>₹{Number(order.subtotal || 0).toFixed(2)}</strong>
          </div>

          <div>
            <span>Delivery Charge</span>
            <strong>
              ₹{Number(order.deliveryCharge || 0).toFixed(2)}
            </strong>
          </div>

          <div className="owner-grand-total">
            <span>Total Amount</span>
            <strong>₹{Number(order.total || 0).toFixed(2)}</strong>
          </div>
        </div>

        <div className="owner-invoice-footer">
          <div>
            <strong>SmartMed</strong>
            <span>Medicine & Healthcare Store</span>
          </div>

          <button
            type="button"
            className="owner-print-btn"
            onClick={() => window.print()}
          >
            🖨️ Print Invoice
          </button>
        </div>
      </div>
    </section>
  );
}

 