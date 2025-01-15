import express, { Request, Response } from "express";

import { isAuthenticated } from "../middleware/auth.middleware";
var router = express.Router();

// router.post("/", isAuthenticated, async (req: Request, res: Response) => {
//   try {
//     const { id, userid, stock} = req.body;

// const product = await courses.findOne({ id });

// if (!product) {
//   return res.status(404).json({ message: "Product not found!" });
// }

// const orderedQuantity = stock;

// if (product.stock < orderedQuantity) {
//   return res.status(400).json({ message: "Not enough stock available!" });
// }

// const newOrder = await orderDetails.create({
//   id,
//   userid,
//   stock: orderedQuantity,
//   });
// const updatedStock = product.stock - orderedQuantity;
// await courses.updateOne({ id: product.id }, { $set: { stock: updatedStock } });

// res.status(201).json( "Placed Order SuccessFully" );

// } catch (error) {
// console.error(error);
// res.status(500).json({ message: "Something went wrong!" });
// }
// });

export default router;
