import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function YourOrders({ orders, onCancelOrder }) {
  const navigate = useNavigate();
  const [expandedOrder, setExpandedOrder] = useState(null);

  const [backendOrders, setBackendOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("smartmedAuthToken");

        if (!token) {
          setBackendOrders([]);
          return;
        }

        const response = await fetch("http://localhost:5000/api/orders", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          console.error("Backend orders fetch error:", data.message);
          return;
        }

        console.log("Backend Orders:", data.orders);

        setBackendOrders(data.orders || []);
      } catch (error) {
        console.error("Backend orders connection error:", error);
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const toggleOrder = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const activeOrders = (backendOrders || []).filter(
    (order) => order.status !== "cancelled",
  );

  if (!activeOrders || activeOrders.length === 0) {
    return (
      <section className="container orders-page">
        <div className="orders-empty-card">
          <div className="orders-empty-icon">📦</div>

          <h2>No Orders Yet</h2>

          <p>You have not placed any orders yet.</p>

          <button className="btn btn-primary" onClick={() => navigate("/")}>
            Continue Shopping
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="container orders-page">
      <div className="orders-page-header">
        <div>
          <span className="orders-label">SMARTMED</span>

          <h2>Your Orders</h2>

          <p>View and track all your medicine orders.</p>
        </div>

        <div className="orders-count">
          {activeOrders.length} {activeOrders.length === 1 ? "Order" : "Orders"}
        </div>
      </div>

      <div className="orders-list">
        {activeOrders.map((order) => {
          const isExpanded = expandedOrder === order.orderId;

          const totalItems = order.items.reduce(
            (total, item) => total + item.quantity,
            0,
          );

          return (
            <div className="order-history-card" key={order.orderId}>
              {/* ORDER HEADER */}

              <div className="order-history-header">
                <div>
                  <span className="order-history-small">ORDER ID</span>

                  <h5>{order.orderId}</h5>

                  <span className="order-date">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <div
                  className={`order-status ${
                    order.status === "cancelled" ? "order-status-cancelled" : ""
                  }`}
                >
                  <span className="status-dot"></span>

                  {order.status === "cancelled"
                    ? "Order Cancelled"
                    : "Order Placed"}
                </div>
              </div>

              {/* ORDER SUMMARY */}

              <div className="order-summary-row">
                <div className="order-summary-item">
                  <span>Items</span>
                  <strong>{totalItems}</strong>
                </div>

                <div className="order-summary-item">
                  <span>Order Total</span>
                  <strong>₹{order.total}</strong>
                </div>

                <div className="order-summary-item">
                  <span>Payment</span>
                  <strong>
                    {order.paymentMethod === "Cash on Delivery"
                      ? "Cash on Delivery"
                      : "Online Payment"}
                  </strong>
                </div>
              </div>

              {/* PRODUCTS */}

              <div className="order-products">
                {order.items.map((item) => (
                  <div
                    className="order-product-row"
                    key={`${order.orderId}-${item.medicine?._id || item.name}`}
                  >
                    <div className="order-product-icon">💊</div>

                    <div className="order-product-info">
                      <h6>{item.name}</h6>

                      <span>Quantity: {item.quantity}</span>
                    </div>

                    <div className="order-product-price">
                      ₹{item.price * item.quantity}
                    </div>
                  </div>
                ))}
              </div>

              {/* ADDRESS */}

              {isExpanded && (
                <div className="order-extra-details">
                  <div className="order-extra-box">
                    <span>📍 Delivery Address</span>

                    <p>{order.customer?.address}</p>
                  </div>

                  <div className="order-extra-box">
                    <span>👤 Customer</span>

                    <p>{order.customer?.name}</p>
                  </div>

                  <div className="order-extra-box">
                    <span>📱 Mobile</span>

                    <p>{order.customer?.mobile}</p>
                  </div>
                </div>
              )}

              {/* ACTIONS */}

              <div className="order-actions">
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => toggleOrder(order.orderId)}
                >
                  {isExpanded ? "Hide Details" : "View Details"}
                </button>

                <button
                  className="btn btn-primary"
                  onClick={() => navigate(`/track-order/${order.orderId}`)}
                  disabled={order.status === "cancelled"}
                >
                  Track Order
                </button>

                {order.status !== "cancelled" && (
                  <button
                    className="btn btn-outline-danger"
                    onClick={async () => {
                      const success = await onCancelOrder(order.orderId);

                      if (success) {
                        setBackendOrders((prevOrders) =>
                          prevOrders.filter(
                            (existingOrder) =>
                              existingOrder.orderId !== order.orderId,
                          ),
                        );
                      }
                    }}
                  >
                    ✕ Cancel Order
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default YourOrders;
