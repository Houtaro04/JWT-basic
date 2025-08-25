const express = require("express");
const router = express.Router();
const authController = require("../controller/authController");
const middlewareController = require("../controller/middlewareController");

router.get("/__ping", (req, res) => res.json({ ok: true }));

//REGISTER
router.post("/register", authController.registerUser);

//LOGIN
router.post("/login", authController.loginUser);

//REFRESH
router.post("/refresh", authController.requestRefreshToken);

//LOGOUT
router.post("/logout", middlewareController.verifyToken,authController.userLogout);

module.exports = router;
