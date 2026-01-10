
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

export const getAllServices = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [services, total, activeCount, inactiveCount] = await Promise.all([
      Service.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      Service.countDocuments(),
      Service.countDocuments({ isActive: true }),
      Service.countDocuments({ isActive: false }),
    ]);

    res.status(200).json({
      success: true,
      data: services,
      pagination: {
        total,                       // all services
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        totalItems: services.length,   // 🔥 items in this page
      },
      stats: {
        total,
        active: activeCount,
        inactive: inactiveCount,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};




export const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    res.status(200).json({
      success: true,
      data: service,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
