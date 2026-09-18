const express = require("express");
const cors = require("cors");

const helmet = require("helmet");
 
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const medicineRoutes = require("./routes/medicineRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const app = express();

 

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);
app.use(helmet());
app.use(express.json());

app.use("/api/auth",authRoutes);
app.use("/api/medicines", medicineRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "SmartMed Backend is running successfully",
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`SmartMed Backend running on port ${PORT}`);
  });
};

startServer();