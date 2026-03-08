import { bucket } from "../config/GCS.config.js";
import sharp from "sharp";

export const uploadToGCS = async (file) => {
  if (!["image/jpeg", "image/jpg", "image/png"].includes(file.mimetype)) {
    throw new Error("Only JPG, JPEG, and PNG images are allowed");
  }

  let compressedBuffer;

  if (file.mimetype === "image/jpeg" || file.mimetype === "image/jpg") {
    compressedBuffer = await sharp(file.buffer)
      .jpeg({ quality: 70, mozjpeg: true })
      .toBuffer();
  } else if (file.mimetype === "image/png") {
    compressedBuffer = await sharp(file.buffer)
      .png({ compressionLevel: 9 })
      .toBuffer();
  }

  const ext = file.mimetype.split("/")[1];

  const filename = `${Date.now()}-${file.originalname
    .split(".")[0]
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9.-]/g, "")}.${ext}`;

  const blob = bucket.file(filename);

  const stream = blob.createWriteStream({
    resumable: false,
    contentType: file.mimetype,
  });

  return new Promise((resolve, reject) => {
    stream.on("error", reject);

    stream.on("finish", () => {
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;

      resolve({
        filename,
        url: publicUrl,
      });
    });

    stream.end(compressedBuffer);
  });
};

export const deleteFromGCS = async (fileName) => {
  if (!fileName) throw new Error("File name is required");
  await bucket.file(fileName).delete();
};

export const getSignedImageUrl = async (filename) => {
  const [url] = await bucket.file(filename).getSignedUrl({
    version: "v4",
    action: "read",
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
  });

  return url;
};
