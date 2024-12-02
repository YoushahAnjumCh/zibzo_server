"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const product_model_1 = __importDefault(require("../models/product.model"));
const banner_model_1 = __importDefault(require("../models/banner_model"));
const cart_model_1 = __importDefault(require("../models/cart.model"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const category_model_1 = __importDefault(require("../models/category.model"));
const offer_banner_model_1 = __importDefault(require("../models/offer_banner.model"));
const deal_of_the_day_model_1 = __importDefault(require("../models/deal_of_the_day.model"));
const mongoose_1 = __importDefault(require("mongoose"));
var router = (0, express_1.default)();
router.get("/", async (req, res) => {
    try {
        const { 
        // limit, offset,
        userID, } = req.query;
        const products = await product_model_1.default.find({});
        // .limit(parseInt(limit as string))
        // .skip(parseInt(offset as string))
        const homebanner = await banner_model_1.default.find({});
        const category = await category_model_1.default.find({});
        const offerbanner = await offer_banner_model_1.default.find({});
        const offerdeal = await deal_of_the_day_model_1.default.find({});
        const existingCart = await cart_model_1.default.findOne({ userID });
        const cartProductCount = existingCart ? existingCart.productID.length : 0;
        if (products.length === 0) {
            return res.status(404).json({ message: "No products found!" });
        }
        return res.status(200).json({
            products,
            homebanner,
            category,
            offerdeal,
            offerbanner,
            cartProductCount,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong!" });
    }
});
router.get("/:id", auth_middleware_1.isAuthenticated, async (req, res) => {
    try {
        const id = req.params.id;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid product ID!" });
        }
        const products = await product_model_1.default.findOne({ _id: id });
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
//Get By Category
router.get("/category/:id", auth_middleware_1.isAuthenticated, async (req, res) => {
    try {
        const categoryID = req.params.id;
        console.log(categoryID);
        const products = await product_model_1.default.find({ category: categoryID });
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
router.delete("/delete", auth_middleware_1.isAuthenticated, async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ message: "Invalid product ID!" });
        }
        const result = await product_model_1.default.deleteOne({ id });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Product not found!" });
        }
        res.status(200).json({ message: "Product deleted successfully!" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong!" });
    }
});
exports.default = router;
