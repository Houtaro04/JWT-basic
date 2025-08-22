const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const authRoute = require("./routes/auth");
const userRoute = require("./routes/user");

dotenv.config();
const app = express();

mongoose.connect(process.env.MONGODB_URI, {})
.then(() => console.log("MongoDB connected"))
.catch((err) => console.error("MongoDB connection failed:", err));

app.use(cors());
app.use(cookieParser());
app.use(express.json());

//ROUTES
app.use("/v1/auth", (req, _res, next) => {
  console.log("HIT /v1/auth ->", req.method, req.originalUrl);
  next();
}, authRoute);

app.use("/v1/user", (req, res, next) => {
  console.log("HIT /v1/user ->", req.method, req.originalUrl);
  next();
}, userRoute);


app.listen(8000, () => {
    console.log("Server is running");
})
