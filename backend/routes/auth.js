const authController = require("../controller/authController");

const router = require("express").Router();

router.post("/register", authController.registerUser);