"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const { Schema } = mongoose_1.default;
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
const Product = mongoose_1.default.model("products", productSchema);
exports.default = Product;
