const User = require('../models/user');

const userController = {
    getAllUsers: async (req, res) => {
        try {
            const users = await User.find({});
            res.status(200).json(users);
        }catch (error) {
            res.status(500).json({ message: "Internal server error" });
        }
    },
    deleteUser: async (req, res) => {
        const userId = req.params.id;
        try {
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            res.status(200).json({ message: "User deleted successfully" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Internal server error" });
        }
    }, 
}

module.exports = userController;