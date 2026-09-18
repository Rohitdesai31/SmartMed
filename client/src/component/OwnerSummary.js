
import "./OwnerSummary.css";

function OwnerSummary({ orders = [] }) {
  const totalOrders = orders.length;

  const activeOrders = orders.filter(
    (order) =>
      order.status !== "cancelled" &&
      order.status !== "delivered"
  ).length;

  const deliveredOrders = orders.filter(
    (order) => order.status === "delivered"
  ).length;

  const cancelledOrders = orders.filter(
    (order) => order.status === "cancelled"
  ).length;

  const totalSales = orders
    .filter((order) => order.status !== "cancelled")
    .reduce(
      (sum, order) => sum + Number(order.total || 0),
      0
    );

  return (
    <div className="owner-summary-grid">

      <div className="owner-summary-card">
        <div className="owner-summary-icon">📦</div>
        <div>
          <span>Total Orders</span>
          <strong>{totalOrders}</strong>
        </div>
      </div>

      <div className="owner-summary-card">
        <div className="owner-summary-icon">🛍️</div>
        <div>
          <span>Active Orders</span>
          <strong>{activeOrders}</strong>
        </div>
      </div>

      <div className="owner-summary-card">
        <div className="owner-summary-icon">✅</div>
        <div>
          <span>Delivered</span>
          <strong>{deliveredOrders}</strong>
        </div>
      </div>

      <div className="owner-summary-card">
        <div className="owner-summary-icon">❌</div>
        <div>
          <span>Cancelled</span>
          <strong>{cancelledOrders}</strong>
        </div>
      </div>

      <div className="owner-summary-card">
        <div className="owner-summary-icon">₹</div>
        <div>
          <span>Total Sales</span>
          <strong>
            ₹{totalSales.toLocaleString("en-IN")}
          </strong>
        </div>
      </div>

    </div>
  );
}

export default OwnerSummary;

