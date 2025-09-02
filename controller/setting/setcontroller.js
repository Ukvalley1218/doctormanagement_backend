import Setting from "../../models/Setting.js";


export const setSetting = async (req,res)=>{
    try{
        
        const set = new Setting(req.body);
        await set.save(); 
        res.status(201).json({ msg: "setting Successfully", set });
    }
    catch(error){
        res.status(500).json({message:error.message});
    }
}

export const getSetting = async (req,res)=>{
   try {
    const setting = await Setting.find();
    if (!setting || setting.length === 0){
        return res.status(404).json({message:"No Settings Found"})
    }
    
    res.json(setting)
   } catch (error) {
    res.status(500).json({message:error.message})
   }
}