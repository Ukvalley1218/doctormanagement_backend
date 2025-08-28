
import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
    doctorId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Doctor',
        required:true
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
     date: { type: Date, required: true },
  time: { type: String, required: true },
  status: { type: String, enum: ["confirmed", "cancelled", "completed"], default: "confirmed" }
},{timestamps:true});

export default mongoose.model("Appointment",appointmentSchema)