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
        try {
            const user = await User.findByIdAndDelete(req.params.id);
            res.status(200).json("Delete successfully!");
        }catch(err){
            res.status(500).json(err);
        }
    },
}

module.exports = userController;