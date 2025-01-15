import express, { Request, Response } from "express";

import product from "../models/product.model";
import banner from "../models/banner_model";
import cartModel from "../models/cart.model";
import { isAuthenticated } from "../middleware/auth.middleware";
import dotenv from "dotenv";
import categoryModel from "../models/category.model";
import offerbannerModel from "../models/offer_banner.model";
import dealoftheday from "../models/deal_of_the_day.model";
import mongoose from "mongoose";
import { S3Client } from "@aws-sdk/client-s3";
dotenv.config();
const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;
const accessKey = process.env.ACCESS_KEY;
const secretKey = process.env.SECRET_KEY;
const cloudFrontDomain = process.env.CLOUDFRONT_DOMAIN;

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
    const products = await product.find({});

    for (let product of products) {
      const imageUrls: string[] = [];

      if (Array.isArray(product.image)) {
        for (const imageKey of product.image) {
          const imageUrl = `${cloudFrontDomain}/${imageKey}`;
          imageUrls.push(imageUrl);
        }
      }

      product.image = imageUrls;
    }

    const homebanner = await banner.find({});

    for (let homebannerimage of homebanner) {
      homebannerimage.image = `${cloudFrontDomain}/${homebannerimage.image}`;
    }
    const category = await categoryModel.find({});

    for (let categories of category) {
      if (categories.image) {
        categories.image = `${cloudFrontDomain}/${categories.image}`;
      }
    }

    const offerbanner = await offerbannerModel.find({});

    for (let offerbannerImage of offerbanner) {
      offerbannerImage.image = `${cloudFrontDomain}/${offerbannerImage.image}`;
    }

    const offerdeal = await dealoftheday.find({});

    for (let offerDeal of offerdeal) {
      offerDeal.image = `${cloudFrontDomain}/${offerDeal.image}`;
      offerDeal.logo = `${cloudFrontDomain}/${offerDeal.logo}`;
    }

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

router.get(
  "/search",
  isAuthenticated,
  async function (req: Request, res: Response) {
    const query = req.query.q as string;
    const { limit, offset } = req.query;
    console.log(query);
    let listOfProducts = await product
      .find({
        title: { $regex: new RegExp(query, "i") },
      })
      .sort({ title: 1 })
      .limit(parseInt(limit as string))
      .skip(parseInt(offset as string));
    res.json(listOfProducts);
    try {
    } catch (error) {
      console.log(error);
      res.status(500).json({ msg: "Something went wrong !" });
    }
  }
);

router.get("/:id", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID!" });
    }

    const products = await product.findOne({ _id: id });
    if (!products) {
      return res.status(404).json({ message: "Product not found!" });
    }
    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong!" });
  }
});
// Get By Category

router.get(
  "/category/:id",
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const categoryID = req.params.id;
      const products = await product.find({ category: categoryID });

      if (!products) {
        return res.status(404).json({ message: "Product not found!" });
      }
      for (let product of products) {
        const imageUrls: string[] = [];

        if (Array.isArray(product.image)) {
          for (const imageKey of product.image) {
            const imageUrl = `${cloudFrontDomain}/${imageKey}`;
            imageUrls.push(imageUrl);
          }
        }

        product.image = imageUrls;
      }
      return res.status(200).json(products);
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

      const result = await product.deleteOne({ id });

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
