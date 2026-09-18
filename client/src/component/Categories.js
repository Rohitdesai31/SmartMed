import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const categories = [
  {
    name: "Diabetes Care",
    icon: "🩸",
    description: "Medicines for diabetes management",
  },
  {
    name: "Digestive Care",
    icon: "🥗",
    description: "Care for digestion and acidity",
  },
  {
    name: "Heart Care",
    icon: "❤️",
    description: "Medicines for heart and blood pressure",
  },
  {
    name: "Kidney Care",
    icon: "🫘",
    description: "Medicines for kidney health",
  },
  {
    name: "Pain Relief",
    icon: "💊",
    description: "Medicines for pain and fever",
  },
  {
    name: "Antibiotics",
    icon: "🦠",
    description: "Medicines for bacterial infections",
  },
  {
    name: "Allergy Care",
    icon: "🤧",
    description: "Medicines for allergy symptoms",
  },
  {
    name: "General Care",
    icon: "🏥",
    description: "Common medicines and healthcare",
  },
];

function Categories({ medicines, addToCart }) {
  const navigate = useNavigate();
  const [startIndex, setStartIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  // Automatically change categories every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setStartIndex((current) => {
        return (current + 1) % categories.length;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Show 4 categories at a time
  const visibleCategories = Array.from({ length: 4 }, (_, index) => {
    return categories[(startIndex + index) % categories.length];
  });

 const relatedMedicines = selectedCategory
  ? medicines.filter(
      (medicine) =>
        medicine.healthCategory?.trim().toLowerCase() ===
          selectedCategory.trim().toLowerCase() ||
        medicine.category?.trim().toLowerCase() ===
          selectedCategory.trim().toLowerCase(),
    )
  : [];

  return (
    <section className="categories-section container">
      <div className="text-center mb-4">
        <h2 className="section-title">Top Categories</h2>

        <p className="section-description">
          Browse medicines by health category.
        </p>
      </div>

      {/* RIGHT TO LEFT CATEGORY SLIDER */}
      <div className="category-slider-wrapper">
        <div className="row g-3 category-slider">
          {visibleCategories.map((category, index) => (
            <div
              className="col-12 col-sm-6 col-lg-3 category-slide-item"
              key={`${category.name}-${index}`}
            >
              <button
                type="button"
                className={`category-card ${
                  selectedCategory === category.name ? "active" : ""
                }`}
                onClick={() => setSelectedCategory(category.name)}
              >
                <div className="category-icon">{category.icon}</div>

                <h5>{category.name}</h5>

                <p>{category.description}</p>

                <span>
                  {selectedCategory === category.name
                    ? "Selected ✓"
                    : "View Medicines →"}
                </span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* CATEGORY DOTS */}
      <div className="category-dots">
        {categories.map((category, index) => (
          <span
            key={category.name}
            className={`category-dot ${index === startIndex ? "active" : ""}`}
          ></span>
        ))}
      </div>

      {/* RELATED MEDICINES */}
      {selectedCategory && (
        <div className="category-medicines">
          <div className="category-medicines-header">
            <div>
              <h3>
                {
                  categories.find(
                    (category) => category.name === selectedCategory,
                  )?.icon
                }{" "}
                {selectedCategory}
              </h3>

              <p>
                {relatedMedicines.length} medicines available in this category
              </p>
            </div>

            <button
              type="button"
              className="category-clear-btn"
              onClick={() => setSelectedCategory(null)}
            >
              ✕ Clear
            </button>
          </div>

          {relatedMedicines.length > 0 ? (
            <div className="row g-3">
              {relatedMedicines.map((medicine) => (
                <div className="col-12 col-md-6 col-xl-4" key={medicine.id}>
                  <div className="category-medicine-card">
                    <div className="category-medicine-top">
                      <div
                        className="category-medicine-icon"
                        onClick={() =>
                          navigate("/medicine-details", {
                            state: { medicine },
                          })
                        }
                        role="button"
                        tabIndex={0}
                      >
                        💊
                      </div>

                      <div className="category-medicine-info">
                        <h5>{medicine.name}</h5>
                        <small>{medicine.category}</small>
                      </div>
                    </div>

                    <div className="category-medicine-details">
                      <strong>₹{medicine.price}</strong>

                      <span
                        className={`category-stock ${
                          medicine.status === "Available"
                            ? "available"
                            : medicine.status === "Low Stock"
                              ? "low-stock"
                              : "out-stock"
                        }`}
                      >
                        {medicine.status === "Available" && "✓ "}
                        {medicine.status === "Low Stock" && "⚠ "}
                        {medicine.status === "Out of Stock" && "✕ "}

                        {medicine.status}
                      </span>
                    </div>

                    <div className="category-medicine-bottom">
                      <small>
                        {medicine.stock > 0
                          ? `${medicine.stock} units available`
                          : "Currently unavailable"}
                      </small>

                      <div className="medicine-card-actions">
                        <button
                          type="button"
                          className="btn btn-outline-primary btn-sm"
                          onClick={() =>
                            navigate("/medicine-details", {
                              state: { medicine },
                            })
                          }
                        >
                          View Details
                        </button>

                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          disabled={medicine.stock === 0}
                          onClick={() => addToCart(medicine)}
                        >
                          🛒 Add
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted mb-0">
                No medicines available in this category.
              </p>
            </div>
          )}
        </div>
      )}

      {/* MEDICINE PRODUCT DETAILS */}
      {selectedMedicine && (
        <div
          className="medicine-details-overlay"
          onClick={() => setSelectedMedicine(null)}
        >
          <div
            className="medicine-details-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="medicine-details-close"
              onClick={() => setSelectedMedicine(null)}
              aria-label="Close medicine details"
            >
              ×
            </button>

            <div className="medicine-details-icon">💊</div>

            <div className="medicine-details-content">
              <span className="medicine-details-category">
                {selectedMedicine.category}
              </span>

              <h3>{selectedMedicine.name}</h3>

              <div className="medicine-details-price">
                ₹{selectedMedicine.price}
                <small> / unit</small>
              </div>

              <div className="medicine-details-status">
                <span
                  className={`category-stock ${
                    selectedMedicine.status === "Available"
                      ? "available"
                      : selectedMedicine.status === "Low Stock"
                        ? "low-stock"
                        : "out-stock"
                  }`}
                >
                  {selectedMedicine.status === "Available" && "✓ "}
                  {selectedMedicine.status === "Low Stock" && "⚠ "}
                  {selectedMedicine.status === "Out of Stock" && "✕ "}
                  {selectedMedicine.status}
                </span>
              </div>

              <div className="medicine-details-info">
                <div>
                  <span>Category</span>
                  <strong>{selectedMedicine.healthCategory}</strong>
                </div>

                <div>
                  <span>Stock</span>
                  <strong>
                    {selectedMedicine.stock > 0
                      ? `${selectedMedicine.stock} units`
                      : "Unavailable"}
                  </strong>
                </div>
              </div>

              <div className="medicine-details-description">
                <h5>About this medicine</h5>

                <p>
                  This medicine is listed under{" "}
                  <strong>{selectedMedicine.healthCategory}</strong>. Please use
                  medicines according to the advice of a qualified doctor or
                  pharmacist.
                </p>
              </div>

              <button
                type="button"
                className="btn btn-primary medicine-details-cart-btn"
                disabled={selectedMedicine.stock === 0}
                onClick={() => {
                  addToCart(selectedMedicine);
                  setSelectedMedicine(null);
                }}
              >
                🛒 Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default Categories;
