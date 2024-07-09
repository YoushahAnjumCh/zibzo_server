import express, { Request, Response } from "express";
const mongoose = require("mongoose");

import courses from "../models/product.model";
import { isAuthenticated } from "../middleware/auth.middleware";
var router = express.Router();

router.get("/", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { limit, offset } = req.query;
    const products = await courses
      .find({})
      .limit(parseInt(limit as string))
      .skip(parseInt(offset as string));
    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong!" });
  }
});

router.get("/:id", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid product ID!" });
    }
    const products = await courses.findOne({ id });
    if (!products) {
      return res.status(404).json({ message: "Product not found!" });
    }
    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong!" });
  }
});

export default router;
