//  cloudinary to store images
const cloudinary = require("cloudinary");
const multer = require("multer");
const cloudinaryStorage = require("multer-storage-cloudinary");
const dotenv = require('dotenv');
dotenv.config()

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

// accepts jpg and png files
const storage = cloudinaryStorage({
    cloudinary: cloudinary,
    folder: "VolunteerOps",
    allowedFormats: ["jpg", "png"],
    transformation: [{ width: 1000, height: 500, crop: "limit" }]
});

// upload to cloudinary storage
const parser = multer({ storage: storage });

module.exports = parser;