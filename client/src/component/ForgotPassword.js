import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const sendOtp = () => {
    const userEmail = email.trim().toLowerCase();

    if (!userEmail) {
      alert("Please enter your email.");
      return;
    }

    const savedAccounts = JSON.parse(
      localStorage.getItem("smartmedAccounts") || "[]"
    );

    const account = savedAccounts.find(
      (item) => item.email === userEmail
    );

    if (!account) {
      alert("No account found with this email.");
      return;
    }

    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();

    setGeneratedOtp(newOtp);
    setStep(2);

    // Frontend testing only
    alert(`Your SmartMed OTP is: ${newOtp}`);
  };

  const verifyOtp = () => {
    if (!otp.trim()) {
      alert("Please enter the OTP.");
      return;
    }

    if (otp.trim() !== generatedOtp) {
      alert("Invalid OTP. Please try again.");
      return;
    }

    setStep(3);
  };

  const resetPassword = () => {
    if (!newPassword || !confirmPassword) {
      alert("Please fill both password fields.");
      return;
    }

    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters!");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    const savedAccounts = JSON.parse(
      localStorage.getItem("smartmedAccounts") || "[]"
    );

    const updatedAccounts = savedAccounts.map((account) =>
      account.email === email.trim().toLowerCase()
        ? {
            ...account,
            password: newPassword,
          }
        : account
    );

    localStorage.setItem(
      "smartmedAccounts",
      JSON.stringify(updatedAccounts)
    );

    alert("Password reset successfully! 🎉");

    navigate("/");
  };

  return (
    <section className="container login-section">
      <div className="login-card">

        {step === 1 && (
          <>
            <div className="text-center mb-4">
              <div className="login-icon">🔑</div>
              <h2>Forgot Password?</h2>
              <p className="text-muted">
                Enter your registered email to receive an OTP
              </p>
            </div>

            <div className="mb-3">
              <label className="form-label">Email</label>

              <input
                type="email"
                className="form-control"
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button
              className="btn btn-primary w-100"
              onClick={sendOtp}
            >
              📩 Send OTP
            </button>

            <button
              className="btn btn-light w-100 mt-2"
              onClick={() => navigate("/")}
            >
              ← Back to Login
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <div className="text-center mb-4">
              <div className="login-icon">🔐</div>

              <h2>Verify OTP</h2>

              <p className="text-muted">
                Enter the 6-digit OTP sent to your email
              </p>
            </div>

            <div className="mb-3">
              <label className="form-label">OTP</label>

              <input
                type="text"
                className="form-control text-center"
                placeholder="Enter 6-digit OTP"
                maxLength="6"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, ""))
                }
              />
            </div>

            <button
              className="btn btn-primary w-100"
              onClick={verifyOtp}
            >
              ✅ Verify OTP
            </button>

            <button
              className="btn btn-outline-secondary w-100 mt-2"
              onClick={sendOtp}
            >
              🔄 Resend OTP
            </button>

            <button
              className="btn btn-light w-100 mt-2"
              onClick={() => setStep(1)}
            >
              ← Change Email
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <div className="text-center mb-4">
              <div className="login-icon">🔒</div>

              <h2>Reset Password</h2>

              <p className="text-muted">
                Create a new password for your account
              </p>
            </div>

            <div className="mb-3">
              <label className="form-label">New Password</label>

              <input
                type="password"
                className="form-control"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Confirm Password</label>

              <input
                type="password"
                className="form-control"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
              />
            </div>

            <button
              className="btn btn-primary w-100"
              onClick={resetPassword}
            >
              🔐 Reset Password
            </button>
          </>
        )}

      </div>
    </section>
  );
}

export default ForgotPassword;