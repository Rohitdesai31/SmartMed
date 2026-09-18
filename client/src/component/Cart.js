import React, { useEffect } from "react";
function Cart({
  cart,
  setCart,
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
  subtotal,
  deliveryCharge,
  total,
  onCheckout,
}) {

    useEffect(() => {
    const fetchCart = async () => {
      try {
        const token = localStorage.getItem("smartmedAuthToken");

        if (!token) {
          return;
        }

        const response = await fetch("http://localhost:5000/api/cart", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

       if (!response.ok) {
  console.error("Cart fetch error:", data.message);
  return;
}

console.log("Backend Cart:", data);

const backendMedicineItems = (data.cart?.items || []).map(
  (item) => ({
    id: item.medicine.frontendId,
    backendId: item.medicine._id,
    name: item.medicine.name,
    price: item.medicine.price,
    stock: item.medicine.stock,
    status: item.medicine.status,
    category: item.medicine.category,
    healthCategory: item.medicine.healthCategory,
    expiryDate: item.medicine.expiryDate,
    manufacturer: item.medicine.manufacturer,
    quantity: item.quantity,
    productType: "medicine",
  }),
);

const wellnessItems = cart.filter(
  (item) => item.productType === "wellness",
);

setCart([...wellnessItems, ...backendMedicineItems]);
      } catch (error) {
        console.error("Cart connection error:", error);
      }
    };

    fetchCart();
  }, []);
  return (
    <section className="container mt-5 mb-5">
      <div className="cart-header">
        <h2 className="fw-bold">🛒 Your Cart</h2>
      </div>

      {cart.length === 0 ? (
        <div className="text-center mt-4">
          <div className="card shadow-sm d-inline-block px-4 py-4">
            <h5>🛒 Your cart is empty</h5>
            <p className="text-muted mb-0">Add some medicines to your cart.</p>
          </div>
        </div>
      ) : (
        <>
          {cart.map((medicine) => (
            <div
              className="cart-item-card cart-item-compact mt-3"
              key={medicine.id}
            >
              <div className="medicine-cart-icon">💊</div>

              <div className="medicine-cart-info">
                <h5>{medicine.name}</h5>
                <p>{medicine.category}</p>

                <span className="medicine-stock">✓ {medicine.status}</span>

                <div className="medicine-price">
                  ₹{medicine.price}
                  <small> / unit</small>
                </div>
              </div>

              <div className="quantity-section">
                <span className="quantity-label">Quantity</span>

                <div className="quantity-box">
                  <button onClick={() => decreaseQuantity(medicine.id)}>
                    −
                  </button>

                  <span>{medicine.quantity}</span>

                  <button onClick={() => increaseQuantity(medicine.id)}>
                    +
                  </button>
                </div>
              </div>

              <div className="item-total">
                <small>Total</small>

                <strong>₹{medicine.price * medicine.quantity}</strong>
              </div>

              <button
                className="cart-delete"
                onClick={() => removeFromCart(medicine.id)}
              >
                🗑️
              </button>
            </div>
          ))}

          <div className="card shadow-sm mt-4 cart-summary-card">
            <div className="card-body">
              <h4 className="fw-bold mb-4">📋 Order Summary</h4>

              <div className="d-flex justify-content-between mb-2">
                <span>Total Items</span>
                <strong>
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </strong>
              </div>

              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal</span>
                <strong>₹{subtotal}</strong>
              </div>

              <div className="d-flex justify-content-between mb-3">
                <span>Delivery</span>
                <strong>₹{deliveryCharge}</strong>
              </div>

              <hr />

              <div className="d-flex justify-content-between mb-4">
                <h5>Total</h5>
                <h5 className="text-primary">₹{total}</h5>
              </div>

              <button
                className="btn btn-primary w-100 cart-checkout-btn"
                onClick={onCheckout}
              >
                💳 Proceed to Checkout
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

export default Cart;
