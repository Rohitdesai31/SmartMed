import "./App.css";
import { useEffect, useState } from "react";
import { Routes, Route, Link, Navigate, useNavigate } from "react-router-dom";
import Cart from "./component/Cart";
import Checkout from "./component/Checkout";
import MedicineDetails from "./component/MedicineDetails";

import Categories from "./component/Categories";
import medicines from "./data/medicines";
import EverydayWellness from "./component/EverydayWellness";
import wellnessProducts from "./data/wellnessProducts";
import HealthAssistant from "./component/HealthAssistant";
import Footer from "./component/Footer";
import OrderTracking from "./component/OrderTracking";
import YourOrders from "./component/YourOrders";
import CreateAccount from "./component/CreateAccount";

import ForgotPassword from "./component/ForgotPassword";
import OrderSuccess from "./component/OrderSuccess";

import OwnerDashboard from "./component/OwnerDashboard";

import OwnerInventory from "./component/OwnerInventory";
import OwnerOrderDetails from "./component/OwnerOrderDetails.js";
import OwnerSalesAnalytics from "./component/OwnerSalesAnalytics";
import OwnerCustomers from "./component/OwnerCustomers";

import OwnerReports from "./component/OwnerReports";

const API_BASE_URL = "http://localhost:5000/api";

function App() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const [inventoryMedicines, setInventoryMedicines] = useState(() => {
    try {
      const savedInventory = localStorage.getItem("smartmedMedicineInventory");

      if (savedInventory) {
        const parsedInventory = JSON.parse(savedInventory);

        if (Array.isArray(parsedInventory)) {
          const savedIds = new Set(
            parsedInventory.map((medicine) => medicine.id),
          );

          const missingDefaultMedicines = medicines.filter(
            (medicine) => !savedIds.has(medicine.id),
          );

          return [
            ...parsedInventory.map((medicine) => ({
              ...medicine,
              backendId: medicine.backendId || medicine._id || null,
            })),
            ...missingDefaultMedicines.map((medicine) => ({
              ...medicine,
              backendId: null,
            })),
          ];
        }
      }

      return medicines.map((medicine) => ({
        ...medicine,
        backendId: null,
      }));
    } catch (error) {
      console.error("Failed to load medicine inventory:", error);
      return medicines;
    }
  });

  const [backendMedicines, setBackendMedicines] = useState([]);
  const [inventoryWellnessProducts, setInventoryWellnessProducts] = useState(
    () => {
      try {
        const savedWellnessInventory = localStorage.getItem(
          "smartmedWellnessInventory",
        );

        if (savedWellnessInventory) {
          const parsedWellnessInventory = JSON.parse(savedWellnessInventory);

          if (Array.isArray(parsedWellnessInventory)) {
            return parsedWellnessInventory;
          }
        }

        return wellnessProducts;
      } catch (error) {
        console.error("Failed to load wellness inventory:", error);
        return wellnessProducts;
      }
    },
  );

  const customerMedicines = inventoryMedicines;

  const [results, setResults] = useState([]);
  const [showAllResults, setShowAllResults] = useState(false);
  const [cart, setCart] = useState(() => {
    try {
      const email = localStorage.getItem("smartmedCurrentUserEmail");

      if (!email) {
        return [];
      }

      const key = `smartmedCart_${email.toLowerCase()}`;
      const savedCart = localStorage.getItem(key);

      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error("Failed to load cart:", error);
      return [];
    }
  });

  const [isUser, setIsUser] = useState(
    () => localStorage.getItem("smartmedUserLoggedIn") === "true",
  );

  const [loggedInEmail, setLoggedInEmail] = useState(
    () => localStorage.getItem("smartmedCurrentUserEmail") || "",
  );

  const [userLogin, setUserLogin] = useState({
    email: "",
    password: "",
  });

  const [isOwner, setIsOwner] = useState(
    () => localStorage.getItem("smartmedOwnerLoggedIn") === "true",
  );

  const [selectedOwnerOrder, setSelectedOwnerOrder] = useState(null);

  const [showLogin, setShowLogin] = useState(() => {
    const userLoggedIn =
      localStorage.getItem("smartmedUserLoggedIn") === "true";

    const ownerLoggedIn =
      localStorage.getItem("smartmedOwnerLoggedIn") === "true";

    return !userLoggedIn && !ownerLoggedIn;
  });

  const [loginRole, setLoginRole] = useState(null);

  const [ownerLogin, setOwnerLogin] = useState({
    username: "",
    password: "",
  });

  const [customer, setCustomer] = useState(() => {
    try {
      const email = localStorage.getItem("smartmedCurrentUserEmail");

      if (!email) {
        return {
          name: "",
          mobile: "",
          email: "",
          address: "",
        };
      }

      const key = `smartmedCustomer_${email.toLowerCase()}`;
      const savedCustomer = localStorage.getItem(key);

      return savedCustomer
        ? JSON.parse(savedCustomer)
        : {
            name: "",
            mobile: "",
            email: email.toLowerCase(),
            address: "",
          };
    } catch (error) {
      console.error("Failed to load customer details:", error);

      return {
        name: "",
        mobile: "",
        email: "",
        address: "",
      };
    }
  });

  const [showCreateAccount, setShowCreateAccount] = useState(false);

  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
  });

  const [orders, setOrders] = useState(() => {
    try {
      const userEmail = localStorage.getItem("smartmedCurrentUserEmail");

      // Owner orders will be loaded from MongoDB
      if (localStorage.getItem("smartmedOwnerLoggedIn") === "true") {
        return [];
      }

      // User loads only their own orders from localStorage
      if (userEmail) {
        const key = `smartmedOrders_${userEmail.toLowerCase()}`;
        const savedOrders = localStorage.getItem(key);

        return savedOrders ? JSON.parse(savedOrders) : [];
      }

      return [];
    } catch (error) {
      console.error("Failed to load orders:", error);
      return [];
    }
  });

  const fetchBackendMedicines = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/medicines");

      const data = await response.json();

      if (!response.ok) {
        console.error("Backend medicine fetch error:", data.message);
        return;
      }

      setBackendMedicines(data.medicines || data);

      console.log("Backend Medicines:", data.medicines || data);
      console.log(
        "EVERYDAY WELLNESS BACKEND MEDICINES:",
        (data.medicines || data).filter(
          (medicine) => medicine.categoryType === "Everyday Wellness",
        ),
      );
    } catch (error) {
      console.error("Backend medicine connection error:", error);
    }
  };

  useEffect(() => {
    fetchBackendMedicines();
  }, []);

  useEffect(() => {
    if (backendMedicines.length === 0) {
      return;
    }

    setInventoryMedicines((currentMedicines) => {
      // Update medicines that already exist in frontend inventory
      const updatedMedicines = currentMedicines.map((medicine) => {
        const backendMedicine = backendMedicines.find(
          (item) => item.frontendId === medicine.id,
        );

        if (!backendMedicine) {
          return medicine;
        }

        return {
          ...medicine,
          backendId: backendMedicine._id,
          frontendId: backendMedicine.frontendId,
          name: backendMedicine.name,
          price: backendMedicine.price,
          stock: backendMedicine.stock,
          status: backendMedicine.status,
          category: backendMedicine.category,
          categoryType:
            backendMedicine.categoryType || medicine.categoryType || "Top Care",
          healthCategory:
            backendMedicine.healthCategory || medicine.healthCategory || "",
          description:
            backendMedicine.description || medicine.description || "",
          expiryDate: backendMedicine.expiryDate || medicine.expiryDate || "",
          manufacturer:
            backendMedicine.manufacturer || medicine.manufacturer || "",
          productType: medicine.productType || "medicine",
        };
      });

      // Find medicines that exist in MongoDB
      // but are not yet present in frontend inventory
      const existingBackendIds = new Set(
        updatedMedicines.map((medicine) => medicine.backendId).filter(Boolean),
      );

      const existingFrontendIds = new Set(
        updatedMedicines.map((medicine) => medicine.id).filter(Boolean),
      );

      const newBackendMedicines = backendMedicines
        .filter(
          (medicine) =>
            !existingBackendIds.has(medicine._id) &&
            !existingFrontendIds.has(medicine.frontendId),
        )
        .map((medicine) => ({
          ...medicine,
          id: medicine.frontendId || medicine._id,
          frontendId: medicine.frontendId,
          backendId: medicine._id,
          productType: "medicine",
          categoryType: medicine.categoryType || "Top Care",
        }));

      return [...updatedMedicines, ...newBackendMedicines];
    });
  }, [backendMedicines]);

  useEffect(() => {
    const verifyAuthToken = async () => {
      const token = localStorage.getItem("smartmedAuthToken");

      if (!token) {
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          // Token is invalid or expired
          localStorage.removeItem("smartmedAuthToken");

          localStorage.removeItem("smartmedUserLoggedIn");

          localStorage.removeItem("smartmedOwnerLoggedIn");

          localStorage.removeItem("smartmedCurrentUserEmail");

          localStorage.removeItem("smartmedUserRole");

          setIsUser(false);
          setIsOwner(false);
          setLoggedInEmail("");
          setShowLogin(true);

          return;
        }

        // Backend confirms the authenticated user
        const authenticatedUser = data.user;

        if (authenticatedUser.role === "owner") {
          localStorage.setItem("smartmedOwnerLoggedIn", "true");

          localStorage.setItem("smartmedUserRole", "owner");

          localStorage.removeItem("smartmedUserLoggedIn");

          localStorage.removeItem("smartmedCurrentUserEmail");

          setIsOwner(true);
          setIsUser(false);
          setLoggedInEmail("");
          setShowLogin(false);
        } else if (authenticatedUser.role === "user") {
          const email = authenticatedUser.email.trim().toLowerCase();

          localStorage.setItem("smartmedUserLoggedIn", "true");

          localStorage.setItem("smartmedUserRole", "user");

          localStorage.setItem("smartmedCurrentUserEmail", email);

          localStorage.removeItem("smartmedOwnerLoggedIn");

          setIsUser(true);
          setIsOwner(false);
          setLoggedInEmail(email);
          setShowLogin(false);
        }
      } catch (error) {
        console.error("Authentication Verification Error:", error);
      }
    };

    verifyAuthToken();
  }, []);

  useEffect(() => {
    if (!loggedInEmail) {
      return;
    }

    const key = `smartmedCart_${loggedInEmail.toLowerCase()}`;

    localStorage.setItem(key, JSON.stringify(cart));
  }, [cart, loggedInEmail]);

  useEffect(() => {
    localStorage.setItem(
      "smartmedMedicineInventory",
      JSON.stringify(inventoryMedicines),
    );
  }, [inventoryMedicines]);

  useEffect(() => {
    localStorage.setItem(
      "smartmedWellnessInventory",
      JSON.stringify(inventoryWellnessProducts),
    );
  }, [inventoryWellnessProducts]);

  // Reload the current user's orders from localStorage
  useEffect(() => {
    if (!loggedInEmail || isOwner) {
      return;
    }

    try {
      const email = loggedInEmail.trim().toLowerCase();
      const key = `smartmedOrders_${email}`;

      const savedOrders = localStorage.getItem(key);

      if (savedOrders) {
        const parsedOrders = JSON.parse(savedOrders);

        if (Array.isArray(parsedOrders)) {
          setOrders(parsedOrders);
        }
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error("Failed to reload user orders:", error);
      setOrders([]);
    }
  }, [loggedInEmail, isOwner]);

  // Load owner orders from MongoDB
  useEffect(() => {
    if (!isOwner) {
      return;
    }

    const loadOwnerOrders = async () => {
      try {
        const token = localStorage.getItem("smartmedAuthToken");

        if (!token) {
          console.error("Owner authentication token not found.");
          return;
        }

        const response = await fetch("http://localhost:5000/api/orders/all", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        console.log("OWNER API RESPONSE:", data);
        console.log("OWNER ORDER COUNT:", data.orders?.length);
        if (!response.ok) {
          throw new Error(data.message || "Failed to load owner orders");
        }

        if (Array.isArray(data)) {
          setOrders(data);
        } else if (Array.isArray(data.orders)) {
          setOrders(data.orders);
        } else {
          setOrders([]);
        }
      } catch (error) {
        console.error("Failed to load owner orders from MongoDB:", error);
      }
    };

    loadOwnerOrders();
  }, [isOwner]);

  // Save checkout customer details for the logged-in user
  useEffect(() => {
    if (!loggedInEmail || isOwner) {
      return;
    }

    const key = `smartmedCustomer_${loggedInEmail.toLowerCase()}`;

    localStorage.setItem(key, JSON.stringify(customer));
  }, [customer, loggedInEmail, isOwner]);

  useEffect(() => {
    if (!Array.isArray(orders)) {
      return;
    }

    // Owner: save all orders
    if (isOwner) {
      const uniqueOrders = Array.from(
        new Map(orders.map((order) => [order.orderId, order])).values(),
      );

      localStorage.setItem("smartmedAllOrders", JSON.stringify(uniqueOrders));

      return;
    }

    // User: save only the orders already loaded for this user
    if (loggedInEmail) {
      const email = loggedInEmail.trim().toLowerCase();
      const key = `smartmedOrders_${email}`;

      localStorage.setItem(key, JSON.stringify(orders));
    }
  }, [orders, loggedInEmail, isOwner]);

  // Search medicine
  const handleSearch = () => {
    const searchTerm = search.trim().toLowerCase();

    if (searchTerm === "") {
      setResults([]);
      return;
    }

    const medicineResults = customerMedicines.filter((medicine) =>
      medicine.name.toLowerCase().includes(searchTerm),
    );

    const wellnessResults = inventoryWellnessProducts.filter((product) =>
      product.name.toLowerCase().includes(searchTerm),
    );

    setResults([...medicineResults, ...wellnessResults]);
  };
  // Add medicine or wellness product to cart
  const addToCart = async (product) => {
    const isWellnessProduct = inventoryWellnessProducts.some(
      (item) => item.id === product.id,
    );

    console.log("Selected product:", product);
    console.log("Product ID:", product.id);
    console.log("Product Mongo ID:", product._id);
    console.log("Product Backend ID:", product.backendId);
    const productType = isWellnessProduct ? "wellness" : "medicine";

    // Wellness products continue using the existing frontend cart
    if (productType === "wellness") {
      const existingProduct = cart.find(
        (item) => item.id === product.id && item.productType === productType,
      );

      if (existingProduct) {
        setCart(
          cart.map((item) =>
            item.id === product.id && item.productType === productType
              ? {
                  ...item,
                  quantity: item.quantity + 1,
                }
              : item,
          ),
        );
      } else {
        setCart([
          ...cart,
          {
            ...product,
            productType: productType,
            quantity: 1,
          },
        ]);
      }

      return;
    }

    // Medicine → Backend Cart
    try {
      const token = localStorage.getItem("smartmedAuthToken");

      if (!token) {
        alert("Please login first.");
        return;
      }

      const response = await fetch("http://localhost:5000/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          medicineId: product.backendId,
          quantity: 1,
        }),
      });

      const data = await response.json();

      console.log("Backend Cart Response JSON:", JSON.stringify(data));

      if (!response.ok) {
        alert(data.message || "Unable to add medicine to cart.");
        return;
      }

      console.log("Medicine added to backend cart:", data);

      // Keep existing frontend cart UI working for now
      const existingProduct = cart.find(
        (item) => item.id === product.id && item.productType === "medicine",
      );

      if (existingProduct) {
        setCart(
          cart.map((item) =>
            item.id === product.id && item.productType === "medicine"
              ? {
                  ...item,
                  quantity: item.quantity + 1,
                }
              : item,
          ),
        );
      } else {
        setCart([
          ...cart,
          {
            ...product,
            productType: "medicine",
            quantity: 1,
          },
        ]);
      }
    } catch (error) {
      console.error("Add to cart error:", error);
      alert("Unable to connect to SmartMed server.");
    }
  };

  // Increase quantity
  const increaseQuantity = async (id) => {
    const item = cart.find((item) => item.id === id);

    if (!item) {
      return;
    }

    // Wellness products continue to use frontend/localStorage logic
    if (item.productType === "wellness") {
      setCart(
        cart.map((cartItem) =>
          cartItem.id === id
            ? {
                ...cartItem,
                quantity: cartItem.quantity + 1,
              }
            : cartItem,
        ),
      );

      return;
    }

    // Medicine quantity is managed by backend
    try {
      const token = localStorage.getItem("smartmedAuthToken");

      if (!token) {
        alert("Please login first.");
        return;
      }

      if (!item.backendId) {
        alert("Medicine backend ID not found.");
        return;
      }

      const newQuantity = item.quantity + 1;

      const response = await fetch(
        `http://localhost:5000/api/cart/${item.backendId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            quantity: newQuantity,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Unable to increase quantity.");
        return;
      }

      const updatedMedicineItems = (data.cart?.items || []).map((cartItem) => ({
        id: cartItem.medicine.frontendId,
        backendId: cartItem.medicine._id,
        name: cartItem.medicine.name,
        price: cartItem.medicine.price,
        stock: cartItem.medicine.stock,
        status: cartItem.medicine.status,
        category: cartItem.medicine.category,
        healthCategory: cartItem.medicine.healthCategory,
        expiryDate: cartItem.medicine.expiryDate,
        manufacturer: cartItem.medicine.manufacturer,
        quantity: cartItem.quantity,
        productType: "medicine",
      }));

      const wellnessItems = cart.filter(
        (cartItem) => cartItem.productType === "wellness",
      );

      setCart([...wellnessItems, ...updatedMedicineItems]);
    } catch (error) {
      console.error("Increase quantity error:", error);
      alert("Unable to connect to SmartMed server.");
    }
  };

  // Decrease quantity
  // Decrease quantity
  const decreaseQuantity = async (id) => {
    const item = cart.find((item) => item.id === id);

    if (!item) {
      return;
    }

    // Wellness products continue to use frontend/localStorage logic
    if (item.productType === "wellness") {
      if (item.quantity <= 1) {
        return;
      }

      setCart(
        cart.map((cartItem) =>
          cartItem.id === id
            ? {
                ...cartItem,
                quantity: cartItem.quantity - 1,
              }
            : cartItem,
        ),
      );

      return;
    }

    // Medicine quantity is managed by backend
    try {
      const token = localStorage.getItem("smartmedAuthToken");

      if (!token) {
        alert("Please login first.");
        return;
      }

      if (!item.backendId) {
        alert("Medicine backend ID not found.");
        return;
      }

      // Don't allow medicine quantity to go below 1
      if (item.quantity <= 1) {
        return;
      }

      const newQuantity = item.quantity - 1;

      const response = await fetch(
        `http://localhost:5000/api/cart/${item.backendId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            quantity: newQuantity,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Unable to decrease quantity.");
        return;
      }

      const updatedMedicineItems = (data.cart?.items || []).map((cartItem) => ({
        id: cartItem.medicine.frontendId,
        backendId: cartItem.medicine._id,
        name: cartItem.medicine.name,
        price: cartItem.medicine.price,
        stock: cartItem.medicine.stock,
        status: cartItem.medicine.status,
        category: cartItem.medicine.category,
        healthCategory: cartItem.medicine.healthCategory,
        expiryDate: cartItem.medicine.expiryDate,
        manufacturer: cartItem.medicine.manufacturer,
        quantity: cartItem.quantity,
        productType: "medicine",
      }));

      const wellnessItems = cart.filter(
        (cartItem) => cartItem.productType === "wellness",
      );

      setCart([...wellnessItems, ...updatedMedicineItems]);
    } catch (error) {
      console.error("Decrease quantity error:", error);
      alert("Unable to connect to SmartMed server.");
    }
  };

  // Remove medicine
  const removeFromCart = async (id) => {
    const item = cart.find((item) => item.id === id);

    if (!item) {
      return;
    }

    // Wellness products continue using frontend/localStorage logic
    if (item.productType === "wellness") {
      setCart(
        cart.filter(
          (cartItem) =>
            !(cartItem.id === id && cartItem.productType === "wellness"),
        ),
      );

      return;
    }

    // Medicine is removed from backend cart
    try {
      const token = localStorage.getItem("smartmedAuthToken");

      if (!token) {
        alert("Please login first.");
        return;
      }

      if (!item.backendId) {
        alert("Medicine backend ID not found.");
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/cart/${item.backendId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Unable to remove medicine.");
        return;
      }

      const updatedMedicineItems = (data.cart?.items || []).map((cartItem) => ({
        id: cartItem.medicine.frontendId,
        backendId: cartItem.medicine._id,
        name: cartItem.medicine.name,
        price: cartItem.medicine.price,
        stock: cartItem.medicine.stock,
        status: cartItem.medicine.status,
        category: cartItem.medicine.category,
        healthCategory: cartItem.medicine.healthCategory,
        expiryDate: cartItem.medicine.expiryDate,
        manufacturer: cartItem.medicine.manufacturer,
        quantity: cartItem.quantity,
        productType: "medicine",
      }));

      const wellnessItems = cart.filter(
        (cartItem) => cartItem.productType === "wellness",
      );

      setCart([...wellnessItems, ...updatedMedicineItems]);
    } catch (error) {
      console.error("Remove from cart error:", error);
      alert("Unable to connect to SmartMed server.");
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    navigate("/checkout");
  };

  const handleUpdateMedicineStock = async (medicineId, newStock) => {
    const stock = Math.max(0, Number(newStock) || 0);

    const medicine = inventoryMedicines.find((item) => item.id === medicineId);

    if (!medicine) return;

    // Only block static wellness products.
    // Backend medicines, including Everyday Wellness medicines,
    // must still be allowed to use their MongoDB _id.
    const isBackendMedicine = medicine.backendId || medicine._id;

    if (medicine.productType === "wellness" && !isBackendMedicine) {
      window.alert("Wellness products are managed separately.");
      return;
    }

    const backendId = medicine.backendId || medicine._id;

    if (!backendId) {
      window.alert("This medicine is not connected to the backend yet.");
      return;
    }

    if (!backendId) {
      window.alert("This medicine is not connected to the backend yet.");
      return;
    }

    try {
      const token = localStorage.getItem("smartmedAuthToken");

      if (!token) {
        window.alert("Please login first.");
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/medicines/${backendId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            stock,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        window.alert(data.message || "Unable to update stock.");
        return;
      }

      const updatedMedicine = data.medicine;

      setInventoryMedicines((previousMedicines) =>
        previousMedicines.map((item) => {
          if (item.id !== medicineId) {
            return item;
          }

          return {
            ...item,
            backendId: updatedMedicine._id,
            stock: updatedMedicine.stock,
            status: updatedMedicine.status,
          };
        }),
      );

      // Keep backend medicine state synchronized
      setBackendMedicines((previousMedicines) =>
        previousMedicines.map((item) =>
          item._id === updatedMedicine._id ? updatedMedicine : item,
        ),
      );
    } catch (error) {
      console.error("Update medicine stock error:", error);
      window.alert("Unable to connect to SmartMed server.");
    }
  };

  const handleAddMedicine = async (newMedicine) => {
    const token = localStorage.getItem("smartmedAuthToken");

    if (!token) {
      window.alert("Please login first.");
      return;
    }

    try {
      // Check whether the same medicine already exists
      const existingMedicine = inventoryMedicines.find(
        (medicine) =>
          medicine.productType !== "wellness" &&
          (medicine.backendId || medicine._id) &&
          medicine.name?.trim().toLowerCase() ===
            newMedicine.name?.trim().toLowerCase() &&
          medicine.category?.trim().toLowerCase() ===
            newMedicine.category?.trim().toLowerCase(),
      );

      // --------------------------------------------------
      // CASE 1: Medicine already exists
      // Increase its backend stock instead of creating duplicate
      // --------------------------------------------------
      if (existingMedicine) {
        let backendId = existingMedicine.backendId || existingMedicine._id;

        // If frontend inventory doesn't have backendId,
        // try to find the medicine directly in backend data.
        if (!backendId) {
          const backendMatch = backendMedicines.find(
            (medicine) =>
              medicine.name?.trim().toLowerCase() ===
                newMedicine.name?.trim().toLowerCase() &&
              medicine.category?.trim().toLowerCase() ===
                newMedicine.category?.trim().toLowerCase(),
          );

          if (backendMatch) {
            backendId = backendMatch._id;
          }
        }

        if (!backendId) {
          window.alert("This medicine is not connected to the backend yet.");
          return;
        }

        const newStock =
          Number(existingMedicine.stock || 0) + Number(newMedicine.stock || 0);

        const response = await fetch(
          `http://localhost:5000/api/medicines/${backendId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              stock: newStock,
            }),
          },
        );

        const data = await response.json();

        if (!response.ok) {
          window.alert(data.message || "Unable to update medicine stock.");
          return;
        }

        const updatedMedicine = data.medicine;

        // Update frontend inventory
        setInventoryMedicines((previousMedicines) =>
          previousMedicines.map((medicine) => {
            if (medicine.id !== existingMedicine.id) {
              return medicine;
            }

            return {
              ...medicine,
              backendId: updatedMedicine._id,
              stock: updatedMedicine.stock,
              status: updatedMedicine.status,
            };
          }),
        );

        // Update backend medicine state
        setBackendMedicines((previousMedicines) =>
          previousMedicines.map((medicine) =>
            medicine._id === updatedMedicine._id ? updatedMedicine : medicine,
          ),
        );

        window.alert(
          "Medicine already exists. Stock has been increased successfully.",
        );

        return;
      }

      // --------------------------------------------------
      // CASE 2: New medicine
      // Create it in MongoDB
      // --------------------------------------------------

      const frontendId = Date.now();

      const response = await fetch("http://localhost:5000/api/medicines", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          frontendId,
          name: newMedicine.name,
          price: Number(newMedicine.price),
          stock: Number(newMedicine.stock),
          categoryType: newMedicine.categoryType,
          category: newMedicine.category,
          healthCategory: newMedicine.healthCategory || "",
          description: newMedicine.description || "",
          expiryDate: newMedicine.expiryDate,
          manufacturer: newMedicine.manufacturer || "",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        window.alert(data.message || "Unable to add medicine.");
        return;
      }

      const createdMedicine = data.medicine;

      // Create frontend version while preserving
      // the extra Owner Inventory fields.
      const medicineForFrontend = {
        ...newMedicine,
        id: frontendId,
        frontendId: createdMedicine.frontendId,
        backendId: createdMedicine._id,
        stock: createdMedicine.stock,
        status: createdMedicine.status,
        productType: "medicine",
      };

      // Add to frontend inventory
      setInventoryMedicines((previousMedicines) => [
        ...previousMedicines,
        medicineForFrontend,
      ]);

      // Add to backend medicine state
      setBackendMedicines((previousMedicines) => [
        ...previousMedicines,
        createdMedicine,
      ]);

      window.alert("Medicine added successfully.");
    } catch (error) {
      console.error("Add medicine error:", error);

      window.alert("Unable to connect to SmartMed server.");
    }
  };

  const handleUpdateWellnessStock = (productId, newStock) => {
    const stock = Number(newStock);

    const newStatus =
      stock === 0 ? "Out of Stock" : stock <= 10 ? "Low Stock" : "Available";

    setInventoryWellnessProducts((previousProducts) =>
      previousProducts.map((product) =>
        product.id === productId
          ? {
              ...product,
              stock,
              status: newStatus,
            }
          : product,
      ),
    );
  };
  const handleEditMedicine = async (updatedMedicine) => {
    const token = localStorage.getItem("smartmedAuthToken");

    if (!token) {
      window.alert("Please login first.");
      return;
    }

    const medicine = inventoryMedicines.find(
      (item) => item.id === updatedMedicine.id,
    );

    if (!medicine) {
      window.alert("Medicine not found.");
      return;
    }

    if (medicine.productType === "wellness") {
      window.alert("Wellness products are managed separately.");
      return;
    }

    const backendId = medicine.backendId || medicine._id;

    if (!backendId) {
      window.alert("This medicine is not connected to the backend yet.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/medicines/${backendId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: updatedMedicine.name,
            price: Number(updatedMedicine.price),
            stock: Number(updatedMedicine.stock),
            categoryType: updatedMedicine.categoryType,
            category: updatedMedicine.category,
            healthCategory: updatedMedicine.healthCategory || "",
            description: updatedMedicine.description || "",
            expiryDate: updatedMedicine.expiryDate,
            manufacturer: updatedMedicine.manufacturer || "",
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        window.alert(data.message || "Unable to update medicine.");
        return;
      }

      const updatedBackendMedicine = data.medicine;

      setInventoryMedicines((previousMedicines) =>
        previousMedicines.map((medicine) => {
          if (medicine.id !== updatedMedicine.id) {
            return medicine;
          }

          return {
            ...medicine,
            ...updatedMedicine,
            backendId: updatedBackendMedicine._id,
            frontendId: updatedBackendMedicine.frontendId,
            name: updatedBackendMedicine.name,
            price: updatedBackendMedicine.price,
            stock: updatedBackendMedicine.stock,
            status: updatedBackendMedicine.status,
            categoryType: updatedBackendMedicine.categoryType,
            category: updatedBackendMedicine.category,
            healthCategory: updatedBackendMedicine.healthCategory || "",
            description: updatedBackendMedicine.description || "",
            expiryDate: updatedBackendMedicine.expiryDate,
            manufacturer: updatedBackendMedicine.manufacturer || "",
            productType: "medicine",
          };
        }),
      );

      setBackendMedicines((previousMedicines) =>
        previousMedicines.map((medicine) =>
          medicine._id === updatedBackendMedicine._id
            ? updatedBackendMedicine
            : medicine,
        ),
      );

      window.alert("Medicine updated successfully.");
    } catch (error) {
      console.error("Edit medicine error:", error);
      window.alert("Unable to connect to SmartMed server.");
    }
  };

  const handleDeleteMedicine = async (medicineId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this medicine?",
    );

    if (!confirmDelete) {
      return;
    }

    const medicine =
      inventoryMedicines.find((item) => item.id === medicineId) ||
      backendMedicines.find(
        (item) => item.frontendId === medicineId || item._id === medicineId,
      );

    if (!medicine) {
      window.alert("Medicine not found.");
      return;
    }

    if (medicine.productType === "wellness") {
      window.alert("Wellness products are managed separately.");
      return;
    }

    const backendId =
      medicine.backendId ||
      medicine._id ||
      backendMedicines.find(
        (item) => item.frontendId === medicineId || item._id === medicineId,
      )?._id;

    if (!backendId) {
      window.alert("This medicine is not connected to the backend yet.");
      return;
    }

    const token = localStorage.getItem("smartmedAuthToken");

    if (!token) {
      window.alert("Please login first.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/medicines/${backendId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        window.alert(data.message || "Unable to delete medicine.");
        return;
      }

      setInventoryMedicines((previousMedicines) =>
        previousMedicines.filter((item) => item.id !== medicineId),
      );

      setBackendMedicines((previousMedicines) =>
        previousMedicines.filter((item) => item._id !== backendId),
      );

      window.alert("Medicine deleted successfully.");
    } catch (error) {
      console.error("Delete medicine error:", error);
      window.alert("Unable to connect to SmartMed server.");
    }
  };

  const handlePlaceOrder = async (paymentMethod) => {
    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    if (
      !customer.name ||
      !customer.mobile ||
      !customer.email ||
      !customer.address
    ) {
      alert("Please fill all delivery details.");
      return;
    }

    // ================= CHECK MEDICINE STOCK =================

    const medicineCartItems = cart.filter(
      (item) => item.productType === "medicine",
    );

    const wellnessCartItems = cart.filter(
      (item) => item.productType === "wellness",
    );

    const stockErrorItem = medicineCartItems.find((cartItem) => {
      const inventoryItem = inventoryMedicines.find(
        (medicine) => medicine.id === cartItem.id,
      );

      if (!inventoryItem) {
        return false;
      }

      return Number(inventoryItem.stock) < Number(cartItem.quantity);
    });

    if (stockErrorItem) {
      alert(`${stockErrorItem.name} does not have enough stock available.`);
      return;
    }

    // ================= CHECK WELLNESS STOCK =================

    const wellnessStockErrorItem = wellnessCartItems.find((cartItem) => {
      const wellnessItem = inventoryWellnessProducts.find(
        (product) => product.id === cartItem.id,
      );

      if (!wellnessItem) {
        return false;
      }

      return Number(wellnessItem.stock) < Number(cartItem.quantity);
    });

    if (wellnessStockErrorItem) {
      alert(
        `${wellnessStockErrorItem.name} does not have enough stock available.`,
      );
      return;
    }

    // ================= PLACE MEDICINE ORDER IN BACKEND =================

    let backendOrder = null;

    if (medicineCartItems.length > 0) {
      try {
        const token = localStorage.getItem("smartmedAuthToken");

        if (!token) {
          alert("Please login first.");
          return;
        }

        const response = await fetch("http://localhost:5000/api/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: customer.name,
            mobile: customer.mobile,
            email: customer.email,
            address: customer.address,
            paymentMethod: paymentMethod,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          alert(data.message || "Unable to place medicine order.");
          return;
        }

        backendOrder = data.order;

        console.log("Backend Order Created:", backendOrder);
      } catch (error) {
        console.error("Backend order error:", error);

        alert("Unable to connect to SmartMed server.");

        return;
      }
    }

    // ================= DECREASE FRONTEND MEDICINE STOCK =================
    // This keeps the existing frontend inventory display synchronized.
    // MongoDB stock has already been reduced by the backend.

    setInventoryMedicines((previousMedicines) =>
      previousMedicines.map((medicine) => {
        const orderedItem = medicineCartItems.find(
          (cartItem) => cartItem.id === medicine.id,
        );

        if (!orderedItem) {
          return medicine;
        }

        const newStock = Number(medicine.stock) - Number(orderedItem.quantity);

        const newStatus =
          newStock === 0
            ? "Out of Stock"
            : newStock <= 10
              ? "Low Stock"
              : "Available";

        return {
          ...medicine,
          stock: newStock,
          status: newStatus,
        };
      }),
    );

    // ================= DECREASE WELLNESS STOCK =================

    setInventoryWellnessProducts((previousProducts) =>
      previousProducts.map((product) => {
        const orderedItem = wellnessCartItems.find(
          (cartItem) =>
            cartItem.id === product.id && cartItem.productType === "wellness",
        );

        if (!orderedItem) {
          return product;
        }

        const newStock = Number(product.stock) - Number(orderedItem.quantity);

        const newStatus =
          newStock === 0
            ? "Out of Stock"
            : newStock <= 10
              ? "Low Stock"
              : "Available";

        return {
          ...product,
          stock: newStock,
          status: newStatus,
        };
      }),
    );

    // ================= CREATE FRONTEND ORDER =================

    const orderId = backendOrder?.orderId || `SM${Date.now()}`;

    const newOrder = {
      orderId: orderId,

      items: cart,

      stockDeducted: true,

      stockRestored: false,

      customer: {
        name: customer.name,
        mobile: customer.mobile,
        email: customer.email,
        address: customer.address,
      },

      subtotal: subtotal,

      deliveryCharge: deliveryCharge,

      total: total,

      paymentMethod: paymentMethod,

      status: "placed",

      trackingStep: 0,

      createdAt: backendOrder?.createdAt || new Date().toISOString(),
    };

    // ================= ADD ORDER TO REACT STATE =================

    setOrders((previousOrders) => {
      const updatedOrders = [newOrder, ...previousOrders];

      return updatedOrders;
    });

    // ================= SAVE ALL ORDERS =================

    const savedAllOrders = localStorage.getItem("smartmedAllOrders");

    const existingAllOrders = savedAllOrders ? JSON.parse(savedAllOrders) : [];

    const updatedAllOrders = [
      newOrder,
      ...existingAllOrders.filter(
        (order) => order.orderId !== newOrder.orderId,
      ),
    ];

    localStorage.setItem("smartmedAllOrders", JSON.stringify(updatedAllOrders));

    // ================= SAVE USER ORDERS =================

    if (loggedInEmail) {
      const userEmail = loggedInEmail.trim().toLowerCase();

      const userOrdersKey = `smartmedOrders_${userEmail}`;

      const savedUserOrders = localStorage.getItem(userOrdersKey);

      const existingUserOrders = savedUserOrders
        ? JSON.parse(savedUserOrders)
        : [];

      const updatedUserOrders = [
        newOrder,
        ...existingUserOrders.filter(
          (order) => order.orderId !== newOrder.orderId,
        ),
      ];

      localStorage.setItem(userOrdersKey, JSON.stringify(updatedUserOrders));
    }

    // ================= CLEAR CART =================

    setCart([]);

    setCustomer({
      name: "",
      mobile: "",
      email: "",
      address: "",
    });

    if (loggedInEmail) {
      localStorage.removeItem(
        `smartmedCustomer_${loggedInEmail.toLowerCase()}`,
      );
    }

    // ================= ORDER SUCCESS =================

    navigate("/order-success", {
      state: {
        order: newOrder,
      },
    });
  };

  // Load all customer orders for owner dashboard
  const loadAllOrdersForOwner = () => {
    try {
      const savedAllOrders = localStorage.getItem("smartmedAllOrders");

      if (!savedAllOrders) {
        return [];
      }

      const parsedOrders = JSON.parse(savedAllOrders);

      if (!Array.isArray(parsedOrders)) {
        return [];
      }

      return Array.from(
        new Map(parsedOrders.map((order) => [order.orderId, order])).values(),
      ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
      console.error("Failed to load owner orders:", error);

      return [];
    }
  };

  // Cancel order

  const handleCancelOrder = async (orderId) => {
    const orderToCancel = orders.find((order) => order.orderId === orderId);

    if (!orderToCancel) {
      return false;
    }

    if (orderToCancel.status === "cancelled") {
      window.alert("This order is already cancelled.");
      return false;
    }

    if (orderToCancel.status === "delivered") {
      window.alert("Delivered orders cannot be cancelled.");
      return false;
    }

    const confirmCancel = window.confirm(
      `Are you sure you want to cancel order ${orderId}?`,
    );

    if (!confirmCancel) {
      return;
    }

    // ================= CANCEL ORDER IN BACKEND =================

    try {
      const token = localStorage.getItem("smartmedAuthToken");

      if (!token) {
        window.alert("Please login first.");
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/orders/${orderId}/cancel`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        window.alert(data.message || "Unable to cancel order.");
        return false;
      }

      console.log("Backend Order Cancelled:", data.order);

      // ================= CREATE UPDATED ORDER =================

      const cancelledOrder = {
        ...orderToCancel,
        status: "cancelled",
        cancelledAt: new Date().toISOString(),
        stockRestored: true,
      };

      // ================= UPDATE REACT ORDER STATE =================

      const updatedOrders = orders.map((order) =>
        order.orderId === orderId ? cancelledOrder : order,
      );

      setOrders(updatedOrders);

      // ================= UPDATE OWNER LOCAL STORAGE =================

      const savedAllOrders = localStorage.getItem("smartmedAllOrders");

      const existingAllOrders = savedAllOrders
        ? JSON.parse(savedAllOrders)
        : [];

      const updatedAllOrders = existingAllOrders.map((order) =>
        order.orderId === orderId ? cancelledOrder : order,
      );

      localStorage.setItem(
        "smartmedAllOrders",
        JSON.stringify(updatedAllOrders),
      );

      // ================= UPDATE CUSTOMER LOCAL STORAGE =================

      if (cancelledOrder?.customer?.email) {
        const customerEmail = cancelledOrder.customer.email
          .trim()
          .toLowerCase();

        const customerOrdersKey = `smartmedOrders_${customerEmail}`;

        const savedCustomerOrders = localStorage.getItem(customerOrdersKey);

        const customerOrders = savedCustomerOrders
          ? JSON.parse(savedCustomerOrders)
          : [];

        const updatedCustomerOrders = customerOrders.map((order) =>
          order.orderId === orderId ? cancelledOrder : order,
        );

        localStorage.setItem(
          customerOrdersKey,
          JSON.stringify(updatedCustomerOrders),
        );
      }

      await fetchBackendMedicines();
      window.alert("Order cancelled successfully.");
      return true;
    } catch (error) {
      console.error("Cancel order error:", error);

      window.alert("Unable to connect to SmartMed server.");
      return false;
    }
  };

  // Update order status from owner dashboard

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem("smartmedAuthToken");

      if (!token) {
        window.alert("Please login first.");
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/orders/${orderId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        window.alert(data.message || "Unable to update order status.");
        return;
      }

      console.log("Backend Order Status Updated:", data.order);

      const updatedBackendOrder = data.order;

      // Update frontend order state
      setOrders((previousOrders) => {
        const updatedOrders = previousOrders.map((order) =>
          order.orderId === orderId
            ? {
                ...order,
                status: updatedBackendOrder.status,
                trackingStep: updatedBackendOrder.trackingStep,
              }
            : order,
        );

        // Keep Owner Dashboard local storage synchronized
        localStorage.setItem(
          "smartmedAllOrders",
          JSON.stringify(updatedOrders),
        );

        // Keep customer's local order storage synchronized
        const changedOrder = updatedOrders.find(
          (order) => order.orderId === orderId,
        );

        if (changedOrder?.customer?.email) {
          const customerEmail = changedOrder.customer.email
            .trim()
            .toLowerCase();

          const customerOrdersKey = `smartmedOrders_${customerEmail}`;

          const savedCustomerOrders = localStorage.getItem(customerOrdersKey);

          const customerOrders = savedCustomerOrders
            ? JSON.parse(savedCustomerOrders)
            : [];

          const updatedCustomerOrders = customerOrders.map((order) =>
            order.orderId === orderId ? changedOrder : order,
          );

          localStorage.setItem(
            customerOrdersKey,
            JSON.stringify(updatedCustomerOrders),
          );
        }

        return updatedOrders;
      });

      window.alert("Order status updated successfully.");
    } catch (error) {
      console.error("Update order status error:", error);

      window.alert("Unable to connect to SmartMed server.");
    }
  };

  const handleViewOwnerOrderDetails = (order) => {
    setSelectedOwnerOrder(order);
  };

  // Update tracking progress
  const handleTrackingUpdate = (orderId, trackingStep) => {
    setOrders((previousOrders) =>
      previousOrders.map((order) =>
        order.orderId === orderId
          ? {
              ...order,
              trackingStep: trackingStep,
            }
          : order,
      ),
    );
  };

  // Calculate subtotal
  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  // Delivery charge
  const deliveryCharge = subtotal > 0 ? 40 : 0;

  // Total
  const total = subtotal + deliveryCharge;

  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordOtp, setForgotPasswordOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  return (
    <>
      <Routes>
        <Route
          path="/cart"
          element={
            isUser ? (
              <Cart
                cart={cart}
                setCart={setCart}
                increaseQuantity={increaseQuantity}
                decreaseQuantity={decreaseQuantity}
                removeFromCart={removeFromCart}
                subtotal={subtotal}
                deliveryCharge={deliveryCharge}
                total={total}
                onCheckout={handleCheckout}
              />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/checkout"
          element={
            isUser ? (
              <Checkout
                cart={cart}
                subtotal={subtotal}
                deliveryCharge={deliveryCharge}
                total={total}
                customer={customer}
                setCustomer={setCustomer}
                onPlaceOrder={handlePlaceOrder}
              />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/create-account"
          element={
            <CreateAccount
              registerData={registerData}
              setRegisterData={setRegisterData}
              onAccountCreated={() => {
                setShowLogin(true);
                setLoginRole("user");
                navigate("/");
              }}
            />
          }
        />

        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route
          path="/medicine-details"
          element={
            isUser ? (
              <MedicineDetails addToCart={addToCart} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/orders"
          element={
            isUser ? (
              <YourOrders orders={orders} onCancelOrder={handleCancelOrder} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/owner-dashboard"
          element={
            isOwner ? (
              selectedOwnerOrder ? (
                <OwnerOrderDetails
                  order={selectedOwnerOrder}
                  onBack={() => setSelectedOwnerOrder(null)}
                />
              ) : (
                <OwnerDashboard
                  orders={orders}
                  onUpdateOrderStatus={handleUpdateOrderStatus}
                  onViewOrderDetails={handleViewOwnerOrderDetails}
                />
              )
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/owner-inventory"
          element={
            isOwner ? (
              <OwnerInventory
                medicines={inventoryMedicines}
                wellnessProducts={inventoryWellnessProducts}
                onUpdateStock={handleUpdateMedicineStock}
                onUpdateWellnessStock={handleUpdateWellnessStock}
                onAddMedicine={handleAddMedicine}
                onEditMedicine={handleEditMedicine}
                onDeleteMedicine={handleDeleteMedicine}
              />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/owner-sales-analytics"
          element={
            isOwner ? (
              <OwnerSalesAnalytics orders={orders} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/owner-customers"
          element={
            isOwner ? (
              <OwnerCustomers orders={orders} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/owner-reports"
          element={
            isOwner ? (
              <OwnerReports
                orders={orders}
                medicines={inventoryMedicines}
                wellnessProducts={inventoryWellnessProducts}
              />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/track-order/:orderId"
          element={
            isUser ? (
              <OrderTracking
                orders={orders}
                onTrackingUpdate={handleTrackingUpdate}
              />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/order-success"
          element={isUser ? <OrderSuccess /> : <Navigate to="/" replace />}
        />

        <Route
          path="*"
          element={
            <>
              {/* ================= NAVBAR ================= */}
              {(isUser || isOwner) && (
                <nav className="navbar navbar-expand-lg bg-primary navbar-dark">
                  <div className="container">
                    <a className="navbar-brand fw-bold" href="/">
                      💊 SmartMed
                    </a>

                    <button
                      className="navbar-toggler"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#navbarMenu"
                      aria-controls="navbarMenu"
                      aria-expanded="false"
                      aria-label="Toggle navigation"
                    >
                      <span className="navbar-toggler-icon"></span>
                    </button>

                    <div className="collapse navbar-collapse" id="navbarMenu">
                      <ul className="navbar-nav ms-auto">
                        <li className="nav-item ms-lg-2">
                          {!isOwner && !isUser ? (
                            <button
                              className="btn btn-light text-primary"
                              onClick={() => {
                                setShowLogin(true);
                                setLoginRole(null);
                                setShowCreateAccount(false);
                              }}
                            >
                              🔐 Login
                            </button>
                          ) : (
                            <button
                              className="btn btn-light text-danger"
                              onClick={() => {
                                localStorage.removeItem("smartmedUserLoggedIn");
                                localStorage.removeItem(
                                  "smartmedOwnerLoggedIn",
                                );
                                localStorage.removeItem(
                                  "smartmedCurrentUserEmail",
                                );

                                localStorage.removeItem("smartmedAuthToken");
                                localStorage.removeItem("smartmedUserRole");

                                setIsOwner(false);
                                setIsUser(false);

                                setLoggedInEmail("");
                                setCart([]);

                                setCustomer({
                                  name: "",
                                  mobile: "",
                                  email: "",
                                  address: "",
                                });

                                setOwnerLogin({
                                  username: "",
                                  password: "",
                                });

                                setLoginRole(null);
                                setShowLogin(true);
                                setShowCreateAccount(false);

                                navigate("/", { replace: true });
                              }}
                            >
                              🚪 Logout
                            </button>
                          )}
                        </li>

                        {isUser && (
                          <li className="nav-item ms-lg-2">
                            <Link
                              to="/cart"
                              className="nav-link border-0 bg-transparent"
                            >
                              🛒 Cart
                              {cart.length > 0 && (
                                <span className="badge bg-danger ms-1">
                                  {cart.reduce(
                                    (total, item) => total + item.quantity,
                                    0,
                                  )}
                                </span>
                              )}
                            </Link>
                          </li>
                        )}

                        {isUser && (
                          <li className="nav-item ms-lg-2">
                            <button
                              className="nav-link border-0 bg-transparent"
                              onClick={() => navigate("/orders")}
                            >
                              📦 Your Orders
                            </button>
                          </li>
                        )}
                        {isOwner && (
                          <li className="nav-item ms-lg-2">
                            <button
                              className="nav-link border-0 bg-transparent"
                              onClick={() => navigate("/owner-dashboard")}
                            >
                              🏪 Dashboard
                            </button>
                          </li>
                        )}
                        {isOwner && (
                          <li className="nav-item ms-lg-2">
                            <button
                              className="nav-link border-0 bg-transparent"
                              onClick={() => navigate("/owner-inventory")}
                            >
                              💊 Inventory
                            </button>
                          </li>
                        )}
                        {isOwner && (
                          <li className="nav-item ms-lg-2">
                            <button
                              className="nav-link border-0 bg-transparent"
                              onClick={() => navigate("/owner-sales-analytics")}
                            >
                              📊 Sales Analytics
                            </button>
                          </li>
                        )}

                        {isOwner && (
                          <li className="nav-item ms-lg-2">
                            <button
                              className="nav-link border-0 bg-transparent"
                              onClick={() => navigate("/owner-customers")}
                            >
                              👥 Customers
                            </button>
                          </li>
                        )}

                        {isOwner && (
                          <li className="nav-item ms-lg-2">
                            <button
                              className="nav-link border-0 bg-transparent"
                              onClick={() => navigate("/owner-reports")}
                            >
                              🧾 Reports
                            </button>
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </nav>
              )}

              {/* ================= LOGIN ================= */}

              {/* ================= LOGIN / LANDING PAGE ================= */}

              {showLogin && !isOwner && !isUser && (
                <section className="login-landing">
                  <div className="login-overlay">
                    {/* ================= LEFT SIDE ================= */}

                    <div className="landing-info">
                      {/* Brand */}
                      <div className="brand-area">
                        <div className="brand-icon">✚</div>

                        <div>
                          <h1>SmartMed</h1>
                          <p>Your trusted digital medical store</p>
                        </div>
                      </div>

                      {/* Main Heading */}
                      <h2>
                        Healthcare made
                        <span> simple & accessible.</span>
                      </h2>

                      <p className="landing-description">
                        Find medicines, check availability, manage your orders,
                        and explore everyday wellness products — all in one
                        place.
                      </p>

                      {/* Features */}
                      <div className="landing-features">
                        {/* Medicine */}
                        <div className="landing-feature">
                          <div className="feature-icon">💊</div>

                          <div>
                            <h5>Medicines</h5>
                            <p>
                              Search medicines and check their availability.
                            </p>
                          </div>
                        </div>

                        {/* Easy Ordering */}
                        <div className="landing-feature">
                          <div className="feature-icon">🛒</div>

                          <div>
                            <h5>Easy Ordering</h5>
                            <p>Add products to your cart and order easily.</p>
                          </div>
                        </div>

                        {/* Order Tracking */}
                        <div className="landing-feature">
                          <div className="feature-icon">📦</div>

                          <div>
                            <h5>Order Tracking</h5>
                            <p>View your orders and track them easily.</p>
                          </div>
                        </div>

                        {/* Health Assistant */}
                        <div className="landing-feature">
                          <div className="feature-icon">🩺</div>

                          <div>
                            <h5>Health Assistant</h5>
                            <p>Get helpful health information when needed.</p>
                          </div>
                        </div>
                      </div>

                      {/* Trust Points */}
                      <div className="landing-trust">
                        <span>✓ Easy to use</span>
                        <span>✓ Reliable</span>
                        <span>✓ Convenient</span>
                      </div>
                    </div>

                    {/* ================= RIGHT SIDE ================= */}

                    <div className="landing-login">
                      <div className="login-card">
                        {/* Role Selection */}
                        {!loginRole && (
                          <>
                            <div className="text-center">
                              <div className="login-icon">🔐</div>

                              <h2>Welcome to SmartMed</h2>

                              <p className="text-muted">Login to continue</p>
                            </div>

                            {/* User */}
                            <button
                              className="role-btn user-role"
                              onClick={() => setLoginRole("user")}
                            >
                              <span className="role-icon">👤</span>

                              <div>
                                <strong>User</strong>
                                <small>Login as customer</small>
                              </div>
                            </button>

                            {/* Owner */}
                            <button
                              className="role-btn owner-role"
                              onClick={() => setLoginRole("owner")}
                            >
                              <span className="role-icon">🏪</span>

                              <div>
                                <strong>Owner</strong>
                                <small>Manage medical store</small>
                              </div>
                            </button>
                          </>
                        )}

                        {/* ================= OWNER LOGIN ================= */}

                        {loginRole === "owner" && (
                          <>
                            <div className="text-center mb-4">
                              <div className="login-icon">🏪</div>

                              <h2>Owner Login</h2>

                              <p className="text-muted">
                                Login to manage your medical store
                              </p>
                            </div>

                            <div className="mb-3">
                              <label className="form-label">Owner Email</label>

                              <input
                                type="text"
                                className="form-control"
                                placeholder="Enter owner email"
                                value={ownerLogin.username}
                                onChange={(e) =>
                                  setOwnerLogin({
                                    ...ownerLogin,
                                    username: e.target.value,
                                  })
                                }
                              />
                            </div>

                            <div className="mb-3">
                              <label className="form-label">Password</label>

                              <input
                                type="password"
                                className="form-control"
                                placeholder="Enter password"
                                value={ownerLogin.password}
                                onChange={(e) =>
                                  setOwnerLogin({
                                    ...ownerLogin,
                                    password: e.target.value,
                                  })
                                }
                              />
                            </div>

                            <button
                              className="btn btn-primary w-100"
                              onClick={async () => {
                                const email = ownerLogin.username
                                  .trim()
                                  .toLowerCase();
                                const password = ownerLogin.password;

                                if (!email) {
                                  alert("Please enter your owner email.");
                                  return;
                                }

                                if (!password) {
                                  alert("Please enter your password.");
                                  return;
                                }

                                try {
                                  const response = await fetch(
                                    `${API_BASE_URL}/auth/login`,
                                    {
                                      method: "POST",
                                      headers: {
                                        "Content-Type": "application/json",
                                      },
                                      body: JSON.stringify({
                                        email: email,
                                        password: password,
                                      }),
                                    },
                                  );

                                  const data = await response.json();

                                  if (!response.ok) {
                                    alert(
                                      data.message || "Owner login failed.",
                                    );
                                    return;
                                  }

                                  // Make sure this account is actually an owner
                                  if (data.user.role !== "owner") {
                                    alert(
                                      "This account does not have owner access.",
                                    );
                                    return;
                                  }

                                  // Save real backend authentication
                                  localStorage.setItem(
                                    "smartmedOwnerLoggedIn",
                                    "true",
                                  );

                                  localStorage.removeItem(
                                    "smartmedUserLoggedIn",
                                  );

                                  localStorage.setItem(
                                    "smartmedAuthToken",
                                    data.token,
                                  );

                                  localStorage.setItem(
                                    "smartmedUserRole",
                                    data.user.role,
                                  );

                                  localStorage.setItem(
                                    "smartmedCurrentUserEmail",
                                    data.user.email,
                                  );

                                  const allOrders = loadAllOrdersForOwner();

                                  setOrders(allOrders);

                                  setLoggedInEmail("");

                                  setCart([]);

                                  setCustomer({
                                    name: "",
                                    mobile: "",
                                    email: "",
                                    address: "",
                                  });

                                  setIsOwner(true);
                                  setIsUser(false);
                                  setShowLogin(false);
                                  setLoginRole(null);

                                  setOwnerLogin({
                                    username: "",
                                    password: "",
                                  });

                                  alert("Owner login successful!");
                                } catch (error) {
                                  console.error("Owner Login Error:", error);

                                  alert(
                                    "Cannot connect to SmartMed server. Please make sure the backend is running.",
                                  );
                                }
                              }}
                            >
                              🔐 Login
                            </button>

                            <button
                              className="btn btn-light w-100 mt-2"
                              onClick={() => setLoginRole(null)}
                            >
                              ← Back
                            </button>

                            <div className="d-flex justify-content-center gap-4 mt-3 mb-2">
                              <button
  type="button"
  className="btn btn-link p-0 text-decoration-none"
  onClick={async () => {
    const name = prompt("Enter your registered owner name:");

    if (!name || !name.trim()) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/forgot-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "Unable to find your login email.",
        );
        return;
      }

      alert(
        `Your SmartMed owner login email is:\n\n${data.email}`,
      );
    } catch (error) {
      console.error("Forgot Login Email Error:", error);

      alert(
        "Cannot connect to SmartMed server. Please make sure the backend is running.",
      );
    }
  }}
>
  Forgot Login Email?
</button>

                              <button
                                type="button"
                                className="btn btn-link p-0 text-decoration-none"
                                onClick={() => {
                                  setShowForgotPassword(true);
                                  setForgotPasswordStep(1);
                                  setForgotPasswordEmail(ownerLogin.username);
                                  setForgotPasswordOtp("");
                                  setNewPassword("");
                                  setConfirmPassword("");
                                }}
                              >
                                Forgot Password?
                              </button>
                            </div>
                          </>
                        )}

                        {/* ================= OWNER FORGOT PASSWORD ================= */}

{loginRole === "owner" && showForgotPassword && (
  <div className="mt-3">
    <div className="text-center mb-4">
      <div className="login-icon">🔐</div>

      <h2>
        {forgotPasswordStep === 1
          ? "Forgot Password"
          : "Reset Password"}
      </h2>

      <p className="text-muted">
        {forgotPasswordStep === 1
          ? "Enter your registered owner email"
          : "Enter the OTP and create your new password"}
      </p>
    </div>

    {/* ================= STEP 1 ================= */}

    {forgotPasswordStep === 1 && (
      <>
        <div className="mb-3">
          <label className="form-label">Owner Email</label>

          <input
            type="email"
            className="form-control"
            placeholder="Enter your registered email"
            value={forgotPasswordEmail}
            onChange={(e) =>
              setForgotPasswordEmail(e.target.value)
            }
          />
        </div>

        <button
          type="button"
          className="btn btn-primary w-100"
          disabled={forgotPasswordLoading}
          onClick={async () => {
            const email = forgotPasswordEmail
              .trim()
              .toLowerCase();

            if (!email) {
              alert("Please enter your owner email.");
              return;
            }

            setForgotPasswordLoading(true);

            try {
              const response = await fetch(
                `${API_BASE_URL}/auth/forgot-password`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    email,
                  }),
                },
              );

              const data = await response.json();

              if (!response.ok) {
                alert(
                  data.message ||
                    "Unable to generate password reset OTP.",
                );
                return;
              }

              /*
               * Development/testing:
               * Backend currently returns the OTP.
               */
              if (data.otp) {
                alert(`Your password reset OTP is: ${data.otp}`);
              } else {
                alert(
                  "If this email is registered, an OTP has been generated.",
                );
              }

              setForgotPasswordEmail(email);
              setForgotPasswordStep(2);
            } catch (error) {
              console.error(
                "Forgot Password Error:",
                error,
              );

              alert(
                "Cannot connect to SmartMed server. Please make sure the backend is running.",
              );
            } finally {
              setForgotPasswordLoading(false);
            }
          }}
        >
          {forgotPasswordLoading
            ? "Sending OTP..."
            : "📩 Send OTP"}
        </button>
      </>
    )}

    {/* ================= STEP 2 ================= */}

    {forgotPasswordStep === 2 && (
      <>
        <div className="mb-3">
          <label className="form-label">OTP</label>

          <input
            type="text"
            className="form-control text-center"
            placeholder="Enter 6-digit OTP"
            maxLength="6"
            value={forgotPasswordOtp}
            onChange={(e) =>
              setForgotPasswordOtp(
                e.target.value.replace(/\D/g, ""),
              )
            }
          />
        </div>

        <div className="mb-3">
          <label className="form-label">New Password</label>

          <input
            type="password"
            className="form-control"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) =>
              setNewPassword(e.target.value)
            }
          />
        </div>

        <div className="mb-3">
          <label className="form-label">
            Confirm New Password
          </label>

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
          type="button"
          className="btn btn-primary w-100"
          disabled={forgotPasswordLoading}
          onClick={async () => {
            if (forgotPasswordOtp.length !== 6) {
              alert("Please enter the 6-digit OTP.");
              return;
            }

            if (newPassword.length < 6) {
              alert(
                "New password must be at least 6 characters.",
              );
              return;
            }

            if (newPassword !== confirmPassword) {
              alert("Passwords do not match.");
              return;
            }

            setForgotPasswordLoading(true);

            try {
              const response = await fetch(
                `${API_BASE_URL}/auth/reset-password`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    email: forgotPasswordEmail,
                    otp: forgotPasswordOtp,
                    newPassword,
                  }),
                },
              );

              const data = await response.json();

              if (!response.ok) {
                alert(
                  data.message ||
                    "Unable to reset password.",
                );
                return;
              }

              alert(
                "Password reset successfully. You can now login with your new password.",
              );

              setShowForgotPassword(false);
              setForgotPasswordStep(1);
              setForgotPasswordEmail("");
              setForgotPasswordOtp("");
              setNewPassword("");
              setConfirmPassword("");

              setOwnerLogin({
                username: forgotPasswordEmail,
                password: "",
              });
            } catch (error) {
              console.error(
                "Reset Password Error:",
                error,
              );

              alert(
                "Cannot connect to SmartMed server. Please make sure the backend is running.",
              );
            } finally {
              setForgotPasswordLoading(false);
            }
          }}
        >
          {forgotPasswordLoading
            ? "Resetting Password..."
            : "🔑 Reset Password"}
        </button>
      </>
    )}

    <button
      type="button"
      className="btn btn-light w-100 mt-2"
      onClick={() => {
        setShowForgotPassword(false);
        setForgotPasswordStep(1);
        setForgotPasswordEmail("");
        setForgotPasswordOtp("");
        setNewPassword("");
        setConfirmPassword("");
      }}
    >
      ← Back to Owner Login
    </button>
  </div>
)}

                        {/* ================= USER LOGIN ================= */}

                        {loginRole === "user" && !showCreateAccount && (
                          <>
                            <div className="text-center mb-4">
                              <div className="login-icon">👤</div>

                              <h2>User Login</h2>

                              <p className="text-muted">
                                Login to order medicines
                              </p>
                            </div>

                            <div className="mb-3">
                              <label className="form-label">Email</label>

                              <input
                                type="email"
                                className="form-control"
                                placeholder="Enter your email"
                                value={userLogin.email}
                                onChange={(e) =>
                                  setUserLogin({
                                    ...userLogin,
                                    email: e.target.value,
                                  })
                                }
                              />
                            </div>

                            <div className="mb-3">
                              <label className="form-label">Password</label>

                              <input
                                type="password"
                                className="form-control"
                                placeholder="Enter your password"
                                value={userLogin.password}
                                onChange={(e) =>
                                  setUserLogin({
                                    ...userLogin,
                                    password: e.target.value,
                                  })
                                }
                              />
                            </div>

                            <button
                              className="btn btn-primary w-100"
                              onClick={async () => {
                                const email = userLogin.email
                                  .trim()
                                  .toLowerCase();
                                const password = userLogin.password;

                                if (!email) {
                                  alert("Please enter your email.");
                                  return;
                                }

                                if (!password) {
                                  alert("Please enter your password.");
                                  return;
                                }

                                try {
                                  const response = await fetch(
                                    `${API_BASE_URL}/auth/login`,
                                    {
                                      method: "POST",
                                      headers: {
                                        "Content-Type": "application/json",
                                      },
                                      body: JSON.stringify({
                                        email: email,
                                        password: password,
                                      }),
                                    },
                                  );

                                  const data = await response.json();

                                  if (!response.ok) {
                                    alert(data.message || "Login failed.");
                                    return;
                                  }

                                  // Make sure this is a normal user account
                                  if (data.user.role !== "user") {
                                    alert(
                                      "Please use the Owner login option for this account.",
                                    );
                                    return;
                                  }

                                  // Existing user-specific localStorage data
                                  const userCartKey = `smartmedCart_${email}`;
                                  const userOrdersKey = `smartmedOrders_${email}`;
                                  const userCustomerKey = `smartmedCustomer_${email}`;

                                  const savedCart =
                                    localStorage.getItem(userCartKey);

                                  const savedOrders =
                                    localStorage.getItem(userOrdersKey);

                                  const savedCustomer =
                                    localStorage.getItem(userCustomerKey);

                                  // Save real backend authentication
                                  localStorage.setItem(
                                    "smartmedUserLoggedIn",
                                    "true",
                                  );

                                  localStorage.setItem(
                                    "smartmedCurrentUserEmail",
                                    email,
                                  );

                                  localStorage.setItem(
                                    "smartmedAuthToken",
                                    data.token,
                                  );

                                  localStorage.setItem(
                                    "smartmedUserRole",
                                    data.user.role,
                                  );

                                  localStorage.removeItem(
                                    "smartmedOwnerLoggedIn",
                                  );

                                  // Restore existing user data
                                  setLoggedInEmail(email);

                                  setCart(
                                    savedCart ? JSON.parse(savedCart) : [],
                                  );

                                  setOrders(
                                    savedOrders ? JSON.parse(savedOrders) : [],
                                  );

                                  setCustomer(
                                    savedCustomer
                                      ? JSON.parse(savedCustomer)
                                      : {
                                          name: data.user.name || "",
                                          mobile: "",
                                          email: email,
                                          address: "",
                                        },
                                  );

                                  setIsUser(true);
                                  setIsOwner(false);
                                  setShowLogin(false);
                                  setLoginRole(null);

                                  setUserLogin({
                                    email: "",
                                    password: "",
                                  });

                                  alert("Login successful!");
                                } catch (error) {
                                  console.error("User Login Error:", error);

                                  alert(
                                    "Cannot connect to SmartMed server. Please make sure the backend is running.",
                                  );
                                }
                              }}
                            >
                              🔐 Login
                            </button>

                            <div className="text-center mt-1">
                              <button
                                className="btn btn-link p-0 text-decoration-none forgot-password-btn"
                                onClick={() => navigate("/forgot-password")}
                              >
                                Forgot Password?
                              </button>
                            </div>

                            {/* Create Account */}
                            <div className="text-center mt-1">
                              <span className="text-muted">
                                Don't have an account?
                              </span>

                              <button
                                className="btn btn-link p-0 ms-2"
                                onClick={() => {
                                  navigate("/create-account");
                                }}
                              >
                                Create Account
                              </button>
                            </div>

                            <button
                              className="btn btn-light w-100 mt-2"
                              onClick={() => setLoginRole(null)}
                            >
                              ← Back
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* ================= HERO SECTION ================= */}

              {isUser && !isOwner && (
                <section className="container hero-section">
                  <div className="row">
                    <div className="col-12 text-center">
                      <h1 className="hero-title">
                        Find Your <span>Medicine</span>
                      </h1>

                      <p className="hero-description">
                        Search for medicines and check their availability
                        quickly.
                      </p>

                      {/* Search Box */}

                      <div className="search-box mx-auto">
                        <div className="input-group">
                          <div className="search-input-wrapper">
                            <input
                              type="text"
                              className="form-control"
                              placeholder="What are you looking for?"
                              value={search}
                              onChange={(e) => {
                                const value = e.target.value;
                                setSearch(value);

                                // New search = show only first 4 results
                                setShowAllResults(false);

                                if (value.trim() === "") {
                                  setResults([]);
                                  return;
                                }

                                const searchTerm = value.trim().toLowerCase();

                                const medicineResults =
                                  customerMedicines.filter((medicine) =>
                                    medicine.name
                                      .toLowerCase()
                                      .includes(searchTerm),
                                  );

                                const wellnessResults =
                                  inventoryWellnessProducts.filter((product) =>
                                    product.name
                                      .toLowerCase()
                                      .includes(searchTerm),
                                  );

                                setResults([
                                  ...medicineResults,
                                  ...wellnessResults,
                                ]);
                              }}
                            />

                            {search && (
                              <button
                                className="clear-search-btn"
                                onClick={() => {
                                  setSearch("");
                                  setResults([]);
                                  setShowAllResults(false);
                                }}
                                aria-label="Clear search"
                              >
                                ✕
                              </button>
                            )}
                          </div>

                          <button
                            className="btn btn-primary"
                            onClick={handleSearch}
                          >
                            🔍 Search
                          </button>
                        </div>
                      </div>
                      {search.trim() === "" && (
                        <div className="search-hint mt-3">
                          <small className="d-block text-muted mt-1">
                            Search for medicines, wellness products, or health
                            essentials
                          </small>
                        </div>
                      )}

                      {/* Search Results */}

                      {search.trim() !== "" && results.length > 0 && (
                        <div className="search-results mt-4">
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <div>
                              <h4 className="mb-1">Search Results</h4>
                              <small className="text-muted">
                                {results.length}{" "}
                                {results.length === 1 ? "result" : "results"}{" "}
                                found
                              </small>
                            </div>
                          </div>

                          <div className="row g-3">
                            {(showAllResults
                              ? results
                              : results.slice(0, 4)
                            ).map((medicine) => (
                              <div
                                className="col-12 col-sm-6 col-lg-3"
                                key={medicine.id}
                              >
                                <div className="card shadow-sm h-100 search-result-card">
                                  <div className="card-body">
                                    <h5
                                      className="mb-2 medicine-name-link"
                                      onClick={() =>
                                        navigate("/medicine-details", {
                                          state: { medicine },
                                        })
                                      }
                                    >
                                      💊 {medicine.name}
                                    </h5>

                                    <p className="mb-1">
                                      Category:{" "}
                                      <strong>{medicine.category}</strong>
                                    </p>

                                    <p className="mb-1">
                                      Price: <strong>₹{medicine.price}</strong>
                                    </p>

                                    <p className="mb-2">
                                      Stock: <strong>{medicine.stock}</strong>
                                    </p>

                                    <span
                                      className={`badge ${
                                        medicine.status === "Available"
                                          ? "bg-success"
                                          : medicine.status === "Low Stock"
                                            ? "bg-warning text-dark"
                                            : "bg-danger"
                                      }`}
                                    >
                                      {medicine.status}
                                    </span>

                                    {medicine.stock > 0 && (
                                      <div>
                                        <button
                                          className="btn btn-primary btn-sm mt-3"
                                          onClick={() => addToCart(medicine)}
                                        >
                                          🛒 Add to Cart
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* View All / Show Less */}

                          {results.length > 4 && (
                            <div className="text-center mt-4">
                              {!showAllResults ? (
                                <button
                                  className="btn btn-outline-primary px-4"
                                  onClick={() => setShowAllResults(true)}
                                >
                                  View all {results.length} results →
                                </button>
                              ) : (
                                <button
                                  className="btn btn-outline-secondary px-4"
                                  onClick={() => setShowAllResults(false)}
                                >
                                  ↑ Show less
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {search && results.length === 0 && (
                        <div className="no-medicine mt-4">
                          <span className="no-medicine-icon">🔍</span>
                          <span>
                            No medicine found for <strong>"{search}"</strong>
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Hero Right */}
                  </div>
                </section>
              )}

              {isUser && !isOwner && (
                <Categories
                  medicines={customerMedicines}
                  addToCart={addToCart}
                />
              )}

              {/* EVERYDAY WELLNESS */}
              {isUser && !isOwner && (
                <EverydayWellness
                  products={[
                    ...inventoryWellnessProducts,

                    ...customerMedicines
                      .filter(
                        (medicine) =>
                          medicine.categoryType === "Everyday Wellness",
                      )
                      .map((medicine) => ({
                        ...medicine,
                        wellnessCategory: medicine.category,
                      })),
                  ]}
                  addToCart={addToCart}
                />
              )}

              {/* HEALTH ASSISTANT */}
              {isUser && !isOwner && <HealthAssistant />}

              {/* ================= AVAILABILITY SECTION ================= */}

              {isUser && !isOwner && (
                <section className="container availability-section">
                  <h2 className="text-center section-title">
                    Medicine Availability
                  </h2>

                  <p className="text-center section-description">
                    Quickly understand medicine stock status.
                  </p>

                  <div className="row g-4 mt-3">
                    {/* Available */}

                    <div className="col-12 col-md-4">
                      <div className="card availability-card h-100 text-center">
                        <div className="card-body">
                          <div className="availability-icon">🟢</div>

                          <h4 className="card-title mt-3">Available</h4>

                          <p className="text-muted">
                            Medicine is currently available.
                          </p>

                          <span className="badge bg-success">In Stock</span>
                        </div>
                      </div>
                    </div>

                    {/* Low Stock */}

                    <div className="col-12 col-md-4">
                      <div className="card shadow-sm h-100 text-center">
                        <div className="card-body">
                          <div className="display-5">⚠️</div>

                          <h4 className="card-title mt-3">Low Stock</h4>

                          <p className="text-muted">
                            Only a few units are remaining.
                          </p>

                          <span className="badge bg-warning text-dark">
                            Low Stock
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Out Of Stock */}

                    <div className="col-12 col-md-4">
                      <div className="card shadow-sm h-100 text-center">
                        <div className="card-body">
                          <div className="display-5">🔴</div>

                          <h4 className="card-title mt-3">Out of Stock</h4>

                          <p className="text-muted">
                            Medicine is currently unavailable.
                          </p>

                          <span className="badge bg-danger">Out of Stock</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* FOOTER */}
              {isUser && <Footer />}
            </>
          }
        />
      </Routes>
    </>
  );
}

export default App;
