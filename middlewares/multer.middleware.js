import multer from "multer";

export const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG, PNG, WEBP images allowed"));
    }
  },
});

export const multerErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        message: "File size must be less than 5MB",
      });
    }
  }

  if (err.message === "Only JPG, PNG, WEBP images allowed") {
    return res.status(400).json({
      message: err.message,
    });
  }

  next(err);
};
