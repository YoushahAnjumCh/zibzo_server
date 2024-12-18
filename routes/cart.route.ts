import express, { Request, Response } from "express";
import cartModel from "../models/cart.model";
import productsModel from "../models/product.model";
import cors from "cors";
import dotenv from "dotenv";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { isAuthenticated } from "../middleware/auth.middleware";

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

const app = express();

app.use(cors());
app.use(express.json());

// Cart Routes
app.post("/", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { userID, productID } = req.body;

    if (!userID || !productID) {
      return res
        .status(400)
        .json({ message: "userID and productID are required!" });
    }

    // Check if the cart exists for the user
    const existingCart = await cartModel.findOne({ userID });

    if (existingCart) {
      // Check if the productID already exists in the cart
      const isProductAlreadyAdded = existingCart.productID.includes(productID);

      if (isProductAlreadyAdded) {
        return res
          .status(400)
          .json({ message: "Product already added to the cart!" });
      }

      // Add the productID to the array (ensuring uniqueness)
      existingCart.productID = Array.from(
        new Set([...existingCart.productID, productID])
      );
      await existingCart.save();

      const cartProductCount = existingCart.productID.length;

      return res.status(200).json({ existingCart, cartProductCount });
    } else {
      // Create a new cart for the user
      const newCart = new cartModel({
        userID,
        productID: [productID], // Initialize as an array
      });
      await newCart.save();

      const cartProductCount = newCart.productID.length;

      return res.status(201).json({ newCart, cartProductCount });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Something went wrong!" });
  }
});

app.get("/", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { userID } = req.query;

    if (!userID) {
      return res.status(400).json({ message: "UserID is required!" });
    }

    const existingCart = await cartModel.findOne({ userID });

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

    const products = await productsModel.find({
      _id: { $in: existingCart.productID },
    });
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

    if (products.length === 0) {
      return res.status(404).json({ message: "No matching products found!" });
    }
    const cartProductCount = existingCart ? existingCart.productID.length : 0;

    return res
      .status(200)
      .json({ cart: existingCart, products, cartProductCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong!" });
  }
});

app.delete("/", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { userID, productID } = req.body;
    const cart = await cartModel.findOne({ userID });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found for this user!" });
    }

    cart.productID = cart.productID.filter((id: string) => id !== productID);

    if (cart.productID.length === 0) {
      await cartModel.deleteOne({ userID });
      const cartProductCount = cart.productID.length;
      // Emit the cart deleted event to the specific user
      return res
        .status(200)
        .json({ message: "Cart deleted as it was empty.", cartProductCount });
    }

    await cart.save();

    const products = await productsModel.find({
      _id: { $in: cart.productID },
    });
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

    if (products.length === 0) {
      return res.status(404).json({ message: "No matching products found!" });
    }
    const cartProductCount = cart ? cart.productID.length : 0;

    return res.status(200).json({ cart: cart, products, cartProductCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong!" });
  }
});

export default app;
