"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuthenticated = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const isAuthenticated = (req, res, next) => {
    var _a;
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
        const token = (authHeader === null || authHeader === void 0 ? void 0 : authHeader.split(" ")[1]) || "";
        if (token) {
            jsonwebtoken_1.default.verify(token, (_a = process.env.JWT_SECRET_KEY) !== null && _a !== void 0 ? _a : "", (message, decodedToken) => {
                if (message)
                    return res.status(500).json({ message: "Invalid Token" });
                // redirect to login page
                if (decodedToken)
                    next();
            });
        }
        else {
            return res.status(401).json({ message: "Token not found !" });
        }
    }
    catch (message) { }
};
exports.isAuthenticated = isAuthenticated;
