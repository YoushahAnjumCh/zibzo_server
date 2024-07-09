import express, { Request, Response } from "express";
import signupModel from "../models/signup.model";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
// import { isAuthenticated } from "middleware/auth.middleware";
var router = express.Router();

router.post("/signup", async (req: Request, res: Response) => {
  try {
    if (!req.body || !req.body.email) {
      return res.status(400).json({ msg: "Missing email in request body" });
    }
    const { email } = req.body;
    const existingEmail = await signupModel.findOne({ email });
    if (existingEmail) {
      return res.status(409).json({ msg: "Email already exists" });
    }
    let newProductFromRequest = req.body;
    let newProductToBeInserted = new signupModel({ ...newProductFromRequest });
    await newProductToBeInserted.save();
    const { firstName, lastName, id } = newProductToBeInserted;
    res.status(201).json({ email, firstName, lastName, id });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Something went wrong !" });
  }
});

//Login

router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await signupModel.findOne({ email: email });
    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        let payload = {
          email: user.email,
          lastLogin: new Date().toISOString(),
        };

        jwt.sign(
          payload,
          process.env.JWT_SECRET_KEY ?? "",

          (err, token) => {
            if (err) {
              console.error(err);
              return res.status(500).json({ msg: "Error generating token" });
            } else {
              return res.status(200).json({
                token,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                id: user.id,
              });
            }
          }
        );
      } else {
        return res.status(405).json({ msg: "Password is incorrect" });
      }
    } else {
      return res.status(404).json({ msg: "User not found" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Server error" });
  }
});

export default router;
