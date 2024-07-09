import express from "express";
import path from "path";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRouter from "./routes/auth.route";
import productRouter from "./routes/products.route";
dotenv.config();
mongoose.connect(process.env.MONGODB_CONNECTION_STR || "", {});
mongoose.connection.on("open", () => {
  console.log("Onlineshoppingdb connected successfully !");
});

var app = express();
app.use(cors()); // enable cors at application level
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/auth", authRouter);
app.use("/products", productRouter);

app.listen(process.env.PORT, () => {
  console.log(`Server running @ port ${process.env.PORT} !`);
});
