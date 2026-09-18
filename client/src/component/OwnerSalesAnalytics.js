
import { useMemo } from "react";
import "./OwnerSalesAnalytics.css";

function OwnerSalesAnalytics({ orders = [] }) {
  const analytics = useMemo(() => {
    // Cancelled orders should not be counted as sales.
    const validOrders = orders.filter(
      (order) => order.status !== "cancelled"
    );

    const totalRevenue = validOrders.reduce(
      (total, order) => total + Number(order.total || 0),
      0
    );

    const totalItemsSold = validOrders.reduce((total, order) => {
      const itemCount = (order.items || []).reduce(
        (itemTotal, item) =>
          itemTotal + Number(item.quantity || item.qty || 0),
        0
      );

      return total + itemCount;
    }, 0);

    const averageOrderValue =
      validOrders.length > 0 ? totalRevenue / validOrders.length : 0;

    // -----------------------------
    // Product Sales
    // -----------------------------
    const productSales = {};

    validOrders.forEach((order) => {
      (order.items || []).forEach((item) => {
        const name = item.name || "Unknown Medicine";
        const quantity = Number(item.quantity || item.qty || 0);
        const price = Number(item.price || 0);

        if (!productSales[name]) {
          productSales[name] = {
            name,
            quantity: 0,
            revenue: 0,
          };
        }

        productSales[name].quantity += quantity;
        productSales[name].revenue += quantity * price;
      });
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // -----------------------------
    // Payment Methods
    // -----------------------------
    const paymentMethods = {};

    validOrders.forEach((order) => {
      const method = order.paymentMethod || "Other";

      if (!paymentMethods[method]) {
        paymentMethods[method] = {
          method,
          orders: 0,
          revenue: 0,
        };
      }

      paymentMethods[method].orders += 1;
      paymentMethods[method].revenue += Number(order.total || 0);
    });

    const paymentSummary = Object.values(paymentMethods);

    // -----------------------------
    // Current Month Revenue
    // -----------------------------
    const now = new Date();

    const currentMonthOrders = validOrders.filter((order) => {
      if (!order.createdAt) {
        return false;
      }

      const orderDate = new Date(order.createdAt);

      return (
        orderDate.getMonth() === now.getMonth() &&
        orderDate.getFullYear() === now.getFullYear()
      );
    });

    const currentMonthRevenue = currentMonthOrders.reduce(
      (total, order) => total + Number(order.total || 0),
      0
    );

    return {
      totalRevenue,
      totalOrders: validOrders.length,
      totalItemsSold,
      averageOrderValue,
      currentMonthRevenue,
      topProducts,
      paymentSummary,
    };
  }, [orders]);

  return (
    <section className="owner-sales-page">

      {/* Header */}
      <div className="owner-sales-header">
        <div>
          <span className="owner-sales-label">
            SMARTMED ANALYTICS
          </span>

          <h2>Sales & Revenue Analytics</h2>

          <p>
            Monitor your store performance, revenue and product sales.
          </p>
        </div>

        <div className="owner-sales-header-badge">
          📊 Sales Overview
        </div>
      </div>

      {/* Main Analytics Cards */}
      <div className="owner-sales-summary-grid">

        <div className="owner-sales-summary-card">
          <div className="owner-sales-summary-icon">
            💰
          </div>

          <div>
            <span>Total Revenue</span>

            <strong>
              ₹{analytics.totalRevenue.toLocaleString("en-IN")}
            </strong>
          </div>
        </div>

        <div className="owner-sales-summary-card">
          <div className="owner-sales-summary-icon">
            📦
          </div>

          <div>
            <span>Total Orders</span>

            <strong>
              {analytics.totalOrders}
            </strong>
          </div>
        </div>

        <div className="owner-sales-summary-card">
          <div className="owner-sales-summary-icon">
            🛒
          </div>

          <div>
            <span>Items Sold</span>

            <strong>
              {analytics.totalItemsSold}
            </strong>
          </div>
        </div>

        <div className="owner-sales-summary-card">
          <div className="owner-sales-summary-icon">
            📈
          </div>

          <div>
            <span>Average Order Value</span>

            <strong>
              ₹
              {Math.round(
                analytics.averageOrderValue
              ).toLocaleString("en-IN")}
            </strong>
          </div>
        </div>

      </div>

      {/* Current Month */}
      <div className="owner-sales-month-card">

        <div>
          <span>Current Month Revenue</span>

          <h3>
            ₹
            {analytics.currentMonthRevenue.toLocaleString(
              "en-IN"
            )}
          </h3>

          <p>
            Revenue generated from orders placed during the
            current month.
          </p>
        </div>

        <div className="owner-sales-month-icon">
          📅
        </div>

      </div>

      {/* Two Column Analytics */}
      <div className="owner-sales-content-grid">

        {/* Top Selling Medicines */}
        <div className="owner-sales-panel">

          <div className="owner-sales-panel-header">

            <div>
              <span>PRODUCT PERFORMANCE</span>

              <h3>
                Top Selling Medicines
              </h3>
            </div>

            <div className="owner-sales-panel-icon">
              🏆
            </div>

          </div>

          {analytics.topProducts.length === 0 ? (
            <div className="owner-sales-empty">
              <div>📦</div>

              <p>
                No sales data available yet.
              </p>
            </div>
          ) : (
            <div className="owner-sales-products">

              {analytics.topProducts.map(
                (product, index) => (
                  <div
                    className="owner-sales-product"
                    key={product.name}
                  >

                    <div className="owner-sales-product-rank">
                      #{index + 1}
                    </div>

                    <div className="owner-sales-product-info">

                      <strong>
                        {product.name}
                      </strong>

                      <span>
                        {product.quantity}{" "}
                        {product.quantity === 1
                          ? "unit"
                          : "units"}{" "}
                        sold
                      </span>

                    </div>

                    <div className="owner-sales-product-revenue">
                      ₹
                      {product.revenue.toLocaleString(
                        "en-IN"
                      )}
                    </div>

                  </div>
                )
              )}

            </div>
          )}

        </div>

        {/* Payment Summary */}
        <div className="owner-sales-panel">

          <div className="owner-sales-panel-header">

            <div>
              <span>PAYMENT ANALYTICS</span>

              <h3>
                Payment Methods
              </h3>
            </div>

            <div className="owner-sales-panel-icon">
              💳
            </div>

          </div>

          {analytics.paymentSummary.length === 0 ? (
            <div className="owner-sales-empty">

              <div>💳</div>

              <p>
                No payment data available yet.
              </p>

            </div>
          ) : (
            <div className="owner-sales-payment-list">

              {analytics.paymentSummary.map(
                (payment) => (
                  <div
                    className="owner-sales-payment"
                    key={payment.method}
                  >

                    <div>
                      <strong>
                        {payment.method}
                      </strong>

                      <span>
                        {payment.orders}{" "}
                        {payment.orders === 1
                          ? "order"
                          : "orders"}
                      </span>
                    </div>

                    <strong>
                      ₹
                      {payment.revenue.toLocaleString(
                        "en-IN"
                      )}
                    </strong>

                  </div>
                )
              )}

            </div>
          )}

        </div>

      </div>

      {/* Recent Sales */}
      <div className="owner-sales-panel owner-sales-recent-panel">

        <div className="owner-sales-panel-header">

          <div>
            <span>ORDER ACTIVITY</span>

            <h3>
              Recent Sales
            </h3>
          </div>

          <div className="owner-sales-panel-icon">
            🧾
          </div>

        </div>

        {orders.filter(
          (order) => order.status !== "cancelled"
        ).length === 0 ? (

          <div className="owner-sales-empty">

            <div>🧾</div>

            <p>
              No completed sales available yet.
            </p>

          </div>

        ) : (

          <div className="owner-sales-recent-list">

            {orders
              .filter(
                (order) => order.status !== "cancelled"
              )
              .slice()
              .sort(
                (a, b) =>
                  new Date(b.createdAt || 0) -
                  new Date(a.createdAt || 0)
              )
              .slice(0, 5)
              .map((order) => (

                <div
                  className="owner-sales-recent-item"
                  key={order.orderId}
                >

                  <div>

                    <strong>
                      {order.orderId}
                    </strong>

                    <span>
                      {order.createdAt
                        ? new Date(
                            order.createdAt
                          ).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )
                        : "Date unavailable"}
                    </span>

                  </div>

                  <strong>
                    ₹
                    {Number(
                      order.total || 0
                    ).toLocaleString("en-IN")}
                  </strong>

                </div>

              ))}

          </div>

        )}

      </div>

    </section>
  );
}

export default OwnerSalesAnalytics;
