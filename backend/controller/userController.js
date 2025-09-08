// backend/controller/userController.js
const mongoose = require("mongoose");
const User = require("../models/user");

// Chọn các trường an toàn (không trả password, __v)
const SAFE_PROJECTION = "username email admin createdAt updatedAt";

const userController = {
  // ANY logged-in user: GET /v1/user?page=&limit=
  getAllUsers: async (req, res) => {
    try {
      const page  = Math.max(parseInt(req.query.page)  || 1, 1);
      const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 100);
      const skip  = (page - 1) * limit;

      const [items, total] = await Promise.all([
        User.find({})
          .select(SAFE_PROJECTION)
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 })
          .lean(),
        User.countDocuments(),
      ]);

      return res.json({ page, limit, total, items });
    } catch (e) {
      console.error("GET USERS ERROR:", e);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  // Owner/Admin: GET /v1/user/:id
  getUserById: async (req, res) => {
    try {
      const { id } = req.params;
      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({ message: "Invalid id" });
      }
      const user = await User.findById(id).select(SAFE_PROJECTION).lean();
      if (!user) return res.status(404).json({ message: "User not found" });
      return res.json(user);
    } catch (e) {
      console.error("GET USER BY ID ERROR:", e);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  // Admin OR chính chủ: DELETE /v1/user/:id
  deleteUser: async (req, res) => {
    try {
      const { id } = req.params;
      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({ deleted: false, message: "Invalid id" });
      }

      // req.user được gắn bởi middleware verifyToken
      const requester = req.user || {};
      const isAdmin = !!requester.admin;
      const isOwner = requester?.id?.toString?.() === id?.toString?.();

      // user thường chỉ được xoá chính mình
      if (!isAdmin && !isOwner) {
        return res
          .status(403)
          .json({ deleted: false, message: "Bạn không có quyền làm điều đó" });
      }

      // không cho user thường xoá tài khoản admin
      const target = await User.findById(id).select("admin").lean();
      if (!target) {
        return res.status(404).json({ deleted: false, message: "User not found" });
      }
      if (target.admin && !isAdmin) {
        return res
          .status(403)
          .json({ deleted: false, message: "Bạn không có quyền xoá tài khoản admin" });
      }

      const result = await User.deleteOne({ _id: id });
      if (result.deletedCount === 0) {
        return res.status(404).json({ deleted: false, message: "User not found" });
      }
      return res.status(200).json({ deleted: true, id });
    } catch (e) {
      console.error("DELETE USER ERROR:", e);
      return res.status(500).json({ deleted: false, message: "Server error" });
    }
  },
};

module.exports = userController;
