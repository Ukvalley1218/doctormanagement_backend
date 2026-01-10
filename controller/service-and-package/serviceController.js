import Service from "../../models/Service.js";
export const getServices = async (req, res) => {
  const { category } = req.query;

  const filter = { isActive: true };
  if (category) filter.category = category;

  const services = await Service.find(filter).sort({ createdAt: -1 });

  res.json({ success: true, data: services });
};

export const getServiceBySlug = async (req, res) => {
  const service = await Service.findOne({
    slug: req.params.slug,
    isActive: true,
  });

  if (!service) return res.status(404).json({ message: "Service not found" });

  res.json({ success: true, data: service });
};