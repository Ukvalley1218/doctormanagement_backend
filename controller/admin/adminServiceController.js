import Service from "../../models/Service.js";
import slugify from "slugify";


export const createService = async (req, res) => {
  try {
    const { name } = req.body;

    const service = await Service.create({
      ...req.body,
      slug: slugify(name, { lower: true }),
    });

    res.status(201).json({ success: true, data: service });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updateService = async (req, res) => {
  try {
    const data = req.body;
    if (data.name) {
      data.slug = slugify(data.name, { lower: true });
    }

    const service = await Service.findByIdAndUpdate(req.params.id, data, {
      new: true,
    });

    res.json({ success: true, data: service });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const deleteService = async (req, res) => {
  await Service.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "Service deleted" });
};

export const toggleServiceStatus = async (req, res) => {
  const service = await Service.findById(req.params.id);
  service.isActive = !service.isActive;
  await service.save();

  res.json({ success: true, data: service });
};

export const getAllServices = async (req,res)=>{
    const services = await Service.find().sort({ createdAt :-1});
    if(!services || services.length===0){
        return  res.status(404).json({message:"No services found"});
    }
    res.status(200).json({success:true,data:services});
}
