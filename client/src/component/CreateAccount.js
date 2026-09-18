import React from "react";
import { useNavigate } from "react-router-dom";

function CreateAccount({ registerData, setRegisterData, onAccountCreated }) {
  const navigate = useNavigate();

  return (
    <section className="container create-account-section">
      <div className="create-account-card">
        <div className="text-center create-account-header">
          <div className="create-account-icon">👤</div>
          <h2>Create Account</h2>
          <p>Create your SmartMed account</p>
        </div>

        {/* Name */}
        <div className="mb-2">
          <label className="form-label">Full Name</label>
          <input
            type="text"
            className="form-control"
            placeholder="Enter your name"
            value={registerData.name}
            onChange={(e) =>
              setRegisterData({
                ...registerData,
                name: e.target.value,
              })
            }
          />
        </div>

        {/* Email */}
        <div className="mb-2">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            placeholder="Enter your email"
            value={registerData.email}
            onChange={(e) =>
              setRegisterData({
                ...registerData,
                email: e.target.value,
              })
            }
          />
        </div>

        {/* Mobile */}
        <div className="mb-2">
          <label className="form-label">Mobile Number</label>
          <input
            type="tel"
            className="form-control"
            placeholder="Enter mobile number"
            value={registerData.mobile}
            onChange={(e) =>
              setRegisterData({
                ...registerData,
                mobile: e.target.value,
              })
            }
          />
        </div>

        {/* Password */}
        <div className="mb-2">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            placeholder="Create password"
            value={registerData.password}
            onChange={(e) =>
              setRegisterData({
                ...registerData,
                password: e.target.value,
              })
            }
          />
        </div>

        {/* Confirm Password */}
        <div className="mb-2">
          <label className="form-label">Confirm Password</label>
          <input
            type="password"
            className="form-control"
            placeholder="Confirm password"
            value={registerData.confirmPassword}
            onChange={(e) =>
              setRegisterData({
                ...registerData,
                confirmPassword: e.target.value,
              })
            }
          />
        </div>

        {/* Create Account */}
        <button
          className="btn btn-primary w-100 create-account-btn"
          onClick={async () => {
if (
!registerData.name ||
!registerData.email ||
!registerData.mobile ||
!registerData.password ||
!registerData.confirmPassword
) {
alert("Please fill all fields!");
return;
}

const emailRegex = /^[^\s@]+@[^\s@]+.[^\s@]+$/;

if (!emailRegex.test(registerData.email.trim())) {
alert("Please enter a valid email address!");
return;
}

if (
registerData.password !==
registerData.confirmPassword
) {
alert("Passwords do not match!");
return;
}

const mobileRegex = /^[6-9]\d{9}$/;

if (!mobileRegex.test(registerData.mobile.trim())) {
alert(
"Please enter a valid 10-digit Indian mobile number!"
);
return;
}

if (registerData.password.length < 6) {
alert("Password must be at least 6 characters!");
return;
}

const name = registerData.name.trim();
const email = registerData.email.trim().toLowerCase();
const password = registerData.password;

try {
const response = await fetch(
"http://localhost:5000/api/auth/register",
{
method: "POST",
headers: {
"Content-Type": "application/json",
},
body: JSON.stringify({
name: name,
email: email,
password: password,
}),
}
);


const data = await response.json();

if (!response.ok) {
  alert(
    data.message ||
      "Unable to create your account."
  );
  return;
}

alert("Account created successfully! 🎉");

setRegisterData({
  name: "",
  email: "",
  mobile: "",
  password: "",
  confirmPassword: "",
});

onAccountCreated();

} catch (error) {
console.error(
"Registration Error:",
error
);

alert(
  "Cannot connect to SmartMed server. Please make sure the backend is running."
);

}
}}

        >
          ✅ Create Account
        </button>

        {/* Already have account */}
        <div className="text-center create-account-login">
          <span className="text-muted">Already have an account?</span>

          <button
            className="btn btn-link p-0 ms-2"
            onClick={() => {
              navigate("/");
            }}
          >
            Login
          </button>
        </div>

        {/* Back */}
        <button
          className="btn btn-light w-100 mt-2"
          onClick={() => {
            navigate("/");
          }}
        >
          ← Back
        </button>
      </div>
    </section>
  );
}

export default CreateAccount;
