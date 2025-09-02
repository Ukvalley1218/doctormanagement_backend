import mongoose from "mongoose";


const Settingschema= new mongoose.Schema({
    deliverfee:{type:Number},
    phone:{type:Number},
    email:{type:String}
})

export default mongoose.model("Setting",Settingschema);