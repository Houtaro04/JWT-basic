// controllers/authController.js
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const ACCESS_TTL  = process.env.ACCESS_TTL  || "15m";   // tuỳ chỉnh
const REFRESH_TTL = process.env.REFRESH_TTL || "30d";

const ACCESS_SECRET  = process.env.JWT_SECRET         || "dev_secret";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "dev_refresh_secret";

// Lưu trong RAM cho demo; production nên dùng DB/Redis
let refreshTokens = [];

// Helper: chuẩn hoá user đầu vào để lấy id
function getUserId(u) {
  return u?.id || u?._id?.toString?.() || u?._id || null;
}
function toSafeUser(doc) {
  const o = doc.toObject ? doc.toObject() : doc;
  const { password, __v, ...safe } = o;
  return safe;
}
function parseBasicAuth(req) {
  const auth = req.headers.authorization || "";
  const m = auth.match(/^Basic\s+(.+)$/i);
  if (!m) return null;
  const decoded = Buffer.from(m[1], "base64").toString("utf8");
  const i = decoded.indexOf(":");
  return {
    id: i >= 0 ? decoded.slice(0, i) : decoded,   // có thể là username hoặc email
    password: i >= 0 ? decoded.slice(i + 1) : "",
  };
}

const authController = {
  // REGISTER
  async registerUser(req, res) {
    try {
      const { username, email, password } = req.body || {};
      if (!username || !password) {
        return res.status(400).json({ message: "Thiếu username hoặc password" });
      }

      const existed = await User.findOne({ username });
      if (existed) return res.status(409).json({ message: "Username đã tồn tại" });

      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(password, salt);

      const user = await User.create({ username, email, password: hashed });
      return res.status(201).json(toSafeUser(user));
    } catch (err) {
      console.error("REGISTER ERROR:", err);
      return res.status(500).json({ message: "Server error" });
    }
  },

  // GENERATE TOKENS
  generateAccessToken(userLike) {
    const id = getUserId(userLike);
    return jwt.sign(
      { id, username: userLike.username, admin: !!userLike.admin },
      ACCESS_SECRET,
      { expiresIn: ACCESS_TTL }
    );
  },
  generateRefreshToken(userLike) {
    const id = getUserId(userLike);
    return jwt.sign(
      { id, username: userLike.username, admin: !!userLike.admin },
      REFRESH_SECRET,
      { expiresIn: REFRESH_TTL }
    );
  },

  // LOGIN (payload chỉ có username/email; password nằm ở Basic header)
  async loginUser(req, res) {
    try {
      const { username, email } = req.body || {};
      const basic = parseBasicAuth(req);
      if (!basic) {
        return res.status(400).json({ message: "Thiếu thông tin đăng nhập (Authorization: Basic ...)" });
      }
      const identifier = username || email;
      if (!identifier || !basic.password) {
        return res.status(400).json({ message: "Thiếu username/email hoặc password" });
      }
      // Nếu client gửi username, yêu cầu header id khớp để tránh tráo
      if (username && basic.id !== username) {
        return res.status(400).json({ message: "Thông tin đăng nhập không hợp lệ" });
      }
      // Nếu đăng nhập bằng email, cho phép header.id là email
      if (email && basic.id !== email) {
        return res.status(400).json({ message: "Thông tin đăng nhập không hợp lệ" });
      }

      const query = username ? { username } : { email };
      const user = await User.findOne(query).select("+password");
      if (!user) return res.status(401).json({ message: "Sai tài khoản hoặc mật khẩu" });

      const ok = await bcrypt.compare(basic.password, user.password);
      if (!ok) return res.status(401).json({ message: "Sai tài khoản hoặc mật khẩu" });

      const accessToken  = authController.generateAccessToken(user);
      const refreshToken = authController.generateRefreshToken(user);
      refreshTokens.push(refreshToken);

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30d
      });

      return res.json({ user: toSafeUser(user), token: accessToken });
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      return res.status(500).json({ message: "Server error" });
    }
  },

  // REFRESH
  async requestRefreshToken(req, res) {
    try {
      const oldToken = req.cookies?.refreshToken;
      if (!oldToken) return res.status(401).json({ message: "Missing refresh token" });
      if (!refreshTokens.includes(oldToken)) {
        return res.status(403).json({ message: "Refresh token is not valid" });
      }

      jwt.verify(oldToken, REFRESH_SECRET, (err, payload) => {
        if (err) {
          console.error("REFRESH VERIFY ERROR:", err);
          return res.status(403).json({ message: "Refresh token is not valid" });
        }

        // Xoá token cũ, phát token mới
        refreshTokens = refreshTokens.filter(t => t !== oldToken);

        const userLike = { id: payload.id, username: payload.username, admin: payload.admin };
        const newAccessToken  = authController.generateAccessToken(userLike);
        const newRefreshToken = authController.generateRefreshToken(userLike);
        refreshTokens.push(newRefreshToken);

        res.cookie("refreshToken", newRefreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 30 * 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({ token: newAccessToken });
      });
    } catch (err) {
      console.error("REFRESH ERROR:", err);
      return res.status(500).json({ message: "Server error" });
    }
  },

  // LOGOUT
  async userLogout(req, res) {
    try {
      const old = req.cookies?.refreshToken;
      res.clearCookie("refreshToken", { path: "/" });
      if (old) {
        refreshTokens = refreshTokens.filter(t => t !== old);
      }
      return res.status(200).json({ message: "Logged out!" });
    } catch (err) {
      console.error("LOGOUT ERROR:", err);
      return res.status(500).json({ message: "Server error" });
    }
  },
};

module.exports = authController;
