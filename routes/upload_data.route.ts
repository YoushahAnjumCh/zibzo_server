import express, { Request, Response } from "express";

import courses from "../models/product.model";
import bannerModel from "../models/banner_model";
import categoryModel from "../models/category.model";
import offerbannerModel from "../models/offer_banner.model";
import dealOfTheDayModel from "../models/deal_of_the_day.model";
var router = express();

const multer = require("multer");
const bodyParser = require("body-parser");
import crypto from "crypto";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

import dotenv from "dotenv";
var app = express();
dotenv.config();
//For image name random generate
const randomImageName = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("hex");

const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;
const accessKey = process.env.ACCESS_KEY;
const secretKey = process.env.SECRET_KEY;

const s3 = new S3Client({
  credentials: {
    accessKeyId: accessKey || "",
    secretAccessKey: secretKey || "",
  },
  region: bucketRegion || "",
  maxAttempts: 5, // Retry on failure for a number of attempts
  requestHandler: {
    httpOptions: {
      timeout: 300000,
      maxRedirects: 10,
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
router.post(
  "/",
  upload.array("ProductImage", 10), // Accept up to 10 files
  async (req: any, res: any) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "Please upload images" });
      }

      const newProductFromRequest = req.body;
      const imagePaths: string[] = [];

      // Upload each image to S3
      for (const file of req.files) {
        const imageName = randomImageName(); // Generate a unique image name for each file

        const uploadParams = {
          Bucket: bucketName,
          Body: file.buffer,
          Key: imageName,
          ContentType: file.mimetype,
        };

        const command = new PutObjectCommand(uploadParams);
        await s3.send(command);

        imagePaths.push(imageName);
      }

      const newProductToBeInserted = new courses({
        ...newProductFromRequest,
        image: imagePaths,
      });

      await newProductToBeInserted.save();

      return res.status(201).json(newProductToBeInserted);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error", error });
    }
  }
);
router.post(
  "/homebanner",
  upload.single("homebanner"),
  async (req: any, res: any) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Upload image" });
      }

      const homeBannerImageName = randomImageName();

      const uploadHomeBannerParams = {
        Bucket: bucketName,
        Body: req.file.buffer,
        Key: homeBannerImageName,
        ContentType: req.file.mimetype,
      };

      const commandHomeBanner = new PutObjectCommand(uploadHomeBannerParams);
      await s3.send(commandHomeBanner);

      const newProductToBeInserted = new bannerModel({
        ...req.body,
        image: homeBannerImageName,
      });

      const savedProduct = await newProductToBeInserted.save();

      return res.status(201).json(savedProduct);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error", error: error });
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
      const categoryImageName = randomImageName();

      const uploadCategoryParams = {
        Bucket: bucketName,
        Body: req.file.buffer,
        Key: categoryImageName,
        ContentType: req.file.mimetype,
      };

      const commandCategory = new PutObjectCommand(uploadCategoryParams);

      await s3.send(commandCategory);

      const newProductToBeInserted = new categoryModel({
        ...newProductFromRequest,
        image: categoryImageName,
      });

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
  upload.single("offerbannerImage"),
  async (req: any, res: any) => {
    try {
      const newProductFromRequest = req.body;
      const offerBannerImageName = randomImageName();

      const uploadOfferBannerParams = {
        Bucket: bucketName,
        Body: req.file.buffer,
        Key: offerBannerImageName,
        ContentType: req.file.mimetype,
      };

      const commandOfferBanner = new PutObjectCommand(uploadOfferBannerParams);

      await s3.send(commandOfferBanner);

      const newProductToBeInserted = new offerbannerModel({
        ...newProductFromRequest,
        image: offerBannerImageName,
      });

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
      if (
        !req.files ||
        !req.files.dealofthedayimage ||
        !req.files.dealofthedaylogo
      ) {
        return res
          .status(400)
          .json({ message: "Please upload both image and logo" });
      }

      const dealDayImageName = randomImageName();
      const dealDayLogoName = randomImageName();

      const imageFile = req.files.dealofthedayimage[0];
      const uploadParamsImage = {
        Bucket: bucketName,
        Body: imageFile.buffer,
        Key: dealDayImageName,
        ContentType: imageFile.mimetype,
      };
      const commandImage = new PutObjectCommand(uploadParamsImage);
      await s3.send(commandImage);

      const logoFile = req.files.dealofthedaylogo[0];
      const uploadParamsLogo = {
        Bucket: bucketName,
        Body: logoFile.buffer,
        Key: dealDayLogoName,
        ContentType: logoFile.mimetype,
      };
      const commandLogo = new PutObjectCommand(uploadParamsLogo);
      await s3.send(commandLogo);

      const newProduct = new dealOfTheDayModel({
        image: dealDayImageName,
        title: req.body.title,
        logo: dealDayLogoName,
        offer: req.body.offer,
      });
      const savedProduct = await newProduct.save();

      res.status(201).json(savedProduct);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Something went wrong!", error });
    }
  }
);

export default router;
