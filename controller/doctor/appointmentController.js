import mongoose from "mongoose";
import Appointment from "../../models/Appointment.js";
import Doctor from "../../models/Doctor.js";

// @desc Book an appointment (with reliability)
// @desc Book an appointment safely without transactions
export const bookAppointment = async (req, res) => {
  try {
    const { doctorId, date, time } = req.body;
    const userId = req.user?.id; // must come from JWT middleware

    if (!doctorId || !date || !time) {
      return res.status(400).json({ message: "Doctor, date and time are required" });
    }

    // Normalize to date-only
    const reqDate = new Date(date).toISOString().split("T")[0];
    const start = new Date(reqDate);
    const end = new Date(start);
    end.setDate(start.getDate() + 1);

    // Check for duplicate appointment
    const existingAppointment = await Appointment.findOne({
      doctorId,
      userId,
      date: reqDate,
      time,
    });

    if (existingAppointment) {
      return res.status(400).json({ message: "You already booked this slot" });
    }

    // Atomically confirm slot
    const doctor = await Doctor.findOneAndUpdate(
      {
        _id: doctorId,
        "availableSlots.date": { $gte: start, $lt: end },
        "availableSlots.time": time,
        "availableSlots.status": "available",
      },
      {
        $set: { "availableSlots.$.status": "confirmed" },
      },
      { new: true }
    );

    if (!doctor) {
      return res.status(400).json({ message: "Slot not available or already booked" });
    }

    // Save appointment
    const appointment = new Appointment({
      doctorId,
      userId,
      date: reqDate,
      time,
    });

    await appointment.save();

    res.status(201).json({ message: "Booking Confirmed", appointment });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


// @desc Get appointments for logged-in user
export const getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ userId: req.user.id })
      .populate("doctorId", "name specialty location")
      .sort({ date: 1, time: 1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};





// use this code when we have mongo atlas
// import mongoose from "mongoose";
// import Appointment from "../../models/Appointment.js";
// import Doctor from "../../models/Doctor.js";

// // @desc Book an appointment (with reliability)
// export const bookAppointment = async (req, res) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const { doctorId, date, time } = req.body;
//     const userId = req.user.id;

//     if (!doctorId || !date || !time) {
//       return res.status(400).json({ message: "Doctor, date and time are required" });
//     }

//     // Ensure doctor exists
//     const doctor = await Doctor.findById(doctorId).session(session);
//     if (!doctor) {
//       await session.abortTransaction();
//       return res.status(404).json({ message: "Doctor not found" });
//     }

//     // Normalize date (strip time for comparison)
//     const reqDate = new Date(date).toISOString().split("T")[0];

//     // Find matching slot
//     const slot = doctor.availableSlots.find(
//       (s) =>
//         s.date.toISOString().split("T")[0] === reqDate && s.time === time
//     );

//     if (!slot) {
//       await session.abortTransaction();
//       return res.status(400).json({ message: "Slot not available" });
//     }

//     if (slot.status === "confirmed") {
//       await session.abortTransaction();
//       return res.status(400).json({ message: "Slot already booked" });
//     }

//     // Prevent duplicate booking by same user for same slot
//     const existingAppointment = await Appointment.findOne({
//       doctorId,
//       userId,
//       date: reqDate,
//       time,
//     }).session(session);

//     if (existingAppointment) {
//       await session.abortTransaction();
//       return res.status(400).json({ message: "You already booked this slot" });
//     }

//     // Create appointment
//     const appointment = new Appointment({
//       doctorId,
//       userId,
//       date: reqDate,
//       time,
//     });

//     await appointment.save({ session });

//     // Update doctor slot status
//     slot.status = "confirmed";
//     await doctor.save({ session });

//     await session.commitTransaction();
//     session.endSession();

//     res.status(201).json({ message: "Booking Confirmed", appointment });
//   } catch (err) {
//     await session.abortTransaction();
//     session.endSession();
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// // @desc Get appointments for logged-in user
// export const getMyAppointments = async (req, res) => {
//   try {
//     const appointments = await Appointment.find({ userId: req.user.id })
//       .populate("doctorId", "name specialty location")
//       .sort({ date: 1, time: 1 });
//     res.json(appointments);
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };
