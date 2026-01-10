import User from "../../models/User.js";
import Doctor from "../../models/Doctor.js";
import Product from "../../models/Product.js";
import Service from "../../models/Service.js";
import Package from "../../models/Package.js";

import { uploadBuffer,uploadMany,deleteByPublicId } from "../../services/cloudinaryService.js";

/** -------- Users -------- **/
export const uploadUserAvatar = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!req.file) return res.status(400).json({ message: "No image provided" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // remove old if exists
    if (user.avatarPublicId) await deleteByPublicId(user.avatarPublicId);

    const r = await uploadBuffer(req.file.buffer, "users");
    user.avatarUrl = r.secure_url;
    user.avatarPublicId = r.public_id;
    await user.save();

    res.json({ message: "Avatar uploaded", avatarUrl: user.avatarUrl, avatarPublicId: user.avatarPublicId });
  } catch (e) {
    res.status(500).json({ message: "Upload failed", error: e.message });
  }
};

/** -------- Doctors -------- **/
export const uploadDoctorImage = async (req, res) => {
  try {
    const doctorId = req.params.id;
    if (!req.file) return res.status(400).json({ message: "No image provided" });

    const doc = await Doctor.findById(doctorId);
    if (!doc) return res.status(404).json({ message: "Doctor not found" });

    if (doc.imagePublicId) await deleteByPublicId(doc.imagePublicId);

    const r = await uploadBuffer(req.file.buffer, "doctors");
    doc.image = r.secure_url;
    doc.imagePublicId = r.public_id;
    await doc.save();

    res.json({ message: "Doctor image uploaded", image: doc.image, imagePublicId: doc.imagePublicId });
  } catch (e) {
    res.status(500).json({ message: "Upload failed", error: e.message });
  }
};

/** -------- Products -------- **/
export const uploadProductImages = async (req, res) => {
  try {
    const productId = req.params.id;
    const { files } = req; // from upload.fields
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // main image (single)
    if (files?.mainImage?.[0]) {
      if (product.mainImagePublicId) await deleteByPublicId(product.mainImagePublicId);
      const r = await uploadBuffer(files.mainImage[0].buffer, "products");
      product.mainImage = r.secure_url;
      product.mainImagePublicId = r.public_id;
    }

    // gallery images (append)
    if (files?.images?.length) {
      const uploaded = await uploadMany(files.images, "products");
      const newUrls = uploaded.map(u => u.url);
      const newIds  = uploaded.map(u => u.publicId);
      product.images = [...(product.images || []), ...newUrls];
      product.imagesPublicIds = [...(product.imagesPublicIds || []), ...newIds];
    }

    await product.save();

    res.json({
      message: "Product images updated",
      mainImage: product.mainImage,
      images: product.images,
      mainImagePublicId: product.mainImagePublicId,
      imagesPublicIds: product.imagesPublicIds
    });
  } catch (e) {
    res.status(500).json({ message: "Upload failed", error: e.message });
  }
};

// remove specific gallery images by publicId list
export const removeProductGalleryImages = async (req, res) => {
  try {
    const productId = req.params.id;
    const { publicIds } = req.body; // array of publicIds to delete
    if (!Array.isArray(publicIds) || publicIds.length === 0)
      return res.status(400).json({ message: "publicIds array required" });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    for (const pid of publicIds) await deleteByPublicId(pid);

    // Remove from arrays
    product.imagesPublicIds = (product.imagesPublicIds || []).filter(pid => !publicIds.includes(pid));
    product.images = (product.images || []).filter((url, idx) =>
      !publicIds.includes((product.imagesPublicIds || [])[idx]) // safe if parallel arrays
    );

    await product.save();

    res.json({
      message: "Selected gallery images removed",
      images: product.images,
      imagesPublicIds: product.imagesPublicIds
    });
  } catch (e) {
    res.status(500).json({ message: "Delete failed", error: e.message });
  }
};

// upload service image
export const uploadServiceImage = async (req, res) => {
  const service = await Service.findById(req.params.id);
  if (!service) return res.status(404).json({ message: "Service not found" });

  if (service.image?.publicId) {
    await deleteByPublicId(service.image.publicId);
  }

  const result = await uploadBuffer(req.file.buffer, "services");

  service.image = {
    url: result.secure_url,
    publicId: result.public_id,
  };

  await service.save();

  res.json({ success: true, data: service });
};

// upload package image
export const uploadPackageImage = async (req, res) => {
  const pack = await Package.findById(req.params.id);
  if (!pack) return res.status(404).json({ message: "Package not found" });

  if (pack.image?.publicId) {
    await deleteByPublicId(pack.image.publicId);
  }

  const result = await uploadBuffer(req.file.buffer, "packages");

  pack.image = {
    url: result.secure_url,
    publicId: result.public_id,
  };

  await pack.save();

  res.json({ success: true, data: pack });
};