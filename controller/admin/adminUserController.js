import User from "../../models/User.js";


// @desc Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-otp -otpExpiry"); // hide otp fields
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @desc Get single user by ID
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-otp -otpExpiry");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @desc Update user (role, discount, verification, etc.)
export const updateUser = async (req, res) => {
  try {
    const { name, email, role, userDiscount, isVerified, phone, address } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Update only provided fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (userDiscount !== undefined) user.userDiscount = userDiscount;
    if (isVerified !== undefined) user.isVerified = isVerified;
    if (phone) user.phone = phone;
    if (address) user.address = { ...user.address, ...address };

    await user.save();
    res.json({ message: "User updated", user });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @desc Delete user
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
