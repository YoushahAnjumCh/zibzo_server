

import mongoose from "mongoose";
const { Schema } = mongoose;
const metaSchema = new Schema({
  createdAt: Date,
  updatedAt: Date,
  barcode: String,
  qrCode: String,
});

// Define the main product schema
const orderDetailsSchema = new Schema({
  id: { type: Number, required: true },
  title: { type: String,},
  userid: { type: Number, required: true },
  category: { type: String, },
  price: { type: Number, },
  discountPercentage: { type: Number, },
  stock: { type: Number, },
  brand: String,
  sku: String,
  warrantyInformation: String,
  shippingInformation: String,
  availabilityStatus: String,
  returnPolicy: String,
  meta: metaSchema,
  thumbnail: String,
});

const OrderDetails = mongoose.model("order_detail", orderDetailsSchema);

export default OrderDetails;