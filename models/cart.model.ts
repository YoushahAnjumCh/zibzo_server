import mongoose, { Schema } from "mongoose";

const cartSchema: Schema = new Schema({
  userID: { type: String, required: true },
  productID: { type: [], required: true },
});

const cartModel = mongoose.model("cart", cartSchema);

export default cartModel;
