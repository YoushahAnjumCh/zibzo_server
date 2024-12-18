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
const dotenv_1 = __importDefault(require("dotenv"));
const category_model_1 = __importDefault(require("../models/category.model"));
const offer_banner_model_1 = __importDefault(require("../models/offer_banner.model"));
const deal_of_the_day_model_1 = __importDefault(require("../models/deal_of_the_day.model"));
const mongoose_1 = __importDefault(require("mongoose"));
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
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
var router = (0, express_1.default)();
router.get("/", auth_middleware_1.isAuthenticated, async (req, res) => {
    try {
        const { userID } = req.query;
        const products = await product_model_1.default.find({});
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
        const homebanner = await banner_model_1.default.find({});
        for (let homebannerimage of homebanner) {
            const getObjectHomeBannerParams = {
                Bucket: bucketName,
                Key: homebannerimage.image,
            };
            const commandHomeBanner = new client_s3_1.GetObjectCommand(getObjectHomeBannerParams);
            const homeBannerImage = await (0, s3_request_presigner_1.getSignedUrl)(s3, commandHomeBanner, {
                expiresIn: 3600,
            });
            homebannerimage.image = homeBannerImage;
        }
        const category = await category_model_1.default.find({});
        // Update category images with signed URLs
        for (let categories of category) {
            const getObjectCategoryParams = {
                Bucket: bucketName,
                Key: categories.image,
            };
            const commandCategory = new client_s3_1.GetObjectCommand(getObjectCategoryParams);
            const categoryImage = await (0, s3_request_presigner_1.getSignedUrl)(s3, commandCategory, {
                expiresIn: 3600,
            });
            categories.image = categoryImage;
        }
        const offerbanner = await offer_banner_model_1.default.find({});
        // Update offerBanner images with signed URLs
        for (let offerbannerImage of offerbanner) {
            const getObjectOfferBannerParams = {
                Bucket: bucketName,
                Key: offerbannerImage.image,
            };
            const commandOfferBanner = new client_s3_1.GetObjectCommand(getObjectOfferBannerParams);
            const offerBannerImage = await (0, s3_request_presigner_1.getSignedUrl)(s3, commandOfferBanner, {
                expiresIn: 3600,
            });
            offerbannerImage.image = offerBannerImage;
        }
        const offerdeal = await deal_of_the_day_model_1.default.find({});
        // Update offerdeal images with signed URLs
        for (let offerDeal of offerdeal) {
            // Generate a pre-signed URL for the image
            if (offerDeal.image) {
                const getObjectParamsImage = {
                    Bucket: bucketName,
                    Key: offerDeal.image,
                };
                const commandImage = new client_s3_1.GetObjectCommand(getObjectParamsImage);
                const dealDayImage = await (0, s3_request_presigner_1.getSignedUrl)(s3, commandImage, {
                    expiresIn: 3600,
                });
                offerDeal.image = dealDayImage;
            }
            // Generate a pre-signed URL for the logo
            if (offerDeal.logo) {
                const getObjectParamsLogo = {
                    Bucket: bucketName,
                    Key: offerDeal.logo,
                };
                const commandLogo = new client_s3_1.GetObjectCommand(getObjectParamsLogo);
                const dealDayLogo = await (0, s3_request_presigner_1.getSignedUrl)(s3, commandLogo, {
                    expiresIn: 3600,
                });
                offerDeal.logo = dealDayLogo;
            }
        }
        // Get cart product count for the user
        const existingCart = await cart_model_1.default.findOne({ userID });
        const cartProductCount = existingCart ? existingCart.productID.length : 0;
        // Respond with all data
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
