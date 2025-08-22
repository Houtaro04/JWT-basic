const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

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
            res.status(200).json(user);
        }catch(err){
            res.status(500).json(err);
        }
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

        const payload = { id: user._id, username: user.username };
        const token = jwt.sign(payload, process.env.JWT_SECRET || "dev_secret", { expiresIn: "1h" });

        const { password: _pw, __v, ...safe } = user.toObject();
        // Trả token trong body (hoặc set cookie nếu muốn)
        return res.json({ user: safe, token });
        } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
        }
    },
}

module.exports = authController;