import User from "../../models/User.js";


// @desc Get all users
// export const getAllUsers = async (req, res) => {
//   try {
//     const users = await User.find().select("-otp -otpExpiry"); // hide otp fields
//     res.json(users);
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

export const createUser = async (req,res)=>{
  try {
    const user = new User(req.body);
    const existuser =await User.findOne({email:user.email});
    if(existuser){
      return res.status(404).json({message:"This Email Has been Already Used ,Try Another Email."})
    }
    await user.save();
    res.status(201).json({ message: "User created successfully", user });
    
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

// export const getAllUsers = async (req, res) => {

//   try {
//     const { page = 1, limit = 10 } = req.query;

//     const skip = (Number(page) - 1) * Number(limit);

//     const [users, total] = await Promise.all([
//       User.find().select("-otp -otpExpiry").skip(skip).limit(Number(limit)),
//       User.countDocuments()
//     ]);

//     res.json({
//       page: Number(page),
//       limit: Number(limit),
//       totalItems: total,
//       totalPages: Math.ceil(total / limit),
//       items: users,
//     });
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };


export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    // 🔍 Build search filter
    const searchFilter = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { phone: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    // ✅ Get paginated users + counts in parallel
    const [users, totalUsers, verifiedUsers, unverifiedUsers, newSignups] =
      await Promise.all([
        User.find(searchFilter)
          .select("-otp -otpExpiry")
          .skip(skip)
          .limit(Number(limit))
          .sort({ createdAt: -1 }),

        User.countDocuments(searchFilter),
        User.countDocuments({ ...searchFilter, isVerified: true }),
        User.countDocuments({ ...searchFilter, isVerified: false }),

        // 👇 Users created within the last 30 days
        User.countDocuments({
          ...searchFilter,
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        }),
      ]);

    res.json({
      page: Number(page),
      limit: Number(limit),
      totalItems: totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
      items: users,
      stats: {
        totalUsers,
        activeUsers: verifiedUsers,
        inactiveUsers: unverifiedUsers,
        newSignupsLast30Days: newSignups,
      },
    });
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
