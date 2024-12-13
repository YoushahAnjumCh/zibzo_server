import mongoose, { Schema, Document, Number } from "mongoose";
import { title } from "process";

const bannerSchema: Schema = new Schema({
  image: { type: String, required: true },
  title: { type: String, required: true },
  id: { type: Number },
});

const bannerModel = mongoose.model("home_banner", bannerSchema);

export default bannerModel;
