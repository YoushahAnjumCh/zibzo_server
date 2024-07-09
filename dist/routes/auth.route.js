"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const signup_model_1 = __importDefault(require("../models/signup.model"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// import { isAuthenticated } from "middleware/auth.middleware";
var router = express_1.default.Router();
router.post("/signup", async (req, res) => {
    try {
        if (!req.body || !req.body.email) {
            return res.status(400).json({ msg: "Missing email in request body" });
        }
        const { email } = req.body;
        const existingEmail = await signup_model_1.default.findOne({ email });
        if (existingEmail) {
            return res.status(409).json({ msg: "Email already exists" });
        }
        let newProductFromRequest = req.body;
        let newProductToBeInserted = new signup_model_1.default(Object.assign({}, newProductFromRequest));
        await newProductToBeInserted.save();
        const { firstName, lastName, id } = newProductToBeInserted;
        res.status(201).json({ email, firstName, lastName, id });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Something went wrong !" });
    }
});
//Login
router.post("/login", async (req, res) => {
    var _a;
    const { email, password } = req.body;
    try {
        const user = await signup_model_1.default.findOne({ email: email });
        if (user) {
            const isMatch = await bcrypt_1.default.compare(password, user.password);
            if (isMatch) {
                let payload = {
                    email: user.email,
                    lastLogin: new Date().toISOString(),
                };
                jsonwebtoken_1.default.sign(payload, (_a = process.env.JWT_SECRET_KEY) !== null && _a !== void 0 ? _a : "", (err, token) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).json({ msg: "Error generating token" });
                    }
                    else {
                        return res.status(200).json({
                            token,
                            email: user.email,
                            firstName: user.firstName,
                            lastName: user.lastName,
                            id: user.id,
                        });
                    }
                });
            }
            else {
                return res.status(405).json({ msg: "Password is incorrect" });
            }
        }
        else {
            return res.status(404).json({ msg: "User not found" });
        }
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "Server error" });
    }
});
exports.default = router;
