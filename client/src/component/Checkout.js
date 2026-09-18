import { useState } from "react";

function Checkout({
  cart,
  subtotal,
  deliveryCharge,
  total,
  customer,
  setCustomer,
  onPlaceOrder,
}) {
  const [paymentMethod, setPaymentMethod] = useState("cod");

  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  return (
    <section id="checkout-section" className="container mt-5 mb-5">
      <h2 className="fw-bold mb-4">💳 Checkout</h2>

      <div className="row">
        {/* Delivery Details */}
        <div className="col-lg-7">
          <div className="card shadow-sm">
            <div className="card-body">
              <h4 className="fw-bold mb-4">📦 Delivery Details</h4>

              <input
                type="text"
                className="form-control mb-3"
                placeholder="Full Name"
                value={customer.name}
                onChange={(e) =>
                  setCustomer({ ...customer, name: e.target.value })
                }
              />

              <input
                type="text"
                className="form-control mb-3"
                placeholder="Mobile Number"
                value={customer.mobile}
                onChange={(e) =>
                  setCustomer({ ...customer, mobile: e.target.value })
                }
              />

              <input
                type="email"
                className="form-control mb-3"
                placeholder="Email Address"
                value={customer.email}
                onChange={(e) =>
                  setCustomer({ ...customer, email: e.target.value })
                }
              />

              <textarea
                className="form-control mb-3"
                rows="4"
                placeholder="Delivery Address"
                value={customer.address}
                onChange={(e) =>
                  setCustomer({ ...customer, address: e.target.value })
                }
              ></textarea>

              {/* Payment Method */}
              <div className="payment-section mb-4">
                <h5 className="fw-bold mb-3">💳 Payment Method</h5>

                <div className="payment-options">
                  <label
                    className={`payment-option ${
                      paymentMethod === "cod" ? "payment-option-selected" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />

                    <div>
                      <strong>💵 Cash on Delivery</strong>
                      <small>Pay when your order arrives</small>
                    </div>
                  </label>

                  {paymentMethod === "upi" && (
  <div className="payment-input-box">
    <label className="form-label">
      UPI ID
    </label>

    <input
      type="text"
      className="form-control"
      placeholder="example@upi"
      value={upiId}
      onChange={(e) => setUpiId(e.target.value)}
    />

    <small className="text-muted">
      Enter your valid UPI ID.
    </small>
  </div>
)}

                  <label
                    className={`payment-option ${
                      paymentMethod === "upi" ? "payment-option-selected" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="upi"
                      checked={paymentMethod === "upi"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />

                    <div>
                      <strong>📱 UPI</strong>
                      <small>Google Pay, PhonePe, Paytm and more</small>
                    </div>
                  </label>

                  <label
                    className={`payment-option ${
                      paymentMethod === "card" ? "payment-option-selected" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={paymentMethod === "card"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />

                    <div>
                      <strong>💳 Debit / Credit Card</strong>
                      <small>Secure card payment</small>
                    </div>
                  </label>

                  {paymentMethod === "card" && (
  <div className="payment-input-box">

    <label className="form-label">
      Card Number
    </label>

    <input
      type="text"
      className="form-control mb-3"
      placeholder="1234 5678 9012 3456"
      maxLength="19"
      value={cardNumber}
      onChange={(e) => setCardNumber(e.target.value)}
    />

    <div className="row g-3">

      <div className="col-6">
        <label className="form-label">
          Expiry Date
        </label>

        <input
          type="text"
          className="form-control"
          placeholder="MM/YY"
          maxLength="5"
          value={cardExpiry}
          onChange={(e) =>
            setCardExpiry(e.target.value)
          }
        />
      </div>

      <div className="col-6">
        <label className="form-label">
          CVV
        </label>

        <input
          type="password"
          className="form-control"
          placeholder="CVV"
          maxLength="3"
          value={cardCvv}
          onChange={(e) =>
            setCardCvv(e.target.value)
          }
        />
      </div>

    </div>

    <small className="text-muted d-block mt-2">
      Demo payment form. No real payment is processed.
    </small>

  </div>
)}
                </div>
              </div>

              <button
  className="btn btn-success w-100"
  onClick={() => {
    if (paymentMethod === "upi") {
      if (!upiId.trim()) {
        alert("Please enter your UPI ID.");
        return;
      }
    }

    if (paymentMethod === "card") {
      if (!cardNumber.trim()) {
        alert("Please enter your card number.");
        return;
      }

      if (!cardExpiry.trim()) {
        alert("Please enter card expiry date.");
        return;
      }

      if (!cardCvv.trim()) {
        alert("Please enter CVV.");
        return;
      }
    }

    onPlaceOrder(
  paymentMethod === "cod"
    ? "Cash on Delivery"
    : "Online Payment",
);
  }}
>
  ✅ Place Order
</button>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="col-lg-5">
          <div className="card shadow-sm">
            <div className="card-body">
              <h4 className="fw-bold mb-4">📋 Order Summary</h4>

              {cart.map((item) => (
                <div
                  className="d-flex justify-content-between mb-2"
                  key={item.id}
                >
                  <span>
                    {item.name} × {item.quantity}
                  </span>

                  <strong>₹{item.price * item.quantity}</strong>
                </div>
              ))}

              <hr />

              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal</span>
                <strong>₹{subtotal}</strong>
              </div>

              <div className="d-flex justify-content-between mb-3">
                <span>Delivery</span>
                <strong>₹{deliveryCharge}</strong>
              </div>

              <hr />

              <div className="d-flex justify-content-between">
                <h5>Total</h5>
                <h5 className="text-primary">₹{total}</h5>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Checkout;
