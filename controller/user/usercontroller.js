import User from "../../models/User.js";

// get all users
export const getAllusers = async (req, res) => {
  try {
    const users = await User.find();

    if (!users || users.length === 0) {
      return res.status(404).send("No users found");
    }

    res.status(200).json({ users });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// get user by id
export const getUserbyid = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } 
};

// update user by id
export const updateUserbyid = async (req, res) => {
  try {
    const updateUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updateUser) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User Updated Successfully", user: updateUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// delete user by id
export const deleteUserbyid = async (req, res) => {
  try {
    const deleteUser = await User.findByIdAndDelete(req.params.id);

    if (!deleteUser) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
