const userController = require("../controller/userController");
const user = require("../models/user");

const router = require('express').Router();

// Kiểm tra base path
router.get("/__ping", (req, res) => res.json({ ok: true }));

//Get all users
router.get('/', userController.getAllUsers);

//Delete user
router.delete('/:id', userController.deleteUser);

module.exports = router;