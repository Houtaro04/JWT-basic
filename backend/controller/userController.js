// backend/controller/userController.js
const mongoose = require("mongoose");
const User = require("../models/user");

const userController = {
  // Admin: GET /v1/user
  getAllUsers: async (req, res) => {
    try {
      const page  = Math.max(parseInt(req.query.page)  || 1, 1);
      const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 100);
      const skip  = (page - 1) * limit;

      const [items, total] = await Promise.all([
        User.find().select("-password -__v").skip(skip).limit(limit).sort({ createdAt: -1 }),
        User.countDocuments(),
      ]);

      return res.json({ page, limit, total, items });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  // User/Owner/Admin: GET /v1/user/:id
  getUserById: async (req, res) => {
    try {
      const { id } = req.params;
      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({ message: "Invalid id" });
      }
      const user = await User.findById(id).select("-password -__v");
      if (!user) return res.status(404).json({ message: "User not found" });
      return res.json(user);
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  // Đã có từ trước
  deleteUser: async (req, res) => {
    try {
      const { id } = req.params;
      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({ deleted: false, message: "Invalid id" });
      }
      const result = await User.deleteOne({ _id: id });
      if (result.deletedCount === 0) {
        return res.status(404).json({ deleted: false, message: "User not found" });
      }
      return res.status(200).json({ deleted: true, id });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ deleted: false, message: "Server error" });
    }
  },
};

module.exports = userController;
