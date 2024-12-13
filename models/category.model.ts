import mongoose, { Schema, Document, Number } from "mongoose";

const categorySchema: Schema = new Schema({
  image: { type: String, required: true },
  title: { type: String, required: true },
  id: { type: Number },
});

const categoryModel = mongoose.model("category", categorySchema);

export default categoryModel;
