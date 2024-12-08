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
dotenv_1.default.config();
const password = process.env.MONGO_PASSWORD;
 const connectionString = `mongodb+srv://Youshah4499:${password}@zibzo.tqwnn.mongodb.net/zibzo_server?retryWrites=true&w=majority&appName=ZibZo`;
mongoose_1.default.connect(connectionString);
mongoose_1.default.connection.on("open", () => {
    console.log("Onlineshoppingdb connected successfully !");
});
var app = (0, express_1.default)();
app.use((_req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    next();
});
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ limit: "10mb", extended: true }));
app.use((0, cors_1.default)()); // enable cors at application level
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use(express_1.default.static("images"));
app.use("/auth", auth_route_1.default);
app.use("/products", products_route_1.default);
app.use("/wishlist", wishlist_route_1.default);
app.use("/order_details", order_details_route_1.default);
app.use("/cart", cart_route_1.default);
app.use("/upload", upload_data_route_1.default);
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server running @ port ${PORT} !`);
});
