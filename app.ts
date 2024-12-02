import express from "express";
import path from "path";
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
mongoose.connect(process.env.MONGODB_CONNECTION_STR || "", {});
mongoose.connection.on("open", () => {
  console.log("Onlineshoppingdb connected successfully !");
});

var app = express();
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
app.listen(process.env.PORT, () => {
  console.log(`Server running @ port ${process.env.PORT} !`);
});
