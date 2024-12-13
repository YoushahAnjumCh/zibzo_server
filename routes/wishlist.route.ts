import express, { Request, Response } from "express";

import courses from "../models/product.model";
import { isAuthenticated } from "../middleware/auth.middleware";
var router = express.Router();

//! will update once integrate the app with the front end
router.get("/", isAuthenticated, async (req: Request, res: Response) => {
    try {
        const { id } = req.body;

      if (!id || !Array.isArray(id)) {
        return res.status(400).json({ message: "Invalid input! ids must be an array of numbers." });
      }
  
      const numericIds = id.map(id => Number(id)).filter(id => !isNaN(id));
  
      if (numericIds.length === 0) {
        return res.status(400).json({ message: "Invalid input! Array must contain valid numbers." });
      }
  
      const products = await courses.find({ id: { $in: numericIds } });
  
      if (products.length === 0) {
        return res.status(404).json({ message: "No products found!" });
      }
  
      res.status(200).json(products);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Something went wrong!" });
    }
  });


  router.get("/id", isAuthenticated, async (req: Request, res: Response) => {
    try {
        const { id } = req.body;

      if (!id || !Array.isArray(id)) {
        return res.status(400).json({ message: "Invalid input! ids must be an array of numbers." });
      }
  
      const numericIds = id.map(id => Number(id)).filter(id => !isNaN(id));
  
      if (numericIds.length === 0) {
        return res.status(400).json({ message: "Invalid input! Array must contain valid numbers." });
      }
      const products = await courses.find(
        { id: { $in: numericIds } },
        { price: 1, stock: 1, _id: 0 ,
      id:1,
        }  
    );
      if (products.length === 0) {
        return res.status(404).json({ message: "No products found!" });
      }
  
      res.status(200).json(products);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Something went wrong!" });
    }
  });
  export default router;
  