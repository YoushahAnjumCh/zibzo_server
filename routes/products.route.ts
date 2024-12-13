import express, { Request, Response } from "express";

import courses from "../models/product.model";
import banner from "../models/banner_model";
import cartModel from "../models/cart.model";
import { isAuthenticated } from "../middleware/auth.middleware";

import categoryModel from "../models/category.model";
import offerbannerModel from "../models/offer_banner.model";
import dealoftheday from "../models/deal_of_the_day.model";
import mongoose from "mongoose";

var router = express();

router.get("/", async (req: Request, res: Response) => {
  try {
    const {
      // limit, offset,
      userID,
    } = req.query;
    const products = await courses.find({});
    // .limit(parseInt(limit as string))
    // .skip(parseInt(offset as string))
    const homebanner = await banner.find({});
    const category = await categoryModel.find({});
    const offerbanner = await offerbannerModel.find({});
    const offerdeal = await dealoftheday.find({});

    const existingCart = await cartModel.findOne({ userID });

    const cartProductCount = existingCart ? existingCart.productID.length : 0;

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
