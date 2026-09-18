import { useEffect, useState } from "react";

const wellnessCategories = [
  {
    name: "Skin Care",
    icon: "🧴",
    description: "Everyday skincare essentials",
  },
  {
    name: "Baby Essentials",
    icon: "👶",
    description: "Essential products for babies",
  },
  {
    name: "Sexual Wellness",
    icon: "❤️",
    description: "Products for personal wellness",
  },
  {
    name: "Healthy Foods",
    icon: "🥗",
    description: "Healthy food and nutrition",
  },
  {
    name: "Ayurvedic Care",
    icon: "🌿",
    description: "Traditional wellness products",
  },
  {
    name: "Pain Relief",
    icon: "💊",
    description: "Everyday pain relief products",
  },
  {
    name: "Oral Care",
    icon: "🦷",
    description: "Dental and oral care essentials",
  },
  {
    name: "Personal Care",
    icon: "🧼",
    description: "Daily personal care products",
  },
];

function EverydayWellness({ products, addToCart }) {
  const [startIndex, setStartIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Automatic right-to-left category movement
  useEffect(() => {
    const interval = setInterval(() => {
      setStartIndex((current) => {
        return (current + 1) % wellnessCategories.length;
      });
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  // Show 4 cards at a time
  const visibleCategories = Array.from({ length: 4 }, (_, index) => {
    return wellnessCategories[(startIndex + index) % wellnessCategories.length];
  });

  // Products for selected category
  const relatedProducts = selectedCategory
    ? products.filter(
        (product) =>
          product.wellnessCategory === selectedCategory ||
          (product.categoryType === "Everyday Wellness" &&
            product.category?.trim().toLowerCase() ===
              selectedCategory.trim().toLowerCase()),
      )
    : [];

  return (
    <section className="wellness-section container">
      {/* SECTION HEADER */}
      <div className="text-center mb-4">
        <h2 className="section-title">Everyday Wellness</h2>

        <p className="section-description">
          Everything you need for your daily health and wellness.
        </p>
      </div>

      {/* CATEGORY SLIDER */}
      <div className="wellness-slider-wrapper">
        <div className="row g-3 wellness-slider">
          {visibleCategories.map((category, index) => (
            <div
              className="col-12 col-sm-6 col-lg-3 wellness-slide-item"
              key={`${category.name}-${index}`}
            >
              <button
                type="button"
                className={`wellness-card ${
                  selectedCategory === category.name ? "active" : ""
                }`}
                onClick={() => setSelectedCategory(category.name)}
              >
                <div className="wellness-icon">{category.icon}</div>

                <h5>{category.name}</h5>

                <p>{category.description}</p>

                <span>
                  {selectedCategory === category.name
                    ? "Selected ✓"
                    : "View Products →"}
                </span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* CATEGORY DOTS */}
      <div className="wellness-dots">
        {wellnessCategories.map((category, index) => (
          <span
            key={category.name}
            className={`wellness-dot ${index === startIndex ? "active" : ""}`}
          ></span>
        ))}
      </div>

      {/* SELECTED CATEGORY PRODUCTS */}
      {selectedCategory && (
        <div className="wellness-products">
          <div className="wellness-products-header">
            <div>
              <h3>
                {
                  wellnessCategories.find(
                    (category) => category.name === selectedCategory,
                  )?.icon
                }{" "}
                {selectedCategory}
              </h3>

              <p>
                {relatedProducts.length} products available in this category
              </p>
            </div>

            <button
              type="button"
              className="wellness-clear-btn"
              onClick={() => setSelectedCategory(null)}
            >
              ✕ Clear
            </button>
          </div>

          {relatedProducts.length > 0 ? (
            <div className="row g-3">
              {relatedProducts.map((product) => (
                <div className="col-12 col-md-6 col-xl-4" key={product.id}>
                  <div className="wellness-product-card">
                    {/* PRODUCT TOP */}
                    <div className="wellness-product-top">
                      <div
                        className="wellness-product-icon"
                        onClick={() => setSelectedProduct(product)}
                        role="button"
                        tabIndex={0}
                      >
                        {(product.wellnessCategory || product.category) === "Skin Care" && "🧴"}
{(product.wellnessCategory || product.category) === "Baby Essentials" && "👶"}
{(product.wellnessCategory || product.category) === "Sexual Wellness" && "❤️"}
{(product.wellnessCategory || product.category) === "Healthy Foods" && "🥗"}
{(product.wellnessCategory || product.category) === "Ayurvedic Care" && "🌿"}
{(product.wellnessCategory || product.category) === "Pain Relief" && "💊"}
{(product.wellnessCategory || product.category) === "Oral Care" && "🦷"}
{(product.wellnessCategory || product.category) === "Personal Care" && "🧼"}
                      </div>

                      <div className="wellness-product-info">
                        <h5
                          className="wellness-product-name-link"
                          onClick={() => setSelectedProduct(product)}
                        >
                          {product.name}
                        </h5>
                        <small>{product.category}</small>
                      </div>
                    </div>

                    {/* PRICE + STATUS */}
                    <div className="wellness-product-details">
                      <strong>₹{product.price}</strong>

                      <span
                        className={`wellness-stock ${
                          product.status === "Available"
                            ? "available"
                            : product.status === "Low Stock"
                              ? "low-stock"
                              : "out-stock"
                        }`}
                      >
                        {product.status === "Available" && "✓ "}
                        {product.status === "Low Stock" && "⚠ "}
                        {product.status === "Out of Stock" && "✕ "}

                        {product.status}
                      </span>
                    </div>

                    {/* BOTTOM */}
                    <div className="wellness-product-bottom">
                      <small>
                        {product.stock > 0
                          ? `${product.stock} units available`
                          : "Currently unavailable"}
                      </small>

                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        disabled={product.stock === 0}
                        onClick={() => addToCart(product)}
                      >
                        🛒 Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted mb-0">
                No products available in this category.
              </p>
            </div>
          )}
        </div>
      )}

      {/* WELLNESS PRODUCT DETAILS */}
      {selectedProduct && (
        <div
          className="wellness-details-overlay"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="wellness-details-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="wellness-details-close"
              onClick={() => setSelectedProduct(null)}
              aria-label="Close product details"
            >
              ×
            </button>

            <div className="wellness-details-icon">
              {selectedProduct.wellnessCategory === "Skin Care" && "🧴"}
              {selectedProduct.wellnessCategory === "Baby Essentials" && "👶"}
              {selectedProduct.wellnessCategory === "Sexual Wellness" && "❤️"}
              {selectedProduct.wellnessCategory === "Healthy Foods" && "🥗"}
              {selectedProduct.wellnessCategory === "Ayurvedic Care" && "🌿"}
              {selectedProduct.wellnessCategory === "Pain Relief" && "💊"}
              {selectedProduct.wellnessCategory === "Oral Care" && "🦷"}
              {selectedProduct.wellnessCategory === "Personal Care" && "🧼"}
            </div>

            <div className="wellness-details-content">
              <span className="wellness-details-category">
                {selectedProduct.category}
              </span>

              <h3>{selectedProduct.name}</h3>

              <div className="wellness-details-price">
                ₹{selectedProduct.price}
              </div>

              <div className="wellness-details-status">
                <span
                  className={`wellness-stock ${
                    selectedProduct.status === "Available"
                      ? "available"
                      : selectedProduct.status === "Low Stock"
                        ? "low-stock"
                        : "out-stock"
                  }`}
                >
                  {selectedProduct.status === "Available" && "✓ "}
                  {selectedProduct.status === "Low Stock" && "⚠ "}
                  {selectedProduct.status === "Out of Stock" && "✕ "}
                  {selectedProduct.status}
                </span>
              </div>

              <div className="wellness-details-info">
                <div>
                  <span>Category</span>
                  <strong>{selectedProduct.category}</strong>
                </div>

                <div>
                  <span>Stock</span>
                  <strong>
                    {selectedProduct.stock > 0
                      ? `${selectedProduct.stock} units`
                      : "Unavailable"}
                  </strong>
                </div>

                <div>
                  <span>Wellness Category</span>
                  <strong>{selectedProduct.wellnessCategory}</strong>
                </div>
              </div>

              <div className="wellness-details-description">
                <h5>About this product</h5>

                <p>
                  This product is part of our{" "}
                  <strong>{selectedProduct.wellnessCategory}</strong> collection
                  and is currently listed in our wellness store.
                </p>
              </div>

              <button
                type="button"
                className="btn btn-primary wellness-details-cart-btn"
                disabled={selectedProduct.stock === 0}
                onClick={() => {
                  addToCart(selectedProduct);
                  setSelectedProduct(null);
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

export default EverydayWellness;
