"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose = require("mongoose");
const product_model_1 = __importDefault(require("../models/product.model"));
const auth_middleware_1 = require("../middleware/auth.middleware");
var router = express_1.default.Router();
router.get("/", auth_middleware_1.isAuthenticated, async (req, res) => {
    try {
        const { limit, offset } = req.query;
        const products = await product_model_1.default
            .find({})
            .limit(parseInt(limit))
            .skip(parseInt(offset));
        res.status(200).json(products);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong!" });
    }
});
router.get("/:id", auth_middleware_1.isAuthenticated, async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ message: "Invalid product ID!" });
        }
        const products = await product_model_1.default.findOne({ id });
        if (!products) {
            return res.status(404).json({ message: "Product not found!" });
        }
        res.status(200).json(products);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong!" });
    }
});
exports.default = router;
