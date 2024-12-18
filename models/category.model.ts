import mongoose, { Schema, Document } from "mongoose";

// Define a TypeScript interface for the Category document
interface ICategory extends Document {
  image: string;
  title: string;
  id?: number;
}

const categorySchema: Schema<ICategory> = new Schema({
  image: { type: String, required: true },
  title: { type: String, required: true },
  id: { type: Number },
});

const CategoryModel = mongoose.model<ICategory>("category", categorySchema);

export default CategoryModel;
