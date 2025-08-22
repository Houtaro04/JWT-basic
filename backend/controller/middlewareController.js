const jwt = require("jsonwebtoken");

const middlewareController = {
  verifyToken: (req, res, next) => {
    // Lấy token từ Authorization / token header / cookie
    const hdr = req.headers.authorization || req.headers.token || "";
    const raw = hdr.startsWith("Bearer ") ? hdr.slice(7).trim() : hdr;
    const token = raw || req.cookies?.token;

    if (!token) {
      return res.status(401).json({ message: "Bạn chưa đăng nhập" });
    }

    jwt.verify(token, process.env.JWT_SECRET || "dev_secret", (err, user) => {
      if (err) return res.status(403).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
      req.user = user; // { id, username, admin, ... }
      next();
    });
  },
};

module.exports = middlewareController;
