import Setting from "../../models/Setting.js";


export const set = async (req,res)=>{
    try{

        const set = new Setting(res.body);
        await set.save(); 
        res.status(201).json({ msg: "setting Successfully", product });
    }
    catch(error){
        res.status(500).json({message:error.message});
    }
        
    
}