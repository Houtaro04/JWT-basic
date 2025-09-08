// backend/routes/user.js
const router = require("express").Router();
const userController = require("../controller/userController");
const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("../controller/middlewareController");

// Xem danh sách: mọi user đã đăng nhập
router.get("/", verifyToken, userController.getAllUsers);

// Xem 1 user: admin hoặc chính chủ
router.get("/:id", verifyTokenAndAuthorization, userController.getUserById);

// Xoá: admin hoặc chính chủ
router.delete("/:id", verifyTokenAndAuthorization, userController.deleteUser);

module.exports = router;
