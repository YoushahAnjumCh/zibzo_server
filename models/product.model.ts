// models/product.model.js
import { Double } from "mongodb";
import mongoose from "mongoose";
const { Schema } = mongoose;

const ratingSchema = new Schema({
  rate: Number,
  count: Number,
});

const productSchema = new Schema({
  id: Number,
  title: String,
  price: Number,
  description: String,
  category: String,
  images: String,
  rating: ratingSchema,
});

const Product = mongoose.model("products", productSchema);

export default Product;
