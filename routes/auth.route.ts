import express, { Request, Response } from "express";
import signupModel from "../models/signup.model";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { log } from "console";
import crypto from "crypto";
import dotenv from "dotenv";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
// import { isAuthenticated } from "middleware/auth.middleware";
var router = express.Router();

const multer = require("multer");
const path = require("path");
dotenv.config();
const randomImageName = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("hex");
const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;
const accessKey = process.env.ACCESS_KEY;
const secretKey = process.env.SECRET_KEY;
const cloudFrontDomain = process.env.CLOUDFRONT_DOMAIN;

const s3 = new S3Client({
  credentials: {
    accessKeyId: accessKey || "",
    secretAccessKey: secretKey || "",
  },
  region: bucketRegion || "",
  maxAttempts: 5,
  requestHandler: {
    httpOptions: {
      timeout: 300000,
      maxRedirects: 10,
    },
  },
});

const storage = multer.memoryStorage({});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 },
});
router.post(
  "/signup",
  upload.single("userImage"),
  async (req: any, res: any) => {
    try {
      if (!req.body || !req.body.email) {
        return res.status(400).json({ msg: "email is missing" });
      }

      const { email, password, userName } = req.body;
      const existingEmail = await signupModel.findOne({ email });
      if (existingEmail) {
        return res.status(409).json({ msg: "Email already exists" });
      }
      let userImage = "";

      if (req.file) {
        const categoryImageName = randomImageName();

        const uploadCategoryParams = {
          Bucket: bucketName,
          Body: req.file.buffer,
          Key: categoryImageName,
          ContentType: req.file.mimetype,
        };

        const commandCategory = new PutObjectCommand(uploadCategoryParams);

        await s3.send(commandCategory);

        userImage = categoryImageName;
      }
      const newUser = new signupModel({
        email,
        password,
        userName,
        uid: 2,
        userImage: userImage,
      });

      await newUser.save();

      const { id } = newUser;
      res.status(201).json({ email, userName, id });
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: "Something went wrong!" });
    }
  }
);

//Login
router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user = await signupModel.findOne({ email: email });
    const userImage = `${cloudFrontDomain}/${user?.userImage}`;

    if (user) {
      if (user.uid == 2) {
        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
          let payload = {
            email: user.email,
            lastLogin: new Date().toISOString(),
          };

          jwt.sign(
            payload,
            process.env.JWT_SECRET_KEY ?? "JWT_SECRET_KEY",

            (err, token) => {
              if (err) {
                return res
                  .status(500)
                  .json({ msg: "Error generating token" + err });
              } else {
                return res.status(200).json({
                  token,
                  email: user.email,

                  userName: user.userName,
                  id: user.id,
                  image: userImage,
                });
              }
            }
          );
        } else {
          return res.status(405).json({ msg: "Password is incorrect" });
        }
      } else {
        return res.status(404).json({ msg: "You are not a User" });
      }
    } else {
      return res.status(404).json({ msg: "User not found" });
    }
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({ msg: "Server error", error: error });
  }
});

//Admin login
router.post("/adminLogin", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await signupModel.findOne({ email: email });
    if (user) {
      if (user.uid == 1) {
        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
          let payload = {
            email: user.email,
            lastLogin: new Date().toISOString(),
          };

          jwt.sign(
            payload,
            process.env.JWT_SECRET_KEY ?? "JWT_SECRET_KEY",

            (err, token) => {
              if (err) {
                return res.status(500).json({ msg: "Error generating token" });
              } else {
                return res.status(200).json({
                  email: user.email,
                  id: user.id,
                  userName: user.userName,
                  token,
                });
              }
            }
          );
        } else {
          return res.status(405).json({ msg: "Password is incorrect" });
        }
      } else {
        return res.status(404).json({ msg: "You are not a Admin" });
      }
    } else {
      return res.status(404).json({ msg: "User not found" });
    }
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({ msg: "Server error", error: error });
  }
});

export default router;
