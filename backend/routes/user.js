// backend/routes/user.js
const router = require("express").Router();
const userController = require("../controller/userController");
const mw = require("../controller/middlewareController");

// Health check (tuỳ chọn)
router.get("/__ping", (req, res) => res.json({ ok: true }));

// Admin xem tất cả users
router.get("/", mw.verifyTokenAndAdmin, userController.getAllUsers);

// User chỉ xem chính mình (hoặc admin xem bất kỳ id)
router.get("/:id", mw.verifyTokenAndAuthorization, userController.getUserById);

// Xoá user: cho admin hoặc chính chủ
router.delete("/:id", mw.verifyTokenAndAuthorization, userController.deleteUser);

module.exports = router;
