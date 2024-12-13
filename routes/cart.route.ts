import express, { Request, Response } from "express";
import cartModel from "../models/cart.model";
import productsModel from "../models/product.model";
import http from "http";
import { Server } from "socket.io"; // Use TypeScript-compatible socket.io
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

// Cart Routes
app.post("/", async (req: Request, res: Response) => {
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

app.get("/", async (req: Request, res: Response) => {
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

app.delete("/", async (req: Request, res: Response) => {
  try {
    const { userID, productID } = req.body;
    console.log(userID);
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
