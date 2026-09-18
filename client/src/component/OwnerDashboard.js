import { useState } from "react";
import "./OwnerDashboard.css";
import OwnerSummary from "./OwnerSummary";

const statusOptions = [
  { value: "placed", label: "Order Placed" },
  { value: "confirmed", label: "Order Confirmed" },
  { value: "preparing", label: "Preparing Order" },
  { value: "shipped", label: "Shipped" },
  { value: "out-for-delivery", label: "Out for Delivery" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

function OwnerDashboard({ orders, onUpdateOrderStatus, onViewOrderDetails }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredOrders = [...(orders || [])]
    .filter((order) => {
      const searchTerm = search.trim().toLowerCase();

      const matchesSearch =
        !searchTerm ||
        order.orderId?.toLowerCase().includes(searchTerm) ||
        order.customer?.name?.toLowerCase().includes(searchTerm) ||
        order.customer?.email?.toLowerCase().includes(searchTerm) ||
        order.customer?.mobile?.toLowerCase().includes(searchTerm);

      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

  const getStatusLabel = (status) => {
    return (
      statusOptions.find((item) => item.value === status)?.label ||
      "Order Placed"
    );
  };

  return (
    <section className="owner-dashboard-page">
      <div className="owner-dashboard-header">
        <div>
          <span className="owner-dashboard-label">SMARTMED ADMIN</span>

          <h2>Owner Dashboard</h2>

          <p>Manage customer orders and update delivery status.</p>
        </div>

        <div className="owner-order-count">
          {orders.length} {orders.length === 1 ? "Order" : "Orders"}
        </div>
      </div>
      <OwnerSummary orders={orders} />

      <div className="owner-dashboard-search">
        <div className="row g-2">
          <div className="col-lg-8">
            <input
              type="text"
              className="form-control"
              placeholder="Search Order ID, customer name, email or mobile"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="col-lg-4">
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Orders</option>

              {statusOptions.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="owner-empty-card">
          <div>📦</div>
          <h3>No Orders Found</h3>
          <p>There are no matching orders.</p>
        </div>
      ) : (
        <div className="owner-orders-list">
          {filteredOrders.map((order) => (
            <div className="owner-order-card" key={order.orderId}>
              <div className="owner-order-header">
                <div>
                  <span className="owner-small-label">ORDER ID</span>

                  <h4>{order.orderId}</h4>

                  <small>
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </small>
                </div>

                <div className="owner-order-total">₹{order.total}</div>
              </div>

              <div className="owner-order-info">
                <div>
                  <span>Customer</span>
                  <strong>{order.customer?.name || "Customer"}</strong>
                </div>

                <div>
                  <span>Mobile</span>
                  <strong>{order.customer?.mobile || "Not available"}</strong>
                </div>

                <div>
                  <span>Payment</span>
                  <strong>
                    {order.paymentMethod === "upi"
                      ? "UPI"
                      : order.paymentMethod === "card"
                        ? "Debit / Credit Card"
                        : "Cash on Delivery"}
                  </strong>
                </div>

                <div>
                  <span>Items</span>
                  <strong>
                    {order.items?.reduce(
                      (total, item) => total + item.quantity,
                      0,
                    ) || 0}
                  </strong>
                </div>
              </div>

              <div className="owner-order-address">
                <span>📍 Delivery Address</span>
                <p>{order.customer?.address || "Address not available"}</p>
              </div>

              <div className="owner-order-products">
                {order.items?.map((item) => (
                  <div className="owner-product-row" key={item.medicine?._id || `${order.orderId}-${item.name}`}>
                    <span>
                      💊 {item.name} × {item.quantity}
                    </span>

                    <strong>₹{item.price * item.quantity}</strong>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="owner-view-details-btn"
                onClick={() => onViewOrderDetails(order)}
              >
                View Details
              </button>

              <div className="owner-order-actions">
                <div className="owner-current-status">
                  <span>Current Status</span>

                  <strong>{getStatusLabel(order.status)}</strong>
                </div>

                {order.status === "cancelled" ? (
                  <div className="owner-status-locked">🔒 Order Cancelled</div>
                ) : (
                  <select
                    className="form-select owner-status-select"
                    value={order.status || "placed"}
                    onChange={(e) =>
                      onUpdateOrderStatus(order.orderId, e.target.value)
                    }
                  >
                    {statusOptions.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default OwnerDashboard;
