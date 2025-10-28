import FormData from "../../models/FormData.js";

export const submitform = async (req,res)=>{
     try {
    const { name, email, phone, message } = req.body;
    const newForm = new FormData({ name, email, phone, message });
    await newForm.save();
    res.status(201).json({ success: true, message: "Form submitted successfully" });
  } catch (error) {
    console.error("Error saving form:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

export const getforms =  async (req,res)=>{
    try {
        const forms = await FormData.find().sort({ createdAt: -1 });
        res.status(200).json({success:true,forms});
        
    } catch (error) {
        res.status(500).json({success:false,message:"server error"})
    }
}