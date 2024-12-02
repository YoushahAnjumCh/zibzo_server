import mongoose, { Schema } from "mongoose";

const dealOfTheDaySchema: Schema = new Schema({
  image: { type: String, required: true },
  title: { type: String, required: true },
  logo: { type: String },
  offer: { type: String },
  id: { type: Number },
});

const dealOfTheDayModel = mongoose.model("dealoftheday", dealOfTheDaySchema);

export default dealOfTheDayModel;
