import mongoose from "mongoose";


const Settingschema= new mongoose.Schema({
    deliverfee:{type:Number},
    phone:{type:Number},
    email:{type:String},
    logo:{type:String},
    stripekey:{type:String},
    stripesaltkey:{type:String},
    stripepublishablekey:{type:String},
    stripecurrency:{type:String},
})

export default mongoose.model("Setting",Settingschema);