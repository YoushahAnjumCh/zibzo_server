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
const productSchema = new Schema({
    id: { type: Number },
    title: { type: String, required: true },
    subtitle: { type: String, required: true },
    category: { type: String, required: true },
    image: { type: [String], required: true },
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
const Product = mongoose_1.default.model("products", productSchema);
exports.default = Product;
