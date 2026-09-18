
function Footer() {
  return (
    <footer className="smartmed-footer">
      <div className="container">
        <div className="row">

          {/* Company */}
          <div className="col-lg-4 col-md-6 mb-4">
            <h4 className="footer-brand">
              💊 SmartMed
            </h4>

            <p className="footer-description">
              Your trusted online medical store for medicines,
              healthcare products and everyday wellness needs.
            </p>

            <div className="footer-address">
              <p>📍 Pune, Maharashtra, India</p>
              <p>📞 +91 9309046386</p>
              <p>✉️ rohitdesai542@gmail.com</p>
            </div>
          </div>

          {/* Our Services */}
          <div className="col-lg-2 col-md-6 mb-4">
            <h5>Our Services</h5>

            <ul>
              <li>Medicines</li>
              <li>Health Products</li>
              <li>Wellness Products</li>
              <li>Medicine Search</li>
              <li>Health Assistant</li>
            </ul>
          </div>

          {/* Features */}
          <div className="col-lg-2 col-md-6 mb-4">
            <h5>Features</h5>

            <ul>
              <li>Medicine Availability</li>
              <li>Low Stock Alerts</li>
              <li>Online Cart</li>
              <li>Easy Checkout</li>
              <li>Health Information</li>
            </ul>
          </div>

          {/* Categories */}
          <div className="col-lg-2 col-md-6 mb-4">
            <h5>Categories</h5>

            <ul>
              <li>Diabetes Care</li>
              <li>Heart Care</li>
              <li>Digestive Care</li>
              <li>Skin Care</li>
              <li>Personal Care</li>
            </ul>
          </div>

          {/* Help & Social */}
          <div className="col-lg-2 col-md-6 mb-4">
            <h5>Need Help?</h5>

            <ul>
              <li>Contact Us</li>
              <li>FAQs</li>
              <li>Order Help</li>
              <li>Privacy Policy</li>
              <li>Terms & Conditions</li>
            </ul>

            <div className="footer-social">
              <h6>Follow Us</h6>

              <div className="social-icons">
                <a href="https://instagram.com" target="_blank" rel="noreferrer">
                  📷
                </a>

                <a href="https://facebook.com" target="_blank" rel="noreferrer">
                  f
                </a>

                <a href="https://youtube.com" target="_blank" rel="noreferrer">
                  ▶
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom */}
        <div className="footer-bottom">
          <p>
            © 2026 SmartMed. All rights reserved.
          </p>

          <div className="footer-policies">
            <span>Privacy Policy</span>
            <span>Terms & Conditions</span>
            <span>Refund Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
