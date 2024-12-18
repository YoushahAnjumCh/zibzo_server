import express, { Request, Response } from "express";

import courses from "../models/product.model";
import banner from "../models/banner_model";
import cartModel from "../models/cart.model";
import { isAuthenticated } from "../middleware/auth.middleware";
import dotenv from "dotenv";
import categoryModel from "../models/category.model";
import offerbannerModel from "../models/offer_banner.model";
import dealoftheday from "../models/deal_of_the_day.model";
import mongoose from "mongoose";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
dotenv.config();
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
});

var router = express();
router.get("/", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { userID } = req.query;

    const products = await courses.find({});

    for (let product of products) {
      const imageUrls: string[] = [];

      for (const imageKey of product.image) {
        const getObjectParam = {
          Bucket: bucketName,
          Key: imageKey,
        };
        const command = new GetObjectCommand(getObjectParam);

        const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
        imageUrls.push(signedUrl);
      }

      product.image = imageUrls;
    }

    const homebanner = await banner.find({});

    for (let homebannerimage of homebanner) {
      const getObjectHomeBannerParams = {
        Bucket: bucketName,
        Key: homebannerimage.image,
      };

      const commandHomeBanner = new GetObjectCommand(getObjectHomeBannerParams);

      const homeBannerImage = await getSignedUrl(s3, commandHomeBanner, {
        expiresIn: 3600,
      });
      homebannerimage.image = homeBannerImage;
    }
    const category = await categoryModel.find({});

    // Update category images with signed URLs
    for (let categories of category) {
      const getObjectCategoryParams = {
        Bucket: bucketName,
        Key: categories.image,
      };

      const commandCategory = new GetObjectCommand(getObjectCategoryParams);

      const categoryImage = await getSignedUrl(s3, commandCategory, {
        expiresIn: 3600,
      });
      categories.image = categoryImage;
    }

    const offerbanner = await offerbannerModel.find({});
    // Update offerBanner images with signed URLs
    for (let offerbannerImage of offerbanner) {
      const getObjectOfferBannerParams = {
        Bucket: bucketName,
        Key: offerbannerImage.image,
      };

      const commandOfferBanner = new GetObjectCommand(
        getObjectOfferBannerParams
      );

      const offerBannerImage = await getSignedUrl(s3, commandOfferBanner, {
        expiresIn: 3600,
      });
      offerbannerImage.image = offerBannerImage;
    }

    const offerdeal = await dealoftheday.find({});
    // Update offerdeal images with signed URLs
    for (let offerDeal of offerdeal) {
      // Generate a pre-signed URL for the image
      if (offerDeal.image) {
        const getObjectParamsImage = {
          Bucket: bucketName,
          Key: offerDeal.image,
        };
        const commandImage = new GetObjectCommand(getObjectParamsImage);
        const dealDayImage = await getSignedUrl(s3, commandImage, {
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
        const commandLogo = new GetObjectCommand(getObjectParamsLogo);
        const dealDayLogo = await getSignedUrl(s3, commandLogo, {
          expiresIn: 3600,
        });
        offerDeal.logo = dealDayLogo;
      }
    }
    // Get cart product count for the user
    const existingCart = await cartModel.findOne({ userID });
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong!" });
  }
});

router.get("/:id", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID!" });
    }

    const products = await courses.findOne({ _id: id });
    if (!products) {
      return res.status(404).json({ message: "Product not found!" });
    }
    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong!" });
  }
});
//Get By Category
router.get(
  "/category/:id",
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const categoryID = req.params.id;
      console.log(categoryID);
      const products = await courses.find({ category: categoryID });
      if (!products) {
        return res.status(404).json({ message: "Product not found!" });
      }
      res.status(200).json(products);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Something went wrong!" });
    }
  }
);

router.delete(
  "/delete",
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid product ID!" });
      }

      const result = await courses.deleteOne({ id });

      if (result.deletedCount === 0) {
        return res.status(404).json({ message: "Product not found!" });
      }

      res.status(200).json({ message: "Product deleted successfully!" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Something went wrong!" });
    }
  }
);

export default router;
