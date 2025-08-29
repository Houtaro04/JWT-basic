const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

let refreshTokens = [];

const authController = {
    //REGISTER
    registerUser: async(req, res) => {
        try{
            const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(req.body.password, salt);

            //Create new user
            const newUser = new User({
                username: req.body.username,
                email: req.body.email,
                password: hashed,
            });

            //Save to DB
            const user = await newUser.save();
            return res.status(200).json(user);
        }catch(err){
            return res.status(500).json(err);
        }
    },
    
    //GENERATE ACCESS TOKEN
    generateAccessToken: (user) => {
        return jwt.sign({ id: user._id, username: user.username, admin: user.admin }, process.env.JWT_SECRET || "dev_secret", { expiresIn: "30s" });
    },

    //GENERATE REFRESH TOKEN
    generateRefreshToken: (user) => {
        return jwt.sign({ id: user._id, username: user.username, admin: user.admin }, process.env.JWT_REFRESH_SECRET || "dev_refresh_secret", { expiresIn: "365d" });
    },

    //LOGIN
    loginUser: async (req, res) => {
        try {
        const { username, email, password } = req.body;
        if ((!username && !email) || !password) {
            return res.status(400).json({ message: "Thiếu username/email hoặc password" });
        }

        const query = username ? { username } : { email };
        // Nếu trong model bạn đặt password: { select: false }, nhớ .select("+password")
        const user = await User.findOne(query).select("+password");
        if (!user) return res.status(401).json({ message: "Sai thông tin đăng nhập" });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(401).json({ message: "Sai mật khẩu" });

        const token = authController.generateAccessToken(user);
        const refreshToken = authController.generateRefreshToken(user);
        refreshTokens.push(refreshToken);
        res.cookie("refreshToken", refreshToken, { 
            httpOnly: true,
            secure: false,
            path: "/",
            sameSite: "strict"
        });
        const { password: _pw, __v, ...safe } = user.toObject();
        // Trả token trong body (hoặc set cookie nếu muốn)
        return res.json({ user: safe, token});
        } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
        }
    },

    requestRefreshToken: async (req, res) => {
        //Lấy token từ user
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) return res.status(401).json("You're not authenticated");
        if (!refreshTokens.includes(refreshToken)) {
            return res.status(403).json("Refresh token is not valid");
        }
        jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || "dev_refresh_secret", (err, user) => {
            if (err) {
                console.log(err);
                return res.status(403).json("Refresh token is not valid");
            }
            refreshTokens = refreshTokens.filter(token => token !== refreshToken);
            //Create new access token, refresh token and send to user
            const newAccessToken = authController.generateAccessToken(user);
            const newRefreshToken = authController.generateRefreshToken(user);
            refreshTokens.push(newRefreshToken);
            res.cookie("refreshToken", newRefreshToken, {
                httpOnly: true,
                secure: false,
                path: "/",
                sameSite: "strict"
            });
            res.status(200).json({ token: newAccessToken });
        });
    },

    //LOG OUT
    userLogout: async (req, res) => {
        res.clearCookie("refreshToken");
        refreshTokens = refreshTokens.filter(token => token !== req.cookies.refreshToken);
        res.status(200).json({ message: "Logged out!" });
    }
};

module.exports = authController;