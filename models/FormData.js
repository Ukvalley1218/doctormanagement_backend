import mongoose from "mongoose";

const formDataSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  message: { type: String},
  createdAt: { type: Date, default: Date.now }
});


export default mongoose.model("Form", formDataSchema);
