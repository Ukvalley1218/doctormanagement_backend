import FormData from "../../models/FormData.js";

export const submitform = async (req,res)=>{
     try {
    const { name, email, phone, message } = req.body;
    // Add a quick validation check
    if (!name || !email || !phone || !message) {
      console.log("❌ Missing fields");
      return res.status(400).json({ success: false, message: "All fields required" });
    }
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

export const getformbyid = async (req,res)=>{
  try {
    const {id}= req.params;
    const form = await FormData.findById(id);
    if(!form){
      return res.status(404).json({message:"form not found"})
    }
    res.status(200).json({form});
    
  } catch (error) {
    res.status(500).json({message:"server error",error:error.message})
  }
}

export const deleteForm= async (req,res)=>{
  try {
    const {id}= req.params;
    const form = await FormData.findByIdAndDelete(id);
    if(!form){
      return res.status(404).json({message:"form not found"});
    }
    res.status(200).json({message:"form deleted successfully"});
    
  } catch (error) {
    res.status(500).json({message:"server eror ",error:error.message})
  }
}