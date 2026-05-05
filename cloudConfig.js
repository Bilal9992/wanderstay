if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,     // ✅ updated
  api_secret: process.env.CLOUD_API_SECRET, // ✅ updated
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "wanderlust_DEV",
    allowed_formats: ["jpeg", "png", "jpg"],
  },
});

module.exports = { cloudinary, storage };
