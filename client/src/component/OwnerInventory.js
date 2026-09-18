import { useState, useEffect } from "react";
import "./OwnerInventory.css";

const topCareCategories = [
  "Diabetes Care",
  "Digestive Care",
  "Heart Care",
  "Kidney Care",
  "Pain Relief",
  "Antibiotics",
  "Allergy Care",
  "General Care",
];

const everydayWellnessCategories = [
  "Skin Care",
  "Baby Essentials",
  "Sexual Wellness",
  "Healthy Foods",
  "Ayurvedic Care",
  "Pain Relief",
  "Oral Care",
  "Personal Care",
];

function OwnerInventory({
  medicines = [],
  wellnessProducts = [],
  onUpdateStock,
  onUpdateWellnessStock,
  onAddMedicine,
  onEditMedicine,
  onDeleteMedicine,
}) {
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState("all");
  const [expiryFilter, setExpiryFilter] = useState("all");
  const [productTypeFilter, setProductTypeFilter] = useState("all");

  const [showAddMedicine, setShowAddMedicine] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  useEffect(() => {
    if (editingMedicine) {
      setTimeout(() => {
        document.getElementById("edit-medicine-form")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  }, [editingMedicine]);
  const [newMedicine, setNewMedicine] = useState({
    name: "",
    categoryType: "",
    category: "",
    price: "",
    stock: "",
    strength: "",
    packSize: "",
    manufacturer: "",
    manufacturingDate: "",
    expiryDate: "",
    storage: "",
    prescriptionRequired: "No",
  });

  const handleAddMedicineSubmit = (e) => {
    e.preventDefault();

    const name = newMedicine.name.trim();
    const category = newMedicine.category.trim();
    const price = Number(newMedicine.price);
    const stock = Number(newMedicine.stock);

    if (
      !name ||
      !category ||
      price < 0 ||
      stock < 0 ||
      !newMedicine.strength.trim() ||
      !newMedicine.packSize.trim() ||
      !newMedicine.manufacturer.trim() ||
      !newMedicine.manufacturingDate ||
      !newMedicine.expiryDate ||
      !newMedicine.storage.trim()
    ) {
      alert("Please fill all medicine details.");
      return;
    }

    if (newMedicine.expiryDate <= newMedicine.manufacturingDate) {
      alert("Expiry date must be later than manufacturing date.");
      return;
    }

    const status =
      stock === 0 ? "Out of Stock" : stock <= 10 ? "Low Stock" : "Available";

    const medicine = {
  id: Date.now(),
  name,
  categoryType: newMedicine.categoryType,
  category,
  price,
  stock,
  status,

  strength: newMedicine.strength.trim(),
      packSize: newMedicine.packSize.trim(),
      manufacturer: newMedicine.manufacturer.trim(),
      manufacturingDate: newMedicine.manufacturingDate,
      expiryDate: newMedicine.expiryDate,
      storage: newMedicine.storage.trim(),
      prescriptionRequired: newMedicine.prescriptionRequired,
    };

    onAddMedicine(medicine);

    setNewMedicine({
      name: "",
      categoryType: "",
      category: "",
      price: "",
      stock: "",
      strength: "",
      packSize: "",
      manufacturer: "",
      manufacturingDate: "",
      expiryDate: "",
      storage: "",
      prescriptionRequired: "No",
    });

    setShowAddMedicine(false);
  };

 const getExpiryStatus = (expiryDate) => {
  if (!expiryDate) {
    return "not-set";
  }

  let expiryDateObject;

  // Handle YYYY-MM format
  if (
    typeof expiryDate === "string" &&
    /^\d{4}-\d{2}$/.test(expiryDate)
  ) {
    const [year, month] = expiryDate.split("-").map(Number);

    if (!year || !month) {
      return "not-set";
    }

    expiryDateObject = new Date(year, month - 1, 1);
  } else {
    // Handle MongoDB / ISO date
    expiryDateObject = new Date(expiryDate);

    if (Number.isNaN(expiryDateObject.getTime())) {
      return "not-set";
    }

    // Compare by month, not exact day
    expiryDateObject = new Date(
      expiryDateObject.getFullYear(),
      expiryDateObject.getMonth(),
      1,
    );
  }

  const currentDate = new Date();

  const currentMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1,
  );

  if (expiryDateObject < currentMonth) {
    return "expired";
  }

  const threeMonthsLater = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 3,
    1,
  );

  if (expiryDateObject <= threeMonthsLater) {
    return "expiring-soon";
  }

  return "valid";
};

  const formatExpiryDate = (expiryDate) => {
    if (!expiryDate) {
      return "Not set";
    }

    const [year, month] = expiryDate.split("-").map(Number);

    if (!year || !month) {
      return "Not set";
    }

    return new Date(year, month - 1, 1).toLocaleDateString("en-IN", {
      month: "short",
      year: "numeric",
    });
  };

 const allInventoryItems = [
  ...medicines
    .filter(
      (medicine) => medicine.categoryType !== "Everyday Wellness",
    )
    .map((medicine) => ({
      ...medicine,
      productType: "medicine",
      backendId: medicine.backendId || medicine._id,
    })),

  ...medicines
    .filter(
      (medicine) => medicine.categoryType === "Everyday Wellness",
    )
    .map((medicine) => ({
      ...medicine,
      productType: "wellness",
      backendId: medicine.backendId || medicine._id,
    })),

  ...wellnessProducts.map((product) => ({
    ...product,
    productType: "wellness",
    backendId: product.backendId || product._id,
  })),
];
console.log("OWNER INVENTORY MEDICINES:", medicines);
console.log("OWNER INVENTORY WELLNESS:", wellnessProducts);

const filteredMedicines = allInventoryItems.filter((medicine) => {
  const searchTerm = search.trim().toLowerCase();

  const matchesSearch =
    searchTerm === "" ||
    medicine.name.toLowerCase().includes(searchTerm) ||
    medicine.category?.toLowerCase().includes(searchTerm);

  const currentStock = Number(medicine.stock || 0);

  const currentStockStatus =
    currentStock === 0
      ? "Out of Stock"
      : currentStock <= 10
        ? "Low Stock"
        : "Available";

  const matchesFilter =
    stockFilter === "all" || currentStockStatus === stockFilter;

  const medicineExpiryStatus = getExpiryStatus(medicine.expiryDate);

  const matchesProductType =
    productTypeFilter === "all" ||
    medicine.productType === productTypeFilter;

  const matchesExpiry =
    expiryFilter === "all" ||
    (expiryFilter === "expired" &&
      medicineExpiryStatus === "expired") ||
    (expiryFilter === "expiring-soon" &&
      medicineExpiryStatus === "expiring-soon") ||
    (expiryFilter === "valid" &&
      medicineExpiryStatus === "valid") ||
    (expiryFilter === "not-set" &&
      medicineExpiryStatus === "not-set");

  return (
    matchesSearch &&
    matchesFilter &&
    matchesExpiry &&
    matchesProductType
  );
});

 const actualMedicines = medicines.filter(
  (medicine) => medicine.categoryType !== "Everyday Wellness",
);

const availableCount = actualMedicines.filter(
  (medicine) => Number(medicine.stock || 0) > 10,
).length;

const lowStockCount = actualMedicines.filter(
  (medicine) => Number(medicine.stock || 0) >= 1 &&
    Number(medicine.stock || 0) <= 10,
).length;

const outOfStockCount = actualMedicines.filter(
  (medicine) => Number(medicine.stock || 0) === 0,
).length;
  const expiredCount = medicines.filter(
    (medicine) => getExpiryStatus(medicine.expiryDate) === "expired",
  ).length;

  const expiringSoonCount = medicines.filter(
    (medicine) => getExpiryStatus(medicine.expiryDate) === "expiring-soon",
  ).length;

  const totalStockUnits = medicines.reduce(
    (total, medicine) => total + Number(medicine.stock || 0),
    0,
  );

const stockPercentage =
  actualMedicines.length > 0
    ? Math.round(
        (availableCount / actualMedicines.length) * 100,
      )
    : 0;

  // ================= EXPIRY ALERTS =================

  const expiredItems = allInventoryItems.filter(
    (item) => getExpiryStatus(item.expiryDate) === "expired",
  );

  const expiringSoonItems = allInventoryItems.filter(
    (item) => getExpiryStatus(item.expiryDate) === "expiring-soon",
  );

  const validExpiryItems = allInventoryItems.filter(
    (item) => getExpiryStatus(item.expiryDate) === "valid",
  );

  const totalExpiryAlerts = expiredItems.length + expiringSoonItems.length;

  const handleEditMedicineSubmit = (e) => {
    e.preventDefault();

    if (!editingMedicine) {
      return;
    }

    const name = editingMedicine.name.trim();
    const category = editingMedicine.category.trim();
    const price = Number(editingMedicine.price);
    const stock = Number(editingMedicine.stock);

    if (
      !name ||
      !category ||
      price < 0 ||
      stock < 0 ||
      !editingMedicine.strength.trim() ||
      !editingMedicine.packSize.trim() ||
      !editingMedicine.manufacturer.trim() ||
      !editingMedicine.manufacturingDate ||
      !editingMedicine.expiryDate ||
      !editingMedicine.storage.trim()
    ) {
      alert("Please fill all medicine details.");
      return;
    }

    if (editingMedicine.expiryDate <= editingMedicine.manufacturingDate) {
      alert("Expiry date must be later than manufacturing date.");
      return;
    }

    const status =
      stock === 0 ? "Out of Stock" : stock <= 10 ? "Low Stock" : "Available";

    onEditMedicine({
      ...editingMedicine,
      name,
      category,
      price,
      stock,
      status,
      strength: editingMedicine.strength.trim(),
      packSize: editingMedicine.packSize.trim(),
      manufacturer: editingMedicine.manufacturer.trim(),
      storage: editingMedicine.storage.trim(),
    });

    setEditingMedicine(null);
  };

  return (
    <section className="owner-inventory-page">
      <div className="owner-inventory-header">
        <div>
          <span className="owner-dashboard-label">SMARTMED INVENTORY</span>

          <h2>Medicine Inventory</h2>

          <p>Manage medicine stock and availability from one place.</p>
        </div>

        <div className="owner-inventory-header-actions">
          <button
            type="button"
            className="inventory-add-medicine-btn"
            onClick={() => {
              setShowAddMedicine(true);
            }}
          >
            + Add Medicine
          </button>

          <div className="owner-inventory-total">
            {medicines.length} Medicines
          </div>
        </div>
      </div>

      {/* Stock Alerts */}
      {(lowStockCount > 0 ||
        outOfStockCount > 0 ||
        expiredCount > 0 ||
        expiringSoonCount > 0) && (
        <div className="inventory-alert-box">
          <div className="inventory-alert-icon">⚠️</div>

          <div className="inventory-alert-content">
            <h4>Inventory Alerts</h4>

            <div className="inventory-alert-items">
              {outOfStockCount > 0 && (
                <span className="inventory-alert-out">
                  🔴 {outOfStockCount}{" "}
                  {outOfStockCount === 1 ? "medicine is" : "medicines are"} out
                  of stock
                </span>
              )}

              {lowStockCount > 0 && (
                <span className="inventory-alert-low">
                  🟠 {lowStockCount}{" "}
                  {lowStockCount === 1 ? "medicine has" : "medicines have"} low
                  stock
                </span>
              )}

              {expiredCount > 0 && (
                <span className="inventory-alert-out">
                  🔴 {expiredCount}{" "}
                  {expiredCount === 1 ? "medicine has" : "medicines have"}{" "}
                  expired
                </span>
              )}

              {expiringSoonCount > 0 && (
                <span className="inventory-alert-low">
                  🟡 {expiringSoonCount}{" "}
                  {expiringSoonCount === 1 ? "medicine is" : "medicines are"}{" "}
                  expiring within 3 months
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {showAddMedicine && (
        <div className="inventory-add-medicine-card">
          <div className="inventory-add-medicine-header">
            <div>
              <h3>Add New Medicine</h3>
              <p>Add a medicine to SmartMed inventory.</p>
            </div>

            <button
              type="button"
              className="inventory-close-btn"
              onClick={() => setShowAddMedicine(false)}
            >
              ×
            </button>
          </div>

          <form onSubmit={handleAddMedicineSubmit}>
            <div className="inventory-form-grid">
              <div>
                <label>Medicine Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Paracetamol"
                  value={newMedicine.name}
                  onChange={(e) =>
                    setNewMedicine({
                      ...newMedicine,
                      name: e.target.value,
                    })
                  }
                  required
                />
              </div>

              

              <div>
                <label>Category Type</label>

                <select
                  className="form-select"
                  value={newMedicine.categoryType}
                  onChange={(e) =>
                    setNewMedicine({
                      ...newMedicine,
                      categoryType: e.target.value,
                      category: "",
                    })
                  }
                  required
                >
                  <option value="">Select Category Type</option>
                  <option value="Top Care">Top Care</option>
                  <option value="Everyday Wellness">Everyday Wellness</option>
                </select>
              </div>

              <div>
                <label>Category</label>

                <select
                  className="form-select"
                  value={newMedicine.category}
                  onChange={(e) =>
                    setNewMedicine({
                      ...newMedicine,
                      category: e.target.value,
                    })
                  }
                  disabled={!newMedicine.categoryType}
                  required
                >
                  <option value="">
                    {newMedicine.categoryType
                      ? "Select Category"
                      : "Select Category Type First"}
                  </option>

                  {(newMedicine.categoryType === "Top Care"
                    ? topCareCategories
                    : newMedicine.categoryType === "Everyday Wellness"
                      ? everydayWellnessCategories
                      : []
                  ).map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Price</label>
                <input
                  type="number"
                  min="0"
                  className="form-control"
                  placeholder="₹ Price"
                  value={newMedicine.price}
                  onChange={(e) =>
                    setNewMedicine({
                      ...newMedicine,
                      price: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div>
                <label>Initial Stock</label>
                <input
                  type="number"
                  min="0"
                  className="form-control"
                  placeholder="Stock quantity"
                  value={newMedicine.stock}
                  onChange={(e) =>
                    setNewMedicine({
                      ...newMedicine,
                      stock: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div>
                <label>Strength</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. 500 mg"
                  value={newMedicine.strength}
                  onChange={(e) =>
                    setNewMedicine({
                      ...newMedicine,
                      strength: e.target.value,
                    })
                  }
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Pack Size</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. 10 tablets"
                  value={newMedicine.packSize}
                  onChange={(e) =>
                    setNewMedicine({
                      ...newMedicine,
                      packSize: e.target.value,
                    })
                  }
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Manufacturer</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. ABC Pharmaceuticals"
                  value={newMedicine.manufacturer}
                  onChange={(e) =>
                    setNewMedicine({
                      ...newMedicine,
                      manufacturer: e.target.value,
                    })
                  }
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Manufacturing Date</label>
                <input
                  type="month"
                  className="form-control"
                  value={newMedicine.manufacturingDate}
                  onChange={(e) =>
                    setNewMedicine({
                      ...newMedicine,
                      manufacturingDate: e.target.value,
                    })
                  }
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Expiry Date</label>
                <input
                  type="month"
                  className="form-control"
                  value={newMedicine.expiryDate}
                  onChange={(e) =>
                    setNewMedicine({
                      ...newMedicine,
                      expiryDate: e.target.value,
                    })
                  }
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Storage</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Store below 25°C"
                  value={newMedicine.storage}
                  onChange={(e) =>
                    setNewMedicine({
                      ...newMedicine,
                      storage: e.target.value,
                    })
                  }
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Prescription Required</label>

                <select
                  className="form-select"
                  value={newMedicine.prescriptionRequired}
                  onChange={(e) =>
                    setNewMedicine({
                      ...newMedicine,
                      prescriptionRequired: e.target.value,
                    })
                  }
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>
            </div>

            <div className="inventory-form-actions">
              <button
                type="button"
                className="inventory-cancel-btn"
                onClick={() => setShowAddMedicine(false)}
              >
                Cancel
              </button>

              <button type="submit" className="inventory-save-btn">
                Add Medicine
              </button>
            </div>
          </form>
        </div>
      )}

      {editingMedicine && (
        <div id="edit-medicine-form" className="card shadow-sm border-0 mt-4">
          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="mb-0">Edit Medicine</h5>

              <button
                type="button"
                className="btn-close"
                onClick={() => setEditingMedicine(null)}
              ></button>
            </div>

            <form onSubmit={handleEditMedicineSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Medicine Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editingMedicine.name}
                    onChange={(e) =>
                      setEditingMedicine({
                        ...editingMedicine,
                        name: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Category</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editingMedicine.category}
                    onChange={(e) =>
                      setEditingMedicine({
                        ...editingMedicine,
                        category: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="col-md-4 mb-3">
                  <label className="form-label">Price</label>
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    value={editingMedicine.price}
                    onChange={(e) =>
                      setEditingMedicine({
                        ...editingMedicine,
                        price: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="col-md-4 mb-3">
                  <label className="form-label">Stock</label>
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    value={editingMedicine.stock}
                    onChange={(e) =>
                      setEditingMedicine({
                        ...editingMedicine,
                        stock: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="col-md-4 mb-3">
                  <label className="form-label">Strength</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editingMedicine.strength}
                    onChange={(e) =>
                      setEditingMedicine({
                        ...editingMedicine,
                        strength: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Pack Size</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editingMedicine.packSize}
                    onChange={(e) =>
                      setEditingMedicine({
                        ...editingMedicine,
                        packSize: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                 

                <div className="col-md-6 mb-3">
                  <label className="form-label">Manufacturing Date</label>
                  <input
                    type="month"
                    className="form-control"
                    value={editingMedicine.manufacturingDate}
                    onChange={(e) =>
                      setEditingMedicine({
                        ...editingMedicine,
                        manufacturingDate: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Expiry Date</label>
                  <input
                    type="month"
                    className="form-control"
                    value={editingMedicine.expiryDate}
                    onChange={(e) =>
                      setEditingMedicine({
                        ...editingMedicine,
                        expiryDate: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Storage</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editingMedicine.storage}
                    onChange={(e) =>
                      setEditingMedicine({
                        ...editingMedicine,
                        storage: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Prescription Required</label>

                  <select
                    className="form-select"
                    value={editingMedicine.prescriptionRequired}
                    onChange={(e) =>
                      setEditingMedicine({
                        ...editingMedicine,
                        prescriptionRequired: e.target.value,
                      })
                    }
                    required
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
              </div>

              <div className="d-flex gap-2 mt-3">
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setEditingMedicine(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inventory Analytics */}
      <div className="inventory-analytics-section">
        <div className="inventory-analytics-header">
          <div>
            <span className="owner-dashboard-label">INVENTORY ANALYTICS</span>

            <h3>Stock Overview</h3>

            <p>Monitor your medicine inventory at a glance.</p>
          </div>

          <div className="inventory-total-stock">
            <span>Total Stock Units</span>
            <strong>{totalStockUnits}</strong>
          </div>
        </div>

        <div className="inventory-analytics-grid">
          <div className="inventory-analytics-card">
            <div className="inventory-analytics-icon">💊</div>
            <div>
              <span>Medicine Types</span>
             <strong>{actualMedicines.length}</strong>
            </div>
          </div>

          <div className="inventory-analytics-card">
            <div className="inventory-analytics-icon">📦</div>
            <div>
              <span>Total Units</span>
              <strong>{totalStockUnits}</strong>
            </div>
          </div>

          <div className="inventory-analytics-card">
            <div className="inventory-analytics-icon">🟠</div>
            <div>
              <span>Low Stock</span>
              <strong>{lowStockCount}</strong>
            </div>
          </div>

          <div className="inventory-analytics-card">
            <div className="inventory-analytics-icon">🔴</div>
            <div>
              <span>Out of Stock</span>
              <strong>{outOfStockCount}</strong>
            </div>
          </div>

          <div className="inventory-analytics-card">
            <div className="inventory-analytics-icon">🟡</div>
            <div>
              <span>Expiring Soon</span>
              <strong>{expiringSoonCount}</strong>
            </div>
          </div>

          <div className="inventory-analytics-card">
            <div className="inventory-analytics-icon">🔴</div>
            <div>
              <span>Expired</span>
              <strong>{expiredCount}</strong>
            </div>
          </div>
        </div>

        <div className="inventory-stock-progress">
          <div className="inventory-stock-progress-header">
            <span>Available Medicine Status</span>
            <strong>{stockPercentage}%</strong>
          </div>

          <div className="progress">
            <div
              className="progress-bar"
              role="progressbar"
              style={{ width: `${stockPercentage}%` }}
              aria-valuenow={stockPercentage}
              aria-valuemin="0"
              aria-valuemax="100"
            ></div>
          </div>
        </div>
      </div>

      {/* ================= EXPIRY ALERTS ================= */}

      <div className="owner-expiry-alerts mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h4 className="mb-1">📅 Expiry Alerts</h4>
            <p className="text-muted mb-0">
              Products that need expiry attention
            </p>
          </div>

          <span className="badge bg-dark">
            {totalExpiryAlerts} Alert
            {totalExpiryAlerts !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="row g-3">
          {/* Expired */}
          <div className="col-md-4">
            <div className="card border-danger h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="mb-1">🔴 Expired</h5>
                    <p className="text-muted mb-0">Products past expiry date</p>
                  </div>

                  <h3 className="mb-0 text-danger">{expiredItems.length}</h3>
                </div>
              </div>
            </div>
          </div>

          {/* Expiring Soon */}
          <div className="col-md-4">
            <div className="card border-warning h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="mb-1">🟠 Expiring Soon</h5>
                    <p className="text-muted mb-0">Products nearing expiry</p>
                  </div>

                  <h3 className="mb-0 text-warning">
                    {expiringSoonItems.length}
                  </h3>
                </div>
              </div>
            </div>
          </div>

          {/* Valid */}
          <div className="col-md-4">
            <div className="card border-success h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="mb-1">🟢 Valid</h5>
                    <p className="text-muted mb-0">
                      Products with valid expiry
                    </p>
                  </div>

                  <h3 className="mb-0 text-success">
                    {validExpiryItems.length}
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="owner-inventory-search">
        <div className="inventory-search-box">
          <span>🔍</span>

          <input
            type="text"
            className="form-control"
            placeholder="Search medicine, wellness product or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="form-select"
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value)}
        >
          <option value="all">All Products</option>
          <option value="Available">Available</option>
          <option value="Low Stock">Low Stock</option>
          <option value="Out of Stock">Out of Stock</option>
        </select>

        <select
          className="form-select"
          value={productTypeFilter}
          onChange={(e) => setProductTypeFilter(e.target.value)}
        >
          <option value="all">All Products</option>
          <option value="medicine">Medicines</option>
          <option value="wellness">Wellness Products</option>
        </select>

        <select
          className="form-select"
          value={expiryFilter}
          onChange={(e) => setExpiryFilter(e.target.value)}
        >
          <option value="all">All Expiry Status</option>
          <option value="valid">Valid</option>
          <option value="expiring-soon">Expiring Soon</option>
          <option value="expired">Expired</option>
          <option value="not-set">Expiry Not Set</option>
        </select>
      </div>

      {/* Medicine List */}
      {filteredMedicines.length === 0 ? (
        <div className="owner-inventory-empty">
          <div className="inventory-empty-icon">🔍</div>

          <h3>No Medicines Found</h3>

          <p>Try another medicine name or category.</p>
        </div>
      ) : (
        <div className="owner-inventory-list">
          {filteredMedicines.map((medicine) => (
           <div
  className="owner-inventory-card"
  key={`${medicine.productType}-${medicine.id}`}
>
              {/* Medicine Information */}
              <div className="inventory-medicine-info">
                <div className="inventory-medicine-icon">💊</div>

                <div>
                  <h4>{medicine.name}</h4>

                  <p>
                    {medicine.category}
                    {medicine.strength ? ` • ${medicine.strength}` : ""}
                  </p>

                  <small>₹{medicine.price}</small>
                </div>
              </div>

              {/* Current Stock */}
              <div className="inventory-stock-section">
                <span className="inventory-stock-label">Current Stock</span>

                <strong
                  className={
                    medicine.stock === 0
                      ? "stock-number stock-out"
                      : medicine.stock <= 10
                        ? "stock-number stock-low"
                        : "stock-number"
                  }
                >
                  {medicine.stock}
                </strong>

                <span
                  className={`inventory-status ${
                    medicine.status === "Available"
                      ? "inventory-status-available"
                      : medicine.status === "Low Stock"
                        ? "inventory-status-low"
                        : "inventory-status-out"
                  }`}
                >
                  {medicine.status}
                </span>
              </div>

              {/* Update Stock */}
              <div className="inventory-update-section">
                <label htmlFor={`stock-${medicine.id}`}>Update Stock</label>

                <input
                  id={`stock-${medicine.id}`}
                  type="number"
                  min="0"
                  className="form-control"
                  value={medicine.stock}
                  onChange={(e) => {
                    if (medicine.productType === "wellness") {
                      onUpdateWellnessStock(medicine.id, e.target.value);
                    } else {
                      onUpdateStock(medicine.id, e.target.value);
                    }
                  }}
                />
              </div>
              {/* Edit Medicine */}
              <div className="inventory-edit-section">
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => {
                    setEditingMedicine(medicine);
                  }}
                >
                  ✏️ Edit
                </button>

                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm ms-2"
                  onClick={() => onDeleteMedicine(medicine.id)}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default OwnerInventory;
