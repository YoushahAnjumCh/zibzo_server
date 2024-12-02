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
const path = require("path");
// Configure storage for multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "images/");
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname));
    },
});
const upload = multer({ storage: storage });
//Product Data Upload
router.post("/", upload.array("ProductImage", 10), async (req, res) => {
    try {
        console.log(req.body);
        const newProductFromRequest = req.body;
        const imagePaths = req.files.map((file) => file.filename);
        console.log(newProductFromRequest);
        newProductFromRequest.images = imagePaths;
        const newProductToBeInserted = new product_model_1.default(Object.assign(Object.assign({}, newProductFromRequest), { image: imagePaths }));
        console.log(newProductToBeInserted);
        await newProductToBeInserted.save();
        return res.status(201).json(newProductToBeInserted);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong!" });
    }
});
// HomeBanner Upload
router.post("/homebanner", upload.single("homebanner"), async (req, res) => {
    try {
        const newProductFromRequest = req.body;
        const imagePath = req.file ? req.file.filename : null;
        newProductFromRequest.image = imagePath;
        const newProductToBeInserted = new banner_model_1.default(Object.assign(Object.assign({}, newProductFromRequest), { ProductImage: imagePath }));
        console.log(newProductToBeInserted);
        await newProductToBeInserted.save();
        return res.status(201).json(newProductToBeInserted);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong!" });
    }
});
//Category Upload
router.post("/category", upload.single("category"), async (req, res) => {
    try {
        const newProductFromRequest = req.body;
        const imagePath = req.file ? req.file.filename : null;
        newProductFromRequest.image = imagePath;
        const newProductToBeInserted = new category_model_1.default(Object.assign(Object.assign({}, newProductFromRequest), { ProductImage: imagePath }));
        console.log(newProductToBeInserted);
        await newProductToBeInserted.save();
        return res.status(201).json(newProductToBeInserted);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong!" });
    }
});
//Offerbanner upload
router.post("/offerbanner", upload.single("image"), async (req, res) => {
    try {
        const newProductFromRequest = req.body;
        const imagePath = req.file ? req.file.filename : null;
        newProductFromRequest.image = imagePath;
        const newProductToBeInserted = new offer_banner_model_1.default(Object.assign(Object.assign({}, newProductFromRequest), { ProductImage: imagePath }));
        console.log(newProductToBeInserted);
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
    var _a, _b, _c, _d, _e, _f;
    try {
        const newProductFromRequest = req.body;
        console.log(newProductFromRequest);
        // Access file paths
        const imageFile = ((_c = (_b = (_a = req.files) === null || _a === void 0 ? void 0 : _a.dealofthedayimage) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.filename) || null;
        const logoFile = ((_f = (_e = (_d = req.files) === null || _d === void 0 ? void 0 : _d.dealofthedaylogo) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.filename) || null;
        // Include file paths in the request data
        if (!imageFile) {
            return res.status(400).json({ message: "Image is required!" });
        }
        const newProduct = new deal_of_the_day_model_1.default({
            image: imageFile,
            title: req.body.title,
            logo: logoFile,
            offer: req.body.offer,
        });
        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong!" });
    }
});
exports.default = router;
