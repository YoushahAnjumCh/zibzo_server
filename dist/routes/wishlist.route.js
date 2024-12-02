"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const product_model_1 = __importDefault(require("../models/product.model"));
const auth_middleware_1 = require("../middleware/auth.middleware");
var router = express_1.default.Router();
//! will update once integrate the app with the front end
router.get("/", auth_middleware_1.isAuthenticated, async (req, res) => {
    try {
        const { id } = req.body;
        if (!id || !Array.isArray(id)) {
            return res.status(400).json({ message: "Invalid input! ids must be an array of numbers." });
        }
        const numericIds = id.map(id => Number(id)).filter(id => !isNaN(id));
        if (numericIds.length === 0) {
            return res.status(400).json({ message: "Invalid input! Array must contain valid numbers." });
        }
        const products = await product_model_1.default.find({ id: { $in: numericIds } });
        if (products.length === 0) {
            return res.status(404).json({ message: "No products found!" });
        }
        res.status(200).json(products);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong!" });
    }
});
router.get("/id", auth_middleware_1.isAuthenticated, async (req, res) => {
    try {
        const { id } = req.body;
        if (!id || !Array.isArray(id)) {
            return res.status(400).json({ message: "Invalid input! ids must be an array of numbers." });
        }
        const numericIds = id.map(id => Number(id)).filter(id => !isNaN(id));
        if (numericIds.length === 0) {
            return res.status(400).json({ message: "Invalid input! Array must contain valid numbers." });
        }
        const products = await product_model_1.default.find({ id: { $in: numericIds } }, { price: 1, stock: 1, _id: 0,
            id: 1,
        });
        if (products.length === 0) {
            return res.status(404).json({ message: "No products found!" });
        }
        res.status(200).json(products);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong!" });
    }
});
exports.default = router;
