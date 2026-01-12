import Package from "../../models/Package.js";


/**
 * GET ALL ACTIVE PACKAGES
 * /api/packages
 */
export const getPackages = async (req, res) => {
  try {
    const packages = await Package.find({ isActive: true })
      .populate("services.service", "name priceFrom priceTo durationMinutes");

    res.status(200).json({
      success: true,
      data: packages,
    });
  } catch (error) {
    console.error("Get Packages Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch packages",
    });
  }
};

/**
 * GET PACKAGE BY SLUG
 * /api/packages/slug/:slug
 */
export const getPackageBySlug = async (req, res) => {
  try {
    const pack = await Package.findOne({
      slug: req.params.slug,
      isActive: true,
    }).populate("services.service");

    if (!pack) {
      return res.status(404).json({
        success: false,
        message: "Package not found",
      });
    }

    res.status(200).json({
      success: true,
      data: pack,
    });
  } catch (error) {
    console.error("Get Package By Slug Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch package",
    });
  }
};

/**
 * GET PACKAGE BY ID
 * /api/packages/:id
 */
export const getPackageById = async (req, res) => {
  try {
    const pack = await Package.findOne({
      _id: req.params.id,
      isActive: true,
    }).populate("services.service");

    if (!pack) {
      return res.status(404).json({
        success: false,
        message: "Package not found",
      });
    }

    res.status(200).json({
      success: true,
      data: pack,
    });
  } catch (error) {
    console.error("Get Package By ID Error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid package ID",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch package",
    });
  }
};