import Doctor from "../../models/Doctor.js";

// @desc Get all doctors with filters
// export const getDoctors = async (req, res) => {
//   try {
//     const { specialty, location, rating } = req.query;
//     let query = {};

//     if (specialty) {
//       query.specialty = { $regex: specialty, $options: "i" }; // case-insensitive
//     }
//     if (location) {
//       query.location = { $regex: location, $options: "i" }; // case-insensitive
//     }
//     if (rating) {
//       query.rating = { $gte: Number(rating) }; // ensure rating is a number
//     }

//     const doctors = await Doctor.find(query).populate("userId", "name email");
//     res.json(doctors);
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };
export const getDoctors = async (req, res) => {
  try {
    const { specialty, location, rating, page = 1, limit = 10 } = req.query;
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

    // convert pagination params
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    // total count
    const totalDoctors = await Doctor.countDocuments(query);

    // fetch with pagination
    const doctors = await Doctor.find(query)
      .populate("userId", "name email")
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    res.json({
      totalDoctors,
      page: pageNumber,
      totalPages: Math.ceil(totalDoctors / limitNumber),
      doctors,
    });
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




export const addReviews = async (req,res)=>{
  try {
    const {rating,comment}=req.body;
    const {doctorId}=req.params;

    // find doctor
    const doctor =  await Doctor.findById(doctorId);
    if(!doctor){
      return res.status(404).json({msg:"doctor not found"})
    }


    // check if already reviewd
    const alreadyReviewed = doctor.reviews.find(
      (r) => r.userId.toString() === req.user.id
    );
    if(alreadyReviewed){
      return res.status(400).json({msg:"you already reviewd this doctor"})
    }

    // push review
    const review = {
      userId: req.user.id, // from auth middleware
      rating,
      comment,
    };

    doctor.reviews.push(review);

    // update average rating
    doctor.rating =
      doctor.reviews.reduce((acc, item) => acc + item.rating, 0) /
      doctor.reviews.length;

    await doctor.save();

    res.status(201).json({ msg: "Review added successfully", doctor });


  } catch (error) {
    res.status(500).json({message:"Error",error:error.message})
  }
}