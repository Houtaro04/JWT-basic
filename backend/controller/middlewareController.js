// backend/controller/middlewareController.js
const jwt = require("jsonwebtoken");

function extractToken(req) {
  const raw = req.headers.authorization || req.headers.token || "";
  const m = typeof raw === "string" ? raw.match(/^Bearer\s+(.+)$/i) : null;
  return (m && m[1]) || raw || req.cookies?.token || "";
}

const verifyToken = (req, res, next) => {
  const token = extractToken(req);
  if (!token) return res.status(401).json({ message: "Bạn chưa đăng nhập" });

  jwt.verify(token, process.env.JWT_SECRET || "dev_secret", (err, payload) => {
    if (err) return res.status(401).json({ message: "Token không hợp lệ hoặc hết hạn" });
    req.user = payload; // { id, username, admin }
    next();
  });
};

const verifyTokenAndAuthorization = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user?.admin || req.user?.id === req.params.id) return next();
    return res.status(403).json({ message: "Bạn không có quyền truy cập" });
  });
};

const verifyTokenAndAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user?.admin) return next();
    return res.status(403).json({ message: "Bạn không có quyền truy cập" });
  });
};

module.exports = {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
};
