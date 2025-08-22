// backend/controller/middlewareController.js
const jwt = require("jsonwebtoken");

function extractToken(req) {
  const auth = req.headers.authorization || req.headers.token || "";
  // chấp nhận "Bearer " không phân biệt hoa/thường
  const m = typeof auth === "string" ? auth.match(/^Bearer\s+(.+)$/i) : null;
  return (m && m[1]) || auth || req.cookies?.token || "";
}

const middlewareController = {
  verifyToken: (req, res, next) => {
    const token = extractToken(req);
    if (!token) return res.status(401).json({ message: "Bạn chưa đăng nhập" });

    jwt.verify(token, process.env.JWT_SECRET || "dev_secret", (err, payload) => {
      if (err) return res.status(401).json({ message: "Token không hợp lệ hoặc hết hạn" });
      // payload nên là { id, username, admin }
      req.user = payload;
      next();
    });
  },

  // Cho phép: admin hoặc đúng user id
  verifyTokenAndAuthorization: (req, res, next) => {
    middlewareController.verifyToken(req, res, () => {
      if (req.user?.admin || req.user?.id === req.params.id) return next();
      return res.status(403).json({ message: "Bạn không có quyền truy cập" });
    });
  },

  // Chỉ admin
  verifyTokenAndAdmin: (req, res, next) => {
    middlewareController.verifyToken(req, res, () => {
      if (req.user?.admin) return next();
      return res.status(403).json({ message: "Bạn không có quyền truy cập" });
    });
  },
};

module.exports = middlewareController;
