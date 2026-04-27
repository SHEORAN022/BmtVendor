const cloudinary = require("../config/cloudinary");
const VendorDarshan = require("../models/VendorDarshan");

/* ================= CREATE DARSHAN ================= */
exports.createDarshan = async (req, res) => {
  try {
    let imageUrls = [];

    // ✅ MULTIPLE IMAGES UPLOAD (diskStorage → file.path)
    if (req.files && req.files.length > 0) {
      for (let file of req.files) {
        const uploaded = await cloudinary.uploader.upload(file.path, {
          folder: "vendor_darshan_gallery",
        });

        imageUrls.push(uploaded.secure_url);
      }
    }

    const darshan = await VendorDarshan.create({
      vendor: req.vendor._id, // 🔐 token se
      name: req.body.name,
      location: req.body.location,
      date: req.body.date,
      time: req.body.time,
      description: req.body.description,
      price: req.body.price,
      availableSeats: req.body.availableSeats,
      images: imageUrls,
    });

    res.status(201).json({ success: true, data: darshan });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

/* ================= GET VENDOR DARSHANS ================= */
exports.getMyDarshans = async (req, res) => {
  try {
    const data = await VendorDarshan.find({
      vendor: req.vendor._id,
    }).sort({ createdAt: -1 });

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= UPDATE DARSHAN ================= */
exports.updateDarshan = async (req, res) => {
  try {
    const darshan = await VendorDarshan.findOne({
      _id: req.params.id,
      vendor: req.vendor._id,
    });

    if (!darshan)
      return res.status(404).json({ message: "Darshan not found" });

    let images = darshan.images || [];

    // ✅ ADD NEW IMAGES
    if (req.files && req.files.length > 0) {
      for (let file of req.files) {
        const uploaded = await cloudinary.uploader.upload(file.path, {
          folder: "vendor_darshan_gallery",
        });

        images.push(uploaded.secure_url);
      }
    }

    darshan.name = req.body.name;
    darshan.location = req.body.location;
    darshan.date = req.body.date;
    darshan.time = req.body.time;
    darshan.description = req.body.description;
    darshan.price = req.body.price;
    darshan.availableSeats = req.body.availableSeats;
    darshan.images = images;

    await darshan.save();

    res.json({ success: true, data: darshan });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

/* ================= DELETE DARSHAN ================= */
exports.deleteDarshan = async (req, res) => {
  try {
    await VendorDarshan.findOneAndDelete({
      _id: req.params.id,
      vendor: req.vendor._id,
    });

    res.json({ success: true, message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
