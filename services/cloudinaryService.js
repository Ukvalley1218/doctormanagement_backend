import cloudinary from "../utils/cloudinary.js";
import streamifier from "streamifier";

const toFolder = (leaf) => {
  const base = process.env.CLOUDINARY_FOLDER || "uploads";
  return `${base}/${leaf}`;
};

export const uploadBuffer = (buffer, folder, publicId = undefined) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: toFolder(folder),
        public_id: publicId,           // pass to overwrite if you want
        resource_type: "image",
        transformation: [
          { quality: "auto", fetch_format: "auto" } // smart compression & web-friendly format
        ]
      },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });

export const uploadMany = async (files, folder) => {
  const out = [];
  for (const f of files) {
    const r = await uploadBuffer(f.buffer, folder);
    out.push({ url: r.secure_url, publicId: r.public_id });
  }
  return out;
};

export const deleteByPublicId = async (publicId) => {
  if (!publicId) return null;
  return cloudinary.uploader.destroy(publicId);
};