import mongoose from "mongoose";
const { Schema } = mongoose;
const metaSchema = new Schema({
  createdAt: Date,
  updatedAt: Date,
  barcode: String,
  qrCode: String,
});

// Define the main product schema
const productSchema = new Schema({
  id: { type: Number },
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
  category: { type: String, required: true },
  image: { type: [], required: true },
  offerPrice: { type: Number, required: true },
  actualPrice: { type: Number, required: true },
  offerPercentage: { type: Number, required: true },
  stock: { type: Number },
  brand: String,
  sku: String,
  warrantyInformation: String,
  shippingInformation: String,
  availabilityStatus: String,
  returnPolicy: String,
  meta: metaSchema,
  thumbnail: String,
});

// Create the product model
const Product = mongoose.model("products", productSchema);

export default Product;
