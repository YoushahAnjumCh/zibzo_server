"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
var router = express_1.default.Router();
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
exports.default = router;
