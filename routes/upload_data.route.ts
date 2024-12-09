import express, { Request, Response } from "express";

import courses from "../models/product.model";
import bannerModel from "../models/banner_model";
import categoryModel from "../models/category.model";
import offerbannerModel from "../models/offer_banner.model";
import dealOfTheDayModel from "../models/deal_of_the_day.model";
var router = express();

const multer = require("multer");
const path = require("path");

// Configure storage for multer
const storage = multer.diskStorage({
  destination: function (req: any, file: any, cb: any) {
    cb(null, "images/");
  },
  filename: function (req: any, file: any, cb: any) {
    cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });

//Product Data Upload
router.post(
  "/",
  upload.array("ProductImage", 10),
  async (req: any, res: any) => {
    try {
      console.log("BODY" + req.body);
      const newProductFromRequest = req.body;
      const imagePaths = req.files.map((file: any) => file.filename);
      console.log(newProductFromRequest);
      newProductFromRequest.images = imagePaths;

      const newProductToBeInserted = new courses({
        ...newProductFromRequest,
        image: imagePaths, // Store the array of image filenames
      });

      console.log(newProductToBeInserted);
      await newProductToBeInserted.save();

      return res.status(201).json(newProductToBeInserted);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Something went wrong!" });
    }
  }
);

// HomeBanner Upload

router.post(
  "/homebanner",
  upload.single("homebanner"),
  async (req: any, res: any) => {
    try {
      const newProductFromRequest = req.body;
      const imagePath = req.file ? req.file.filename : null;
      newProductFromRequest.image = imagePath;

      const newProductToBeInserted = new bannerModel({
        ...newProductFromRequest,
        ProductImage: imagePath,
      });

      console.log(newProductToBeInserted);
      await newProductToBeInserted.save();

      return res.status(201).json(newProductToBeInserted);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Something went wrong!" });
    }
  }
);

//Category Upload

router.post(
  "/category",
  upload.single("category"),
  async (req: any, res: any) => {
    try {
      const newProductFromRequest = req.body;
      const imagePath = req.file ? req.file.filename : null;
      newProductFromRequest.image = imagePath;

      const newProductToBeInserted = new categoryModel({
        ...newProductFromRequest,
        ProductImage: imagePath,
      });

      console.log(newProductToBeInserted);
      await newProductToBeInserted.save();

      return res.status(201).json(newProductToBeInserted);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Something went wrong!" });
    }
  }
);
//Offerbanner upload
router.post(
  "/offerbanner",
  upload.single("image"),
  async (req: any, res: any) => {
    try {
      const newProductFromRequest = req.body;
      const imagePath = req.file ? req.file.filename : null;
      newProductFromRequest.image = imagePath;

      const newProductToBeInserted = new offerbannerModel({
        ...newProductFromRequest,
        ProductImage: imagePath,
      });

      console.log(newProductToBeInserted);
      await newProductToBeInserted.save();

      return res.status(201).json(newProductToBeInserted);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Something went wrong!" });
    }
  }
);

//Deal of the Day Upload

router.post(
  "/dealday",
  upload.fields([
    { name: "dealofthedayimage", maxCount: 1 },
    { name: "dealofthedaylogo", maxCount: 1 },
  ]),
  async (req: any, res: any) => {
    try {
      const newProductFromRequest = req.body;
      console.log(newProductFromRequest);
      // Access file paths
      const imageFile = req.files?.dealofthedayimage?.[0]?.filename || null;
      const logoFile = req.files?.dealofthedaylogo?.[0]?.filename || null;

      // Include file paths in the request data

      if (!imageFile) {
        return res.status(400).json({ message: "Image is required!" });
      }

      const newProduct = new dealOfTheDayModel({
        image: imageFile,
        title: req.body.title,
        logo: logoFile,
        offer: req.body.offer,
      });
      const savedProduct = await newProduct.save();
      res.status(201).json(savedProduct);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Something went wrong!" });
    }
  }
);

export default router;
