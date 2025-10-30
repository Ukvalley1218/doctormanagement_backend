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
    //gst: { type: Number, default: 0 }, // GST percentage, e.g. 18

    // Canadian Tax Configuration   apply when shift to cities of canada 
  taxes: [
    {
      province: { type: String, required: true }, // e.g. "Ontario"
      code: { type: String, required: true }, // e.g. "HST", "GST", "PST"
      rate: { type: Number, required: true }, // e.g. 13 for 13%
      description: { type: String }, // optional note like "HST for Ontario"
      active: { type: Boolean, default: true } // to enable/disable specific slabs
    }
  ]

})

export default mongoose.model("Setting",Settingschema);