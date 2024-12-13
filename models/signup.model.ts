import mongoose, { Schema, Document } from "mongoose";
import bcrypt = require("bcrypt");
export interface ISignup extends Document {
  email: string;
  password: string;
  createdAt: Date;
  userName: string;
  userImage: string;
  uid: Number;
}

const signupSchema: Schema = new Schema({
  email: { type: String },
  password: { type: String },
  createdAt: { type: Date, default: Date.now },
  uid: { type: Number },
  userName: { type: String },
  userImage: { type: String },
  mobile: { type: Number },
});

// Add a pre-save hook to hash the password
signupSchema.pre("save", async function (next) {
  if (this.isModified("password") || this.isNew) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

const signupModel = mongoose.model<ISignup>("signup", signupSchema);

export default signupModel;
