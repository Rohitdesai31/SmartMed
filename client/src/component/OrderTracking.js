import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
const orderStatuses = [
  {
    key: "placed",
    title: "Order Placed",
    description: "Your order has been successfully placed.",
    icon: "✓",
  },
  {
    key: "confirmed",
    title: "Order Confirmed",
    description: "The pharmacy has confirmed your order.",
    icon: "✓",
  },
  {
    key: "preparing",
    title: "Preparing Order",
    description: "Your medicines are being packed.",
    icon: "📦",
  },
  {
    key: "shipped",
    title: "Shipped",
    description: "Your order has been handed over for delivery.",
    icon: "🚚",
  },
  {
    key: "out-for-delivery",
    title: "Out for Delivery",
    description: "Your order is on the way to you.",
    icon: "🛵",
  },
  {
    key: "delivered",
    title: "Delivered",
    description: "Your order has been delivered successfully.",
    icon: "✓",
  },
];
function OrderTracking({ orders, onTrackingUpdate }) {
  const { orderId } = useParams();

  const [backendOrder, setBackendOrder] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [ordersLoading, setOrdersLoading] = useState(true);

  const order = backendOrder;

useEffect(() => {
  let isMounted = true;

  const fetchOrderTracking = async () => {
    try {
      const token = localStorage.getItem(
        "smartmedAuthToken",
      );

      if (!token) {
        if (isMounted) {
          setBackendOrder(null);
        }
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/orders/${orderId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        console.error(
          "Order tracking fetch error:",
          data.message,
        );
        return;
      }

      if (!isMounted) {
        return;
      }

      console.log(
        "Backend Order Tracking:",
        data,
      );

      setBackendOrder(data.order);

      setCurrentStep(
        data.order?.trackingStep ?? 0,
      );
    } catch (error) {
      if (isMounted) {
        console.error(
          "Order tracking connection error:",
          error,
        );
      }
    } finally {
      if (isMounted) {
        setOrdersLoading(false);
      }
    }
  };

  // Fetch immediately when page opens
  fetchOrderTracking();

  // Check backend for status changes every 5 seconds
  const trackingTimer = setInterval(() => {
    fetchOrderTracking();
  }, 5000);

  return () => {
    isMounted = false;
    clearInterval(trackingTimer);
  };
}, [orderId]);

  const isCancelled = order?.status === "cancelled";
  if (!order) {
    return (
      <section className="container order-tracking-empty">
        <div className="order-tracking-empty-card">
          <div className="order-tracking-empty-icon">📦</div>

          <h3>No Order Found</h3>

          <p>Place an order first to view your order tracking information.</p>
        </div>
      </section>
    );
  }

  if (order.status === "cancelled") {
    return (
      <section className="container order-tracking-section">
        <div className="order-tracking-header">
          <div>
            <span className="order-tracking-label">ORDER STATUS</span>

            <h2>Order Cancelled</h2>

            <p>This order has been cancelled successfully.</p>
          </div>

          <div className="order-tracking-id-box">
            <span>Order ID</span>
            <strong>{order.orderId}</strong>
          </div>
        </div>

        <div className="order-cancelled-card">
          <div className="order-cancelled-icon">✕</div>

          <h3>Order Cancelled</h3>

          <p>Your order was cancelled successfully.</p>

          <button
            className="btn btn-primary"
            onClick={() => (window.location.href = "/")}
          >
            Continue Shopping
          </button>
        </div>
      </section>
    );
  }

  const currentStatus = orderStatuses[currentStep];

  return (
    <section className="container order-tracking-section">
      {/* Header */}
      <div className="order-tracking-header">
        <div>
          <span className="order-tracking-label">ORDER TRACKING</span>

          <h2>Track Your Order</h2>

          <p>Follow your medicine delivery from confirmation to doorstep.</p>
        </div>

        <div className="order-tracking-id-box">
          <span>Order ID</span>
          <strong>{order.orderId}</strong>
        </div>
      </div>

      {/* Current Status */}
      <div className="order-current-status">
        <div className="order-current-icon">{currentStatus.icon}</div>

        <div>
          <span>Current Status</span>

          <h4>{currentStatus.title}</h4>

          <p>{currentStatus.description}</p>
        </div>
      </div>

      <div className="row g-4">
        {/* Tracking Timeline */}
        <div className="col-lg-7">
          <div className="tracking-card">
            <div className="tracking-card-header">
              <div>
                <h4>Delivery Status</h4>
                <p>Your order progress</p>
              </div>

              <span className="tracking-live-badge">● LIVE</span>
            </div>

            <div className="tracking-timeline">
              {orderStatuses.map((status, index) => {
                const completed = index < currentStep;
                const active = index === currentStep;

                return (
                  <div
                    className={`tracking-step ${
                      completed ? "completed" : ""
                    } ${active ? "active" : ""}`}
                    key={status.key}
                  >
                    <div className="tracking-step-left">
                      <div className="tracking-step-icon">
                        {completed ? "✓" : active ? status.icon : index + 1}
                      </div>

                      {index !== orderStatuses.length - 1 && (
                        <div className="tracking-step-line"></div>
                      )}
                    </div>

                    <div className="tracking-step-content">
                      <h5>{status.title}</h5>

                      <p>{status.description}</p>

                      {active && (
                        <span className="tracking-active-text">
                          Current status
                        </span>
                      )}

                      {completed && (
                        <span className="tracking-completed-text">
                          Completed
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="col-lg-5">
          <div className="tracking-card order-details-card">
            <div className="tracking-card-header">
              <div>
                <h4>Order Details</h4>
                <p>Information about your order</p>
              </div>
            </div>

            <div className="order-detail-row">
              <span>Order ID</span>
              <strong>{order.orderId}</strong>
            </div>

            <div className="order-detail-row">
              <span>Customer</span>
              <strong>{order.customer?.name || "Customer"}</strong>
            </div>

            <div className="order-detail-row">
              <span>Items</span>
              <strong>
                {order.items?.length || 0} item
                {order.items?.length === 1 ? "" : "s"}
              </strong>
            </div>

            <div className="order-detail-row">
              <span>Payment</span>
              <strong>
                {order.paymentMethod === "Cash on Delivery"
                  ? "Cash on Delivery"
                  : "Online Payment"}
              </strong>
            </div>

            <div className="order-detail-row">
              <span>Total</span>
              <strong className="order-total">₹{order.total}</strong>
            </div>

            <hr />

            <div className="delivery-address">
              <span>📍 Delivery Address</span>

              <p>
                {order.customer?.address || "Delivery address not available"}
              </p>
            </div>
          </div>

          {/* Estimated Delivery */}
          <div className="estimated-delivery-card">
            <div className="estimated-delivery-icon">🚚</div>

            <div>
              <span>Estimated Delivery</span>

              <strong>
                {currentStep === orderStatuses.length - 1
                  ? "Delivered"
                  : "Today / Tomorrow"}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="tracking-card tracking-products-card">
        <div className="tracking-card-header">
          <div>
            <h4>Ordered Medicines</h4>
            <p>Items included in this order</p>
          </div>
        </div>

        <div className="tracking-products">
          {order.items?.map((item) => (
            <div
              className="tracking-product"
              key={`${order.orderId}-${item.medicine?._id || item.name}`}
            >
              <div className="tracking-product-icon">💊</div>

              <div className="tracking-product-info">
                <h5>{item.name}</h5>

                <span>Quantity: {item.quantity}</span>
              </div>

              <strong>₹{item.price * item.quantity}</strong>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default OrderTracking;
