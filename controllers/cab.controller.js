
const Cab = require("../models/Cab.model");
const cloudinary = require("../config/cloudinary");

/* ➕ ADD CAB */
exports.addCab = async (req, res) => {
  try {
    if (!req.files?.image)
      return res.status(400).json({ message: "Cab image required" });

    // MAIN IMAGE
    const mainImg = await cloudinary.uploader.upload(
      req.files.image[0].path,
      { folder: "vendor_cabs/main" }
    );

    // GALLERY IMAGES (optional)
    let galleryUrls = [];
    if (req.files.gallery) {
      if (req.files.gallery.length > 10) {
        return res
          .status(400)
          .json({ message: "Maximum 10 gallery images allowed" });
      }

      for (let file of req.files.gallery) {
        const uploaded = await cloudinary.uploader.upload(file.path, {
          folder: "vendor_cabs/gallery",
        });
        galleryUrls.push(uploaded.secure_url);
      }
    }

    const cab = await Cab.create({
      vendor: req.vendor._id,
      cabType: req.body.cabType,
      vehicleNumber: req.body.vehicleNumber,
      fromCity: req.body.fromCity,
      toCity: req.body.toCity,
      pickupTime: req.body.pickupTime,
      totalSeats: req.body.totalSeats,
      availableSeats: req.body.availableSeats,
      price: req.body.price,
      image: mainImg.secure_url,
      gallery: galleryUrls,
    });

    res.json({ success: true, cab });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* 📥 GET VENDOR CABS */
exports.getVendorCabs = async (req, res) => {
  const cabs = await Cab.find({ vendor: req.vendor._id }).sort({
    createdAt: -1,
  });
  res.json(cabs);
};

/* ✏️ UPDATE CAB */
exports.updateCab = async (req, res) => {
  try {
    let updateData = {
      cabType: req.body.cabType,
      vehicleNumber: req.body.vehicleNumber,
      fromCity: req.body.fromCity,
      toCity: req.body.toCity,
      pickupTime: req.body.pickupTime,
      totalSeats: req.body.totalSeats,
      availableSeats: req.body.availableSeats,
      price: req.body.price,
    };

    // MAIN IMAGE
    if (req.files?.image) {
      const uploaded = await cloudinary.uploader.upload(
        req.files.image[0].path,
        { folder: "vendor_cabs/main" }
      );
      updateData.image = uploaded.secure_url;
    }

    // GALLERY (replace old gallery)
    if (req.files?.gallery) {
      if (req.files.gallery.length > 10) {
        return res
          .status(400)
          .json({ message: "Maximum 10 gallery images allowed" });
      }

      let galleryUrls = [];
      for (let file of req.files.gallery) {
        const uploaded = await cloudinary.uploader.upload(file.path, {
          folder: "vendor_cabs/gallery",
        });
        galleryUrls.push(uploaded.secure_url);
      }
      updateData.gallery = galleryUrls;
    }

    const cab = await Cab.findOneAndUpdate(
      { _id: req.params.id, vendor: req.vendor._id },
      updateData,
      { new: true }
    );

    res.json({ success: true, cab });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ❌ DELETE CAB */
exports.deleteCab = async (req, res) => {
  await Cab.findOneAndDelete({
    _id: req.params.id,
    vendor: req.vendor._id,
  });

  res.json({ success: true });
};
