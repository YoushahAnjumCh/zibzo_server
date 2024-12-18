import express from "express";

import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRouter from "./routes/auth.route";
import productRouter from "./routes/products.route";
import wishlistRouter from "./routes/wishlist.route";
import orderDetails from "./routes/order_details.route";
import uploadRouter from "./routes/upload_data.route";
import cart from "./routes/cart.route";
import bodyParser from "body-parser";
dotenv.config();
const password = process.env.MONGO_PASSWORD;

const connectionString = `mongodb+srv://Youshah4499:${password}@zibzo.tqwnn.mongodb.net/zibzo_server?retryWrites=true&w=majority&appName=ZibZo`;
mongoose
  .connect(connectionString)
  .then(() => {
    console.log("Connected to MongoDB successfully!");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

var app = express();
const allowedOrigins = ["http://localhost:3000", "https://zibzo.youshah.com"];
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  next();
});
app.use(cors());

// Middleware for parsing requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json({ limit: "50mb" })); // Increase the limit for JSON requests
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true })); // Increase for URL-encoded requests

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("images"));

app.use("/upload", uploadRouter);
app.use("/auth", authRouter);
app.use("/products", productRouter);
app.use("/wishlist", wishlistRouter);
app.use("/order_details", orderDetails);
app.use("/cart", cart);
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running @ port ${PORT} !`);
});
