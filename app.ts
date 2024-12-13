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

app.use((_req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");

  next();
});
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use(cors()); // enable cors at application level
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("images"));

app.use("/auth", authRouter);
app.use("/products", productRouter);
app.use("/wishlist", wishlistRouter);
app.use("/order_details", orderDetails);
app.use("/cart", cart);
app.use("/upload", uploadRouter);
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running @ port ${PORT} !`);
});
