import { useLocation, useNavigate } from "react-router-dom";

function OrderSuccess() {
  const navigate = useNavigate();
  const location = useLocation();

  const order = location.state?.order;

  if (!order) {
    return (
      <section className="container py-5 text-center">
        <h3>Order information not available</h3>

        <button
          className="btn btn-primary mt-3"
          onClick={() => navigate("/")}
        >
          Continue Shopping
        </button>
      </section>
    );
  }

 const paymentText =
  order.paymentMethod === "Cash on Delivery"
    ? "Cash on Delivery"
    : "Online Payment";

  return (
    <section className="order-success-page">
      <div className="order-success-card">

        <div className="order-success-animation">
  <div className="success-circle">
    <span>✓</span>
  </div>

  <div className="success-ring ring-one"></div>
  <div className="success-ring ring-two"></div>
</div>

        <div className="order-success-brand">
  <span className="brand-dot"></span>
  SMARTMED
</div>

<div className="order-success-status">
  ✓ Order Confirmed
</div>

        <h1>Order Placed Successfully!</h1>

        <p className="order-success-message">
  Thank you, <strong>{order.customer?.name || "Customer"}</strong>.
  Your medicine order has been placed successfully.
</p>

<p className="order-success-submessage">
  We've received your order and will keep you updated on its progress.
</p>

       <div className="order-success-details">

  <div className="success-detail-box">
    <span>Order ID</span>
    <strong>{order.orderId}</strong>
  </div>

  <div className="success-detail-box">
    <span>Payment</span>
    <strong>{paymentText}</strong>
  </div>

  <div className="success-detail-box">
    <span>Total Amount</span>
    <strong>₹{order.total}</strong>
  </div>

</div>

<div className="order-progress-preview">

  <div className="progress-step active">
    <span>✓</span>
    <small>Placed</small>
  </div>

  <div className="progress-line active-line"></div>

  <div className="progress-step">
    <span>2</span>
    <small>Preparing</small>
  </div>

  <div className="progress-line"></div>

  <div className="progress-step">
    <span>3</span>
    <small>Delivered</small>
  </div>

</div>

        <div className="order-success-actions">

          <button
            className="btn btn-primary"
            onClick={() =>
              navigate(`/track-order/${order.orderId}`)
            }
          >
            📦 Track Order
          </button>

          <button
            className="btn btn-outline-primary"
            onClick={() => navigate("/orders")}
          >
            📋 Your Orders
          </button>

          <button
            className="btn btn-light"
            onClick={() => navigate("/")}
          >
            🛍 Continue Shopping
          </button>

        </div>

      </div>
    </section>
  );
}

export default OrderSuccess;