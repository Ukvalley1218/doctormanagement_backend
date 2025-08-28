import Doctor from "../../models/Doctor.js";

// @desc Get all doctors with filters
export const getDoctors = async (req, res) => {
  try {
    const { specialty, location, rating } = req.query;
    let query = {};

    if (specialty) {
      query.specialty = { $regex: specialty, $options: "i" }; // case-insensitive
    }
    if (location) {
      query.location = { $regex: location, $options: "i" }; // case-insensitive
    }
    if (rating) {
      query.rating = { $gte: Number(rating) }; // ensure rating is a number
    }

    const doctors = await Doctor.find(query).populate("userId", "name email");
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @desc Get doctor by ID
export const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate(
      "userId",
      "name email"
    );
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @desc Add a new doctor (Admin only)
export const addDoctor = async (req, res) => {
  try {
    const doctor = new Doctor(req.body);
    await doctor.save();
    res.status(201).json({ success: "doctor added successfully", doctor });
  } catch (err) {
    res.status(400).json({ message: "Invalid data", error: err.message });
  }
};
