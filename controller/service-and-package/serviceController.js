import Service from "../../models/Service.js";
/**
 * GET ALL SERVICES
 * /api/services?category=...
 */
export const getServices = async (req, res) => {
  try {
    const { category } = req.query;

    const filter = { isActive: true };
    if (category) filter.category = category;

    const services = await Service.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: services,
    });
  } catch (error) {
    console.error("Get Services Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch services",
    });
  }
};

/**
 * GET SERVICE BY SLUG
 * /api/services/slug/:slug
 */
export const getServiceBySlug = async (req, res) => {
  try {
    const service = await Service.findOne({
      slug: req.params.slug,
      isActive: true,
    });

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
    console.error("Get Service By Slug Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch service",
    });
  }
};

/**
 * GET SERVICE BY ID
 * /api/services/:id
 */
export const getServiceById = async (req, res) => {
  try {
    const service = await Service.findOne({
      _id: req.params.id,
      isActive: true,
    });

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
    console.error("Get Service By ID Error:", error);

    // Invalid MongoDB ObjectId
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid service ID",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch service",
    });
  }
};