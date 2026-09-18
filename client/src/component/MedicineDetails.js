import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

function MedicineDetails({ addToCart }) {
  const location = useLocation();
  const navigate = useNavigate();

  const medicine = location.state?.medicine;

  if (!medicine) {
    return (
      <div className="medicine-details-page">
        <div className="container">
          <button
            className="back-btn"
            onClick={() => navigate("/")}
          >
            ← Back
          </button>

          <div className="medicine-info-container text-center">
            <h2>Medicine not found</h2>
            <p>Please go back and select a medicine again.</p>
          </div>
        </div>
      </div>
    );
  }

  const getExpiryStatus = () => {
    if (!medicine.expiryDate) {
      return {
        className: "expiry-unknown",
        text: "Expiry date not available",
      };
    }

    const parts = medicine.expiryDate.split("/");

    if (parts.length !== 2) {
      return {
        className: "expiry-unknown",
        text: "Expiry date unavailable",
      };
    }

    const month = Number(parts[0]);
    const year = Number(parts[1]);

    if (!month || !year) {
      return {
        className: "expiry-unknown",
        text: "Expiry date unavailable",
      };
    }

    const expiryDate = new Date(year, month - 1, 1);
    const currentDate = new Date();

    const monthsRemaining =
      (expiryDate.getFullYear() - currentDate.getFullYear()) * 12 +
      (expiryDate.getMonth() - currentDate.getMonth());

    if (monthsRemaining < 0) {
      return {
        className: "expiry-expired",
        text: "Expired",
      };
    }

    if (monthsRemaining <= 3) {
      return {
        className: "expiry-soon",
        text: "Expiring Soon",
      };
    }

    return {
      className: "expiry-valid",
      text: "Valid",
    };
  };

  const expiryStatus = getExpiryStatus();

  const handleAddToCart = () => {
    if (medicine.stock > 0) {
      addToCart(medicine);
    }
  };

  return (
    <div className="medicine-details-page">
      <div className="container">
        <button
          className="back-btn"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>

        <div className="medicine-info-container medicine-details-animated">

          {/* Header */}
          <div className="medicine-info-header medicine-header-animated">
            <h2>{medicine.name}</h2>

            <p>
              {medicine.category || "Medicine"} •{" "}
              {medicine.healthCategory || "General Care"}
            </p>

            <div className="expiry-status-wrapper">
              <span className={`expiry-status ${expiryStatus.className}`}>
                <span className="expiry-dot"></span>
                {expiryStatus.text}
              </span>
            </div>
          </div>

          {/* Medicine Information */}
          <div className="medicine-info-grid medicine-grid-animated">

            <div className="medicine-info-item">
              <small>Price</small>
              <div className="info-value">
                ₹{medicine.price ?? "Not available"}
              </div>
            </div>

            <div className="medicine-info-item">
              <small>Stock</small>
              <div className="info-value">
                {medicine.stock ?? "Not available"} units
              </div>
            </div>

            <div className="medicine-info-item">
              <small>Status</small>
              <div className="info-value">
                {medicine.status || "Available"}
              </div>
            </div>

            <div className="medicine-info-item">
              <small>Strength</small>
              <div className="info-value">
                {medicine.strength || "Not provided"}
              </div>
            </div>

            <div className="medicine-info-item">
              <small>Pack Size</small>
              <div className="info-value">
                {medicine.packSize || "Not provided"}
              </div>
            </div>

            <div className="medicine-info-item">
              <small>Manufacturer</small>
              <div className="info-value">
                {medicine.manufacturer || "Not provided"}
              </div>
            </div>

            <div className="medicine-info-item">
              <small>Manufacturing Date</small>
              <div className="info-value">
                {medicine.manufacturingDate || "Not provided"}
              </div>
            </div>

            <div className="medicine-info-item">
              <small>Expiry Date</small>
              <div className="info-value">
                {medicine.expiryDate || "Not provided"}
              </div>
            </div>

            <div className="medicine-info-item">
              <small>Storage</small>
              <div className="info-value">
                {medicine.storage || "Not provided"}
              </div>
            </div>

            <div className="medicine-info-item">
              <small>Prescription</small>

              <div className="info-value">
                {medicine.prescriptionRequired === "Yes" ? (
                  <span className="prescription-badge">
                    Prescription Required
                  </span>
                ) : (
                  <span className="prescription-badge prescription-not-required">
                    Prescription Not Required
                  </span>
                )}
              </div>
            </div>

            {/* Add to Cart */}
           <div className="medicine-info-item full-width text-center medicine-cart-section">
              <button
                className="btn btn-primary medicine-add-btn"
                disabled={medicine.stock <= 0}
                onClick={handleAddToCart}
              >
                {medicine.stock <= 0
                  ? "Out of Stock"
                  : "🛒 Add to Cart"}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default MedicineDetails;