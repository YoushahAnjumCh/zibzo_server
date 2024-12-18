"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cart_model_1 = __importDefault(require("../models/cart.model"));
const product_model_1 = __importDefault(require("../models/product.model"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const auth_middleware_1 = require("../middleware/auth.middleware");
dotenv_1.default.config();
const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;
const accessKey = process.env.ACCESS_KEY;
const secretKey = process.env.SECRET_KEY;
const s3 = new client_s3_1.S3Client({
    credentials: {
        accessKeyId: accessKey || "",
        secretAccessKey: secretKey || "",
    },
    region: bucketRegion || "",
});
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Cart Routes
app.post("/", auth_middleware_1.isAuthenticated, async (req, res) => {
    try {
        const { userID, productID } = req.body;
        if (!userID || !productID) {
            return res
                .status(400)
                .json({ message: "userID and productID are required!" });
        }
        // Check if the cart exists for the user
        const existingCart = await cart_model_1.default.findOne({ userID });
        if (existingCart) {
            // Check if the productID already exists in the cart
            const isProductAlreadyAdded = existingCart.productID.includes(productID);
            if (isProductAlreadyAdded) {
                return res
                    .status(400)
                    .json({ message: "Product already added to the cart!" });
            }
            // Add the productID to the array (ensuring uniqueness)
            existingCart.productID = Array.from(new Set([...existingCart.productID, productID]));
            await existingCart.save();
            const cartProductCount = existingCart.productID.length;
            return res.status(200).json({ existingCart, cartProductCount });
        }
        else {
            // Create a new cart for the user
            const newCart = new cart_model_1.default({
                userID,
                productID: [productID], // Initialize as an array
            });
            await newCart.save();
            const cartProductCount = newCart.productID.length;
            return res.status(201).json({ newCart, cartProductCount });
        }
    }
    catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Something went wrong!" });
    }
});
app.get("/", auth_middleware_1.isAuthenticated, async (req, res) => {
    try {
        const { userID } = req.query;
        if (!userID) {
            return res.status(400).json({ message: "UserID is required!" });
        }
        const existingCart = await cart_model_1.default.findOne({ userID });
        if (!existingCart) {
            return res
                .status(200)
                .json({ cart: {}, message: "No cart found for this user!" });
        }
        if (!existingCart.productID || existingCart.productID.length === 0) {
            return res
                .status(404)
                .json({ message: "No products found in the cart!" });
        }
        const products = await product_model_1.default.find({
            _id: { $in: existingCart.productID },
        });
        for (let product of products) {
            const imageUrls = [];
            for (const imageKey of product.image) {
                const getObjectParam = {
                    Bucket: bucketName,
                    Key: imageKey,
                };
                const command = new client_s3_1.GetObjectCommand(getObjectParam);
                const signedUrl = await (0, s3_request_presigner_1.getSignedUrl)(s3, command, { expiresIn: 3600 });
                imageUrls.push(signedUrl);
            }
            product.image = imageUrls;
        }
        if (products.length === 0) {
            return res.status(404).json({ message: "No matching products found!" });
        }
        const cartProductCount = existingCart ? existingCart.productID.length : 0;
        return res
            .status(200)
            .json({ cart: existingCart, products, cartProductCount });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong!" });
    }
});
app.delete("/", auth_middleware_1.isAuthenticated, async (req, res) => {
    try {
        const { userID, productID } = req.body;
        const cart = await cart_model_1.default.findOne({ userID });
        if (!cart) {
            return res.status(404).json({ message: "Cart not found for this user!" });
        }
        cart.productID = cart.productID.filter((id) => id !== productID);
        if (cart.productID.length === 0) {
            await cart_model_1.default.deleteOne({ userID });
            const cartProductCount = cart.productID.length;
            // Emit the cart deleted event to the specific user
            return res
                .status(200)
                .json({ message: "Cart deleted as it was empty.", cartProductCount });
        }
        await cart.save();
        const products = await product_model_1.default.find({
            _id: { $in: cart.productID },
        });
        for (let product of products) {
            const imageUrls = [];
            for (const imageKey of product.image) {
                const getObjectParam = {
                    Bucket: bucketName,
                    Key: imageKey,
                };
                const command = new client_s3_1.GetObjectCommand(getObjectParam);
                const signedUrl = await (0, s3_request_presigner_1.getSignedUrl)(s3, command, { expiresIn: 3600 });
                imageUrls.push(signedUrl);
            }
            product.image = imageUrls;
        }
        if (products.length === 0) {
            return res.status(404).json({ message: "No matching products found!" });
        }
        const cartProductCount = cart ? cart.productID.length : 0;
        return res.status(200).json({ cart: cart, products, cartProductCount });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong!" });
    }
});
exports.default = app;
