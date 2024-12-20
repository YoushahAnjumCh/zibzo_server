"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_route_1 = __importDefault(require("./routes/auth.route"));
const products_route_1 = __importDefault(require("./routes/products.route"));
const wishlist_route_1 = __importDefault(require("./routes/wishlist.route"));
const order_details_route_1 = __importDefault(require("./routes/order_details.route"));
const upload_data_route_1 = __importDefault(require("./routes/upload_data.route"));
const cart_route_1 = __importDefault(require("./routes/cart.route"));
const body_parser_1 = __importDefault(require("body-parser"));
dotenv_1.default.config();
const password = process.env.MONGO_PASSWORD;
const connectionString = `mongodb+srv://Youshah4499:${password}@zibzo.tqwnn.mongodb.net/zibzo_server?retryWrites=true&w=majority&appName=ZibZo`;
mongoose_1.default
    .connect(connectionString)
    .then(() => {
    console.log("Connected to MongoDB successfully!");
})
    .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
});
var app = (0, express_1.default)();
const allowedOrigins = ["http://localhost:3000", "https://zibzo.youshah.com"];
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
        res.header("Access-Control-Allow-Origin", origin);
    }
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
});
app.use((0, cors_1.default)());
// Middleware for parsing requests
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use(body_parser_1.default.json({ limit: "50mb" })); // Increase the limit for JSON requests
app.use(body_parser_1.default.urlencoded({ limit: "50mb", extended: true })); // Increase for URL-encoded requests
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use(express_1.default.static("images"));
app.use("/upload", upload_data_route_1.default);
app.use("/auth", auth_route_1.default);
app.use("/products", products_route_1.default);
app.use("/wishlist", wishlist_route_1.default);
app.use("/order_details", order_details_route_1.default);
app.use("/cart", cart_route_1.default);
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server running @ port ${PORT} !`);
});
