"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const { Schema } = mongoose_1.default;
const metaSchema = new Schema({
    createdAt: Date,
    updatedAt: Date,
    barcode: String,
    qrCode: String,
});
// Define the main product schema
const orderDetailsSchema = new Schema({
    id: { type: Number, required: true },
    title: { type: String, },
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
const OrderDetails = mongoose_1.default.model("order_detail", orderDetailsSchema);
exports.default = OrderDetails;
