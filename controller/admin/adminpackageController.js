import Package from "../../models/Package.js";
import Service from "../../models/Service.js";
import slugify from "slugify";

export const createPackage = async (req, res) => {
  const { name, services, packagePrice } = req.body;

  // calculate totals
  const serviceDocs = await Service.find({ _id: { $in: services } });

  const totalDuration = serviceDocs.reduce(
    (sum, s) => sum + (s.durationMinutes || 0),
    0
  );

  const regularPrice = serviceDocs.reduce(
    (sum, s) => sum + (s.priceTo || s.priceFrom || 0),
    0
  );

  const pack = await Package.create({
    name,
    slug: slugify(name, { lower: true }),
    services: services.map((id) => ({ service: id })),
    totalDuration,
    regularPrice,
    packagePrice,
    description: req.body.description,
  });

  res.status(201).json({ success: true, data: pack });
};

export const updatePackage = async (req, res) => {
  const data = req.body;
  if (data.name) data.slug = slugify(data.name, { lower: true });

  const pack = await Package.findByIdAndUpdate(req.params.id, data, {
    new: true,
  });

  res.json({ success: true, data: pack });
};

export const deletePackage = async (req, res) => {
  await Package.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "Package deleted" });
};

export const togglePackageStatus = async (req, res) => {
  const pack = await Package.findById(req.params.id);
  pack.isActive = !pack.isActive;
  await pack.save();
  res.json({ success: true, data: pack });
};
