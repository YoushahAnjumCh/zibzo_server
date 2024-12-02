import mongoose, { Schema, Document, Number } from "mongoose";

const categorySchema: Schema = new Schema({
  image: { type: String, required: true },
  title: { type: String, required: true },
  id: { type: Number },
});

const offerBannerModel = mongoose.model("offerbanner", categorySchema);

export default offerBannerModel;
