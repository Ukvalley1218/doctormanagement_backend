import Package from "../../models/Package.js";
import Service from "../../models/Service.js";
import slugify from "slugify";

/**
 * CREATE PACKAGE
 */
export const createPackage = async (req, res) => {
  try {
    const { name, services, packagePrice, description } = req.body;

    if (!name || !services || services.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Package name and services are required",
      });
    }

    // fetch services
    const serviceDocs = await Service.find({ _id: { $in: services } });

    if (serviceDocs.length !== services.length) {
      return res.status(400).json({
        success: false,
        message: "One or more services are invalid",
      });
    }

    // calculate totals
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
      description,
    });

    res.status(201).json({
      success: true,
      data: pack,
    });
  } catch (error) {
    console.error("Create Package Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * UPDATE PACKAGE
 */
export const updatePackage = async (req, res) => {
  try {
    const data = req.body;

    if (data.name) {
      data.slug = slugify(data.name, { lower: true });
    }

    // 🔥 Fix embedded services
    if (data.services) {
      if (!Array.isArray(data.services)) {
        return res.status(400).json({
          success: false,
          message: "Services must be an array",
        });
      }

      data.services = data.services.map((id) => ({ service: id }));
    }

    const pack = await Package.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });

    if (!pack) {
      return res.status(404).json({
        success: false,
        message: "Package not found",
      });
    }

    res.json({
      success: true,
      data: pack,
    });
  } catch (error) {
    console.error("Update Package Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * DELETE PACKAGE
 */
export const deletePackage = async (req, res) => {
  try {
    const pack = await Package.findByIdAndDelete(req.params.id);

    if (!pack) {
      return res.status(404).json({
        success: false,
        message: "Package not found",
      });
    }

    res.json({
      success: true,
      message: "Package deleted",
    });
  } catch (error) {
    console.error("Delete Package Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * TOGGLE PACKAGE STATUS
 */
export const togglePackageStatus = async (req, res) => {
  try {
    const pack = await Package.findById(req.params.id);

    if (!pack) {
      return res.status(404).json({
        success: false,
        message: "Package not found",
      });
    }

    pack.isActive = !pack.isActive;
    await pack.save();

    res.json({
      success: true,
      data: pack,
    });
  } catch (error) {
    console.error("Toggle Package Status Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * GET ALL PACKAGES
 */
export const getAllPackages = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [packages, total, activeCount, inactiveCount] = await Promise.all([
      Package.find()
        .populate("services.service")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      Package.countDocuments(),
      Package.countDocuments({ isActive: true }),
      Package.countDocuments({ isActive: false }),
    ]);

    res.json({
      success: true,
      data: packages,
      pagination: {
        total,                         // total packages in DB
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        totalItems: packages.length, // 🔥 packages returned in this page
      },
      stats: {
        total,
        active: activeCount,
        inactive: inactiveCount,
      },
    });
  } catch (error) {
    console.error("Get Packages Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * GET PACKAGE BY ID
 */
export const getPackageById = async (req, res) => {
  try {
    const pack = await Package.findById(req.params.id).populate(
      "services.service"
    );

    if (!pack) {
      return res.status(404).json({
        success: false,
        message: "Package not found",
      });
    }

    res.json({
      success: true,
      data: pack,
    });
  } catch (error) {
    console.error("Get Package By ID Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
