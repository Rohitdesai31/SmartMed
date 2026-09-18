import { useEffect, useMemo, useState } from "react";

import "./OwnerCustomers.css";


function OwnerCustomers({ orders = [] }) {
  const [search, setSearch] = useState("");
       const [users, setUsers] = useState([]);

         useEffect(() => {
    const loadUsers = async () => {
      try {
        const token = localStorage.getItem("smartmedAuthToken");

        if (!token) {
          console.error("Owner authentication token not found.");
          return;
        }

        const response = await fetch(
          "http://localhost:5000/api/auth/users",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load users",
          );
        }

        setUsers(
          Array.isArray(data.users) ? data.users : [],
        );
      } catch (error) {
        console.error(
          "Failed to load customers from MongoDB:",
          error,
        );
      }
    };

    loadUsers();
  }, []);
   const allOrders = useMemo(() => {
    return Array.isArray(orders) ? orders : [];
  }, [orders]);

    const customers = useMemo(() => {
    const customerMap = {};

    // Create all registered customers from MongoDB
    users.forEach((user) => {
      const email = (user.email || "").trim().toLowerCase();

      if (!email) {
        return;
      }

      customerMap[email] = {
        email: user.email,
        name: user.name || "Customer",
        mobile: "Not available",
        address: "Not available",
        totalOrders: 0,
        totalSpent: 0,
        lastOrderDate: null,
      };
    });

    // Add order information to customers
    allOrders
      .filter((order) => order.status !== "cancelled")
      .forEach((order) => {
        const customer = order.customer || {};

        const email = (customer.email || "")
          .trim()
          .toLowerCase();

        if (!email) {
          return;
        }

        if (!customerMap[email]) {
          customerMap[email] = {
            email: customer.email || "Not available",
            name: customer.name || "Customer",
            mobile: customer.mobile || "Not available",
            address: customer.address || "Not available",
            totalOrders: 0,
            totalSpent: 0,
            lastOrderDate: null,
          };
        }

        if (customer.mobile) {
          customerMap[email].mobile = customer.mobile;
        }

        if (customer.address) {
          customerMap[email].address = customer.address;
        }

        customerMap[email].totalOrders += 1;

        customerMap[email].totalSpent +=
          Number(order.total) || 0;

        if (
          order.createdAt &&
          (!customerMap[email].lastOrderDate ||
            new Date(order.createdAt) >
              new Date(customerMap[email].lastOrderDate))
        ) {
          customerMap[email].lastOrderDate =
            order.createdAt;
        }
      });

    return Object.values(customerMap);
  }, [users, allOrders]);

  const filteredCustomers = customers.filter(
    (customer) => {
      const searchText = search
        .toLowerCase()
        .trim();

      if (!searchText) {
        return true;
      }

      return (
        customer.name
          .toLowerCase()
          .includes(searchText) ||
        customer.email
          .toLowerCase()
          .includes(searchText) ||
        customer.mobile
          .toLowerCase()
          .includes(searchText)
      );
    }
  );

  const totalCustomers = customers.length;

  const totalCustomerOrders = customers.reduce(
    (total, customer) =>
      total + customer.totalOrders,
    0
  );

  const totalCustomerRevenue = customers.reduce(
    (total, customer) =>
      total + customer.totalSpent,
    0
  );

  return (
    <section className="owner-customers-page">
      <div className="owner-customers-header">
        <div>
          <span className="owner-customers-label">
            SMARTMED CUSTOMERS
          </span>

          <h2>Customer Management</h2>

          <p>
            View your customers, orders and spending
            information in one place.
          </p>
        </div>

        <div className="owner-customers-header-icon">
          👥
        </div>
      </div>

      <div className="owner-customers-summary">
        <div className="owner-customer-summary-card">
          <div className="owner-customer-summary-icon">
            👥
          </div>

          <div>
            <span>Total Customers</span>
            <strong>{totalCustomers}</strong>
          </div>
        </div>

        <div className="owner-customer-summary-card">
          <div className="owner-customer-summary-icon">
            📦
          </div>

          <div>
            <span>Total Orders</span>
            <strong>{totalCustomerOrders}</strong>
          </div>
        </div>

        <div className="owner-customer-summary-card">
          <div className="owner-customer-summary-icon">
            💰
          </div>

          <div>
            <span>Customer Revenue</span>

            <strong>
              ₹
              {totalCustomerRevenue.toLocaleString(
                "en-IN"
              )}
            </strong>
          </div>
        </div>
      </div>

      <div className="owner-customers-panel">
        <div className="owner-customers-toolbar">
          <div>
            <span className="owner-customers-section-label">
              CUSTOMER LIST
            </span>

            <h3>Registered Customers</h3>
          </div>

          <div className="owner-customers-search">
            <span>🔍</span>

            <input
              type="text"
              placeholder="Search customer..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {filteredCustomers.length === 0 ? (
          <div className="owner-customers-empty">
            <div>👥</div>

            <h4>No customers found</h4>

            <p>
              Customer information will appear here
              after orders are placed.
            </p>
          </div>
        ) : (
          <div className="owner-customers-table-wrapper">
            <table className="owner-customers-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Contact</th>
                  <th>Orders</th>
                  <th>Total Spent</th>
                  <th>Last Order</th>
                </tr>
              </thead>

              <tbody>
                {filteredCustomers.map(
                  (customer) => (
                    <tr key={customer.email}>
                      <td>
                        <div className="owner-customer-name">
                          <div className="owner-customer-avatar">
                            {customer.name
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <strong>
                              {customer.name}
                            </strong>

                            <span>
                              {customer.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="owner-customer-mobile">
                          📱 {customer.mobile}
                        </span>
                      </td>

                      <td>
                        <span className="owner-customer-orders">
                          {customer.totalOrders}
                        </span>
                      </td>

                      <td>
                        <strong className="owner-customer-spent">
                          ₹
                          {customer.totalSpent.toLocaleString(
                            "en-IN"
                          )}
                        </strong>
                      </td>

                      <td>
                        {customer.lastOrderDate
                          ? new Date(
                              customer.lastOrderDate
                            ).toLocaleDateString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              }
                            )
                          : "Not available"}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

export default OwnerCustomers;