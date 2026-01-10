import Package from "../../models/Package.js";


export const getPackages = async (req, res) => {
  const packages = await Package.find({ isActive: true })
    .populate("services.service", "name priceFrom priceTo durationMinutes");

  res.json({ success: true, data: packages });
};

export const getPackageBySlug = async (req, res) => {
  const pack = await Package.findOne({
    slug: req.params.slug,
    isActive: true,
  }).populate("services.service");

  if (!pack) return res.status(404).json({ message: "Package not found" });

  res.json({ success: true, data: pack });
};