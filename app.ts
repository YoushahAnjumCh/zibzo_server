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

// const connectionString = `mongodb://localhost:27017/zibzo_server`;
mongoose
  .connect(connectionString)
  .then(() => {
    console.log("Connected to MongoDB successfully!");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

var app = express();

app.use(cors({ origin: "https://zibzo.youshah.com" }));
app.use(cors()); // This will allow all origins by default

// Middleware for parsing requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Ensure the CORS middleware is applied before other middleware
app.use((_req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // Or specify a particular domain here, e.g., "http://localhost:3000"
  res.header("Access-Control-Allow-Headers", "*");
  next();
});
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
