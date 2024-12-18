"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const product_model_1 = __importDefault(require("../models/product.model"));
const banner_model_1 = __importDefault(require("../models/banner_model"));
const category_model_1 = __importDefault(require("../models/category.model"));
const offer_banner_model_1 = __importDefault(require("../models/offer_banner.model"));
const deal_of_the_day_model_1 = __importDefault(require("../models/deal_of_the_day.model"));
var router = (0, express_1.default)();
const multer = require("multer");
const bodyParser = require("body-parser");
const crypto_1 = __importDefault(require("crypto"));
const client_s3_1 = require("@aws-sdk/client-s3");
const dotenv_1 = __importDefault(require("dotenv"));
var app = (0, express_1.default)();
dotenv_1.default.config();
//For image name random generate
const randomImageName = (bytes = 32) => crypto_1.default.randomBytes(bytes).toString("hex");
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
    maxAttempts: 5, // Retry on failure for a number of attempts
    requestHandler: {
        httpOptions: {
            timeout: 300000, // Request timeout in milliseconds (5 minutes)
            maxRedirects: 10, // Optional: Number of allowed redirects
        },
    },
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Configure storage for multer
const storage = multer.memoryStorage({});
const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 },
});
//Product Data Upload
router.post("/", upload.array("ProductImage", 10), // Accept up to 10 files
async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "Please upload images" });
        }
        const newProductFromRequest = req.body;
        const imagePaths = [];
        // Upload each image to S3
        for (const file of req.files) {
            const imageName = randomImageName(); // Generate a unique image name for each file
            const uploadParams = {
                Bucket: bucketName,
                Body: file.buffer,
                Key: imageName,
                ContentType: file.mimetype,
            };
            const command = new client_s3_1.PutObjectCommand(uploadParams);
            await s3.send(command);
            // Push the S3 image key to the array
            imagePaths.push(imageName);
        }
        // Store the S3 image keys in the database
        const newProductToBeInserted = new product_model_1.default(Object.assign(Object.assign({}, newProductFromRequest), { image: imagePaths }));
        await newProductToBeInserted.save();
        return res.status(201).json(newProductToBeInserted);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error", error });
    }
});
router.post("/homebanner", upload.single("homebanner"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Upload image" });
        }
        // Generate a unique name for the homebanner image
        const homeBannerImageName = randomImageName();
        const uploadHomeBannerParams = {
            Bucket: bucketName,
            Body: req.file.buffer,
            Key: homeBannerImageName,
            ContentType: req.file.mimetype,
        };
        const commandHomeBanner = new client_s3_1.PutObjectCommand(uploadHomeBannerParams);
        await s3.send(commandHomeBanner);
        const newProductToBeInserted = new banner_model_1.default(Object.assign(Object.assign({}, req.body), { image: homeBannerImageName }));
        const savedProduct = await newProductToBeInserted.save();
        return res.status(201).json(savedProduct);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error", error: error });
    }
});
//Category Upload
router.post("/category", upload.single("category"), async (req, res) => {
    try {
        const newProductFromRequest = req.body;
        const categoryImageName = randomImageName();
        const uploadCategoryParams = {
            Bucket: bucketName,
            Body: req.file.buffer,
            Key: categoryImageName,
            ContentType: req.file.mimetype,
        };
        const commandCategory = new client_s3_1.PutObjectCommand(uploadCategoryParams);
        await s3.send(commandCategory);
        const newProductToBeInserted = new category_model_1.default(Object.assign(Object.assign({}, newProductFromRequest), { image: categoryImageName }));
        await newProductToBeInserted.save();
        return res.status(201).json(newProductToBeInserted);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong!" });
    }
});
//Offerbanner upload
router.post("/offerbanner", upload.single("offerbannerImage"), async (req, res) => {
    try {
        const newProductFromRequest = req.body;
        const offerBannerImageName = randomImageName();
        const uploadOfferBannerParams = {
            Bucket: bucketName,
            Body: req.file.buffer,
            Key: offerBannerImageName,
            ContentType: req.file.mimetype,
        };
        const commandOfferBanner = new client_s3_1.PutObjectCommand(uploadOfferBannerParams);
        await s3.send(commandOfferBanner);
        const newProductToBeInserted = new offer_banner_model_1.default(Object.assign(Object.assign({}, newProductFromRequest), { image: offerBannerImageName }));
        await newProductToBeInserted.save();
        return res.status(201).json(newProductToBeInserted);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong!" });
    }
});
//Deal of the Day Upload
router.post("/dealday", upload.fields([
    { name: "dealofthedayimage", maxCount: 1 },
    { name: "dealofthedaylogo", maxCount: 1 },
]), async (req, res) => {
    try {
        if (!req.files ||
            !req.files.dealofthedayimage ||
            !req.files.dealofthedaylogo) {
            return res
                .status(400)
                .json({ message: "Please upload both image and logo" });
        }
        // Generate random names for the files
        const dealDayImageName = randomImageName(); // New name for the dealofthedayimage
        const dealDayLogoName = randomImageName(); // New name for the dealofthedaylogo
        // Upload dealofthedayimage to S3
        const imageFile = req.files.dealofthedayimage[0];
        const uploadParamsImage = {
            Bucket: bucketName,
            Body: imageFile.buffer,
            Key: dealDayImageName,
            ContentType: imageFile.mimetype,
        };
        const commandImage = new client_s3_1.PutObjectCommand(uploadParamsImage);
        await s3.send(commandImage);
        // Upload dealofthedaylogo to S3
        const logoFile = req.files.dealofthedaylogo[0];
        const uploadParamsLogo = {
            Bucket: bucketName,
            Body: logoFile.buffer,
            Key: dealDayLogoName,
            ContentType: logoFile.mimetype,
        };
        const commandLogo = new client_s3_1.PutObjectCommand(uploadParamsLogo);
        await s3.send(commandLogo);
        // Save the deal of the day product to the database
        const newProduct = new deal_of_the_day_model_1.default({
            image: dealDayImageName, // S3 key for the image
            title: req.body.title,
            logo: dealDayLogoName, // S3 key for the logo
            offer: req.body.offer,
        });
        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong!", error });
    }
});
exports.default = router;
