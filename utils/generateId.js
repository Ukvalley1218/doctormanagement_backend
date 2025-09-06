import Counter from "../models/Counter.js";

export const generateSequentialId = async (modelName, prefix) => {
  const counter = await Counter.findOneAndUpdate(
    { name: modelName },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return `${prefix}-${counter.seq.toString().padStart(4, "0")}`;
};