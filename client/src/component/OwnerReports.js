import { useEffect, useMemo, useState } from "react";
import "./OwnerReports.css";

function OwnerReports({
  orders = [],
  medicines = [],
  wellnessProducts = [],
}) {
  const [reportType, setReportType] = useState("sales");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

    // ===============================
  // LOAD REPORT DATA FROM MONGODB
  // ===============================
  const [mongodbOrders, setMongodbOrders] = useState([]);
  const [mongodbMedicines, setMongodbMedicines] = useState([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [reportError, setReportError] = useState("");

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoadingReports(true);
        setReportError("");

        const token = localStorage.getItem("smartmedAuthToken");

        if (!token) {
          throw new Error("Authentication required");
        }

        const [ordersResponse, medicinesResponse] =
          await Promise.all([
            fetch("http://localhost:5000/api/orders/all", {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }),

            fetch("http://localhost:5000/api/medicines", {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }),
          ]);

        const ordersData = await ordersResponse.json();
        const medicinesData = await medicinesResponse.json();

        if (!ordersResponse.ok) {
          throw new Error(
            ordersData.message || "Failed to fetch orders",
          );
        }

        if (!medicinesResponse.ok) {
          throw new Error(
            medicinesData.message || "Failed to fetch medicines",
          );
        }

        setMongodbOrders(ordersData.orders || []);
        setMongodbMedicines(medicinesData || []);
      } catch (error) {
        console.error("Owner Reports Error:", error);

        setReportError(
          error.message || "Failed to load report data",
        );
      } finally {
        setLoadingReports(false);
      }
    };

    fetchReportData();
  }, []);

   const allProducts = useMemo(() => {
    return [
      ...mongodbMedicines.map((medicine) => ({
        ...medicine,
        productType: "Medicine",
      })),
      ...wellnessProducts.map((product) => ({
        ...product,
        productType: "Wellness",
      })),
    ];
  }, [mongodbMedicines, wellnessProducts]);

  const filteredOrders = useMemo(() => {
   return mongodbOrders
      .filter((order) => {
        if (!order.createdAt) {
          return false;
        }

        const orderDate = new Date(order.createdAt);

        if (startDate) {
          const fromDate = new Date(`${startDate}T00:00:00`);

          if (orderDate < fromDate) {
            return false;
          }
        }

        if (endDate) {
          const toDate = new Date(`${endDate}T23:59:59`);

          if (orderDate > toDate) {
            return false;
          }
        }

        return true;
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt || 0) -
          new Date(a.createdAt || 0),
      );
  }, [mongodbOrders, startDate, endDate]);

  const salesOrders = filteredOrders.filter(
    (order) => order.status !== "cancelled",
  );

  const totalSales = salesOrders.reduce(
    (sum, order) => sum + Number(order.total || 0),
    0,
  );

  const totalOrders = filteredOrders.length;

  const deliveredOrders = filteredOrders.filter(
    (order) => order.status === "delivered",
  ).length;

  const cancelledOrders = filteredOrders.filter(
    (order) => order.status === "cancelled",
  ).length;

  const totalItemsSold = salesOrders.reduce(
    (sum, order) =>
      sum +
      (order.items || []).reduce(
        (itemTotal, item) =>
          itemTotal + Number(item.quantity || 0),
        0,
      ),
    0,
  );

  const customerMap = new Map();

  filteredOrders.forEach((order) => {
    const email = order.customer?.email?.trim().toLowerCase();

    if (!email) {
      return;
    }

    if (!customerMap.has(email)) {
      customerMap.set(email, {
        name: order.customer?.name || "Customer",
        email,
        mobile: order.customer?.mobile || "Not available",
        orders: 0,
        totalSpent: 0,
      });
    }

    const customer = customerMap.get(email);

    customer.orders += 1;

    if (order.status !== "cancelled") {
      customer.totalSpent += Number(order.total || 0);
    }
  });

  const customers = Array.from(customerMap.values()).sort(
    (a, b) => b.totalSpent - a.totalSpent,
  );

  const formatDate = (date) => {
    if (!date) {
      return "Not available";
    }

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getReportTitle = () => {
    switch (reportType) {
      case "sales":
        return "Sales Report";
      case "orders":
        return "Order Report";
      case "inventory":
        return "Inventory Report";
      case "customers":
        return "Customer Report";
      default:
        return "Owner Report";
    }
  };

  const handleClearDates = () => {
    setStartDate("");
    setEndDate("");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <section className="owner-reports-page">

            {loadingReports && (
        <div className="alert alert-info">
          Loading report data from MongoDB...
        </div>
      )}

      {reportError && (
        <div className="alert alert-danger">
          {reportError}
        </div>
      )}
      <div className="owner-reports-header">
        <div>
          <span className="owner-reports-label">
            SMARTMED ADMIN
          </span>

          <h2>Owner Reports</h2>

          <p>
            Generate business reports using your existing
            SmartMed data.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-dark owner-print-btn"
          onClick={handlePrint}
        >
          🖨️ Print Report
        </button>
      </div>

      {/* ================= REPORT CONTROLS ================= */}

      <div className="owner-report-controls">
        <div className="row g-3">

          <div className="col-lg-4">
            <label className="form-label">
              Report Type
            </label>

            <select
              className="form-select"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="sales">Sales Report</option>
              <option value="orders">Order Report</option>
              <option value="inventory">
                Inventory Report
              </option>
              <option value="customers">
                Customer Report
              </option>
            </select>
          </div>

          <div className="col-lg-3">
            <label className="form-label">
              From Date
            </label>

            <input
              type="date"
              className="form-control"
              value={startDate}
              max={endDate || undefined}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="col-lg-3">
            <label className="form-label">
              To Date
            </label>

            <input
              type="date"
              className="form-control"
              value={endDate}
              min={startDate || undefined}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div className="col-lg-2 d-flex align-items-end">
            <button
              type="button"
              className="btn btn-outline-secondary w-100"
              onClick={handleClearDates}
            >
              Clear Dates
            </button>
          </div>

        </div>
      </div>

      {/* ================= REPORT ================= */}

      <div className="owner-report-paper">

        <div className="owner-report-title">
          <div>
            <h3>{getReportTitle()}</h3>

            <p>
              {startDate || endDate
                ? `Period: ${
                    startDate ? formatDate(startDate) : "All time"
                  } - ${
                    endDate ? formatDate(endDate) : "Present"
                  }`
                : "Period: All available data"}
            </p>
          </div>

          <div className="owner-report-brand">
            💊 SmartMed
          </div>
        </div>

        {/* ================= SALES REPORT ================= */}

        {reportType === "sales" && (
          <>
            <div className="row g-3 mb-4">

              <div className="col-md-3">
                <div className="report-stat-card">
                  <span>Total Sales</span>
                  <strong>
                    ₹{totalSales.toLocaleString("en-IN")}
                  </strong>
                </div>
              </div>

              <div className="col-md-3">
                <div className="report-stat-card">
                  <span>Total Orders</span>
                  <strong>{totalOrders}</strong>
                </div>
              </div>

              <div className="col-md-3">
                <div className="report-stat-card">
                  <span>Items Sold</span>
                  <strong>{totalItemsSold}</strong>
                </div>
              </div>

              <div className="col-md-3">
                <div className="report-stat-card">
                  <span>Delivered</span>
                  <strong>{deliveredOrders}</strong>
                </div>
              </div>

            </div>

            <div className="table-responsive">
              <table className="table table-bordered owner-report-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Customer</th>
                    <th>Status</th>
                    <th>Payment</th>
                    <th>Total</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center">
                        No sales data found.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => (
                      <tr key={order.orderId}>
                        <td>{order.orderId}</td>
                        <td>{formatDate(order.createdAt)}</td>
                        <td>
                          {order.customer?.name || "Customer"}
                        </td>
                        <td>{order.status || "placed"}</td>
                        <td>
                          {order.paymentMethod === "upi"
                            ? "UPI"
                            : order.paymentMethod === "card"
                              ? "Card"
                              : "Cash on Delivery"}
                        </td>
                        <td>
                          ₹{Number(order.total || 0).toLocaleString(
                            "en-IN",
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ================= ORDER REPORT ================= */}

        {reportType === "orders" && (
          <>
            <div className="row g-3 mb-4">

              <div className="col-md-4">
                <div className="report-stat-card">
                  <span>Total Orders</span>
                  <strong>{totalOrders}</strong>
                </div>
              </div>

              <div className="col-md-4">
                <div className="report-stat-card">
                  <span>Delivered</span>
                  <strong>{deliveredOrders}</strong>
                </div>
              </div>

              <div className="col-md-4">
                <div className="report-stat-card">
                  <span>Cancelled</span>
                  <strong>{cancelledOrders}</strong>
                </div>
              </div>

            </div>

            <div className="table-responsive">
              <table className="table table-bordered owner-report-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Status</th>
                    <th>Total</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center">
                        No orders found.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => {
                      const itemCount =
                        order.items?.reduce(
                          (sum, item) =>
                            sum + Number(item.quantity || 0),
                          0,
                        ) || 0;

                      return (
                        <tr key={order.orderId}>
                          <td>{order.orderId}</td>
                          <td>{formatDate(order.createdAt)}</td>
                          <td>
                            {order.customer?.name || "Customer"}
                          </td>
                          <td>{itemCount}</td>
                          <td>{order.status || "placed"}</td>
                          <td>
                            ₹{Number(order.total || 0).toLocaleString(
                              "en-IN",
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ================= INVENTORY REPORT ================= */}

        {reportType === "inventory" && (
          <>
            <div className="row g-3 mb-4">

              <div className="col-md-4">
                <div className="report-stat-card">
                  <span>Total Products</span>
                  <strong>{allProducts.length}</strong>
                </div>
              </div>

              <div className="col-md-4">
                <div className="report-stat-card">
                  <span>Total Stock Units</span>
                  <strong>
                    {allProducts.reduce(
                      (sum, product) =>
                        sum + Number(product.stock || 0),
                      0,
                    )}
                  </strong>
                </div>
              </div>

              <div className="col-md-4">
                <div className="report-stat-card">
                  <span>Low / Out of Stock</span>
                  <strong>
                    {
                      allProducts.filter(
                        (product) =>
                          product.status === "Low Stock" ||
                          product.status === "Out of Stock",
                      ).length
                    }
                  </strong>
                </div>
              </div>

            </div>

            <div className="table-responsive">
              <table className="table table-bordered owner-report-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Type</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Expiry</th>
                  </tr>
                </thead>

                <tbody>
                  {allProducts.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center">
                        No inventory data found.
                      </td>
                    </tr>
                  ) : (
                    allProducts.map((product) => (
                      <tr key={`${product.productType}-${product.id}`}>
                        <td>{product.name}</td>
                        <td>{product.productType}</td>
                        <td>{product.category || "—"}</td>
                        <td>
                          ₹{Number(product.price || 0).toLocaleString(
                            "en-IN",
                          )}
                        </td>
                        <td>{product.stock ?? 0}</td>
                        <td>{product.status || "—"}</td>
                        <td>
                          {product.expiryDate
                            ? formatDate(product.expiryDate)
                            : "Not Set"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ================= CUSTOMER REPORT ================= */}

        {reportType === "customers" && (
          <>
            <div className="row g-3 mb-4">

              <div className="col-md-4">
                <div className="report-stat-card">
                  <span>Total Customers</span>
                  <strong>{customers.length}</strong>
                </div>
              </div>

              <div className="col-md-4">
                <div className="report-stat-card">
                  <span>Customer Orders</span>
                  <strong>{totalOrders}</strong>
                </div>
              </div>

              <div className="col-md-4">
                <div className="report-stat-card">
                  <span>Customer Sales</span>
                  <strong>
                    ₹{totalSales.toLocaleString("en-IN")}
                  </strong>
                </div>
              </div>

            </div>

            <div className="table-responsive">
              <table className="table table-bordered owner-report-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Email</th>
                    <th>Mobile</th>
                    <th>Orders</th>
                    <th>Total Spent</th>
                  </tr>
                </thead>

                <tbody>
                  {customers.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center">
                        No customer data found.
                      </td>
                    </tr>
                  ) : (
                    customers.map((customer) => (
                      <tr key={customer.email}>
                        <td>{customer.name}</td>
                        <td>{customer.email}</td>
                        <td>{customer.mobile}</td>
                        <td>{customer.orders}</td>
                        <td>
                          ₹{customer.totalSpent.toLocaleString(
                            "en-IN",
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

      </div>
    </section>
  );
}

export default OwnerReports;