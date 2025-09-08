// backend/controller/authController.js
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const ACCESS_TTL  = process.env.ACCESS_TTL  || "1d";
const REFRESH_TTL = process.env.REFRESH_TTL || "30d";
const ACCESS_SECRET  = process.env.JWT_SECRET         || "dev_secret";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "dev_refresh_secret";

let refreshTokens = [];

/* ---------- helpers ---------- */
function toSafeUser(doc) {
  const o = doc?.toObject ? doc.toObject() : doc;
  const { password, __v, ...safe } = o || {};
  return safe;
}
function parseBasicAuth(req) {
  const auth = req.headers.authorization || "";
  const m = auth.match(/^Basic\s+(.+)$/i);
  if (!m) return null;
  const decoded = Buffer.from(m[1], "base64").toString("utf8");
  const i = decoded.indexOf(":");
  return { id: i >= 0 ? decoded.slice(0, i) : decoded, password: i >= 0 ? decoded.slice(i + 1) : "" };
}
function extractLogin(req) {
  const body = req.body || {};
  const basic = parseBasicAuth(req);
  let field = null, identifier = null;
  if (body.username) { field = "username"; identifier = body.username; }
  else if (body.email) { field = "email"; identifier = body.email; }
  else if (basic?.id) { field = basic.id.includes("@") ? "email" : "username"; identifier = basic.id; }
  const password = basic?.password || body.password || "";
  return { field, identifier, password };
}
function generateAccessToken(userLike) {
  const id = userLike.id || userLike._id?.toString?.();
  return jwt.sign({ id, username: userLike.username, admin: !!userLike.admin }, ACCESS_SECRET, { expiresIn: ACCESS_TTL });
}
function generateRefreshToken(userLike) {
  const id = userLike.id || userLike._id?.toString?.();
  return jwt.sign({ id, username: userLike.username, admin: !!userLike.admin }, REFRESH_SECRET, { expiresIn: REFRESH_TTL });
}
/* ----------------------------- */

const authController = {
  async registerUser(req, res) {
    try {
      const { username, email, password } = req.body || {};
      if (!username || !email || !password) {
        return res.status(400).json({ message: "Thiếu username, email hoặc password" });
      }
      const existed = await User.findOne({ $or: [{ username }, { email }] }).lean();
      if (existed) {
        const field = existed.username === username ? "username" : "email";
        return res.status(409).json({ message: `${field} đã tồn tại` });
      }
      const hashed = await bcrypt.hash(password, 10);
      const user = await User.create({ username, email, password: hashed });
      return res.status(201).json(toSafeUser(user));
    } catch (err) {
      console.error("REGISTER ERROR:", err);
      return res.status(500).json({ message: "Server error" });
    }
  },

  async loginUser(req, res) {
    try {
      const { field, identifier, password } = extractLogin(req);
      if (!field || !identifier || !password) {
        return res.status(400).json({ message: "Thiếu username/email hoặc password" });
      }
      const query = field === "email" ? { email: identifier } : { username: identifier };
      const user = await User.findOne(query).select("+password username email admin");
      if (!user) return res.status(401).json({ message: "Sai tài khoản hoặc mật khẩu" });

      if (!user.password) {
        return res.status(500).json({ message: "Mật khẩu không khả dụng (schema select:false? cần .select('+password'))." });
      }

      const ok = await bcrypt.compare(password, user.password);
      if (!ok) return res.status(401).json({ message: "Sai tài khoản hoặc mật khẩu" });

      const payload = { id: user._id.toString(), username: user.username, admin: user.admin };
      const token  = generateAccessToken(payload);     // <-- KHÔNG dùng this
      const rToken = generateRefreshToken(payload);    // <-- KHÔNG dùng this
      refreshTokens.push(rToken);

      res.cookie("refreshToken", rToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      return res.json({ user: toSafeUser(user), token });
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      return res.status(500).json({ message: "Server error" });
    }
  },

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
        refreshTokens = refreshTokens.filter(t => t !== oldToken);

        const userLike = { id: payload.id, username: payload.username, admin: payload.admin };
        const newAccessToken  = generateAccessToken(userLike);   // <-- dùng hàm thuần
        const newRefreshToken = generateRefreshToken(userLike);  // <-- dùng hàm thuần
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

  async userLogout(req, res) {
    try {
      const old = req.cookies?.refreshToken;
      res.clearCookie("refreshToken", { path: "/" });
      if (old) refreshTokens = refreshTokens.filter(t => t !== old);
      return res.status(200).json({ message: "Logged out!" });
    } catch (err) {
      console.error("LOGOUT ERROR:", err);
      return res.status(500).json({ message: "Server error" });
    }
  },
};

module.exports = authController;
