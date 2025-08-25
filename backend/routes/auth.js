const express = require("express");
const router = express.Router();
const authController = require("../controller/authController");

router.get("/__ping", (req, res) => res.json({ ok: true }));

//REGISTER
router.post("/register", authController.registerUser);

//LOGIN
router.post("/login", authController.loginUser);

//REFRESH
router.post("/refresh", authController.requestRefreshToken);

//LOGOUT
router.post("/logout", authController.userLogout);

module.exports = router;
