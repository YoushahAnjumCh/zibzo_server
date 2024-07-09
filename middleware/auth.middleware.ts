import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // jwt-token=token;xyz=123;name=pqr;
    // use this if token is passed in cookie
    // const cookie = req.headers.cookie;
    // if (cookie) {
    //   const values = cookie?.split(";").reduce((prevItems, item) => {
    //     const data = item.trim().split("=");
    //     return { ...prevItems, [data[0]]: data[1] };
    //   }, {});
    //   console.log(values);
    // }
    //use this if token passed in header
    const authHeader = req.headers.authorization; // Bearer token
    const token = authHeader?.split(" ")[1] || "";

    if (token) {
      jwt.verify(
        token,
        process.env.JWT_SECRET_KEY ?? "",
        (message: any, decodedToken) => {
          if (message)
            return res.status(500).json({ message: "Invalid Token" });
          // redirect to login page
          if (decodedToken) next();
        }
      );
    } else {
      return res.status(401).json({ message: "Token not found !" });
    }
  } catch (message) {}
};
