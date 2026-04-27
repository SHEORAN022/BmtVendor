
const Flight = require("../models/Flight.model");
const cloudinary = require("../config/cloudinary");

/* ================= ➕ ADD FLIGHT ================= */
exports.addFlight = async (req, res) => {
  try {
    if (!req.files?.image?.[0]) {
      return res.status(400).json({ message: "Flight main image required" });
    }

    // ✅ Upload main image
    const mainImage = await cloudinary.uploader.upload(
      req.files.image[0].path,
      { folder: "flights/main" }
    );

    // ✅ Upload gallery images (0–10)
    let galleryImages = [];
    if (req.files.gallery) {
      if (req.files.gallery.length > 10) {
        return res
          .status(400)
          .json({ message: "Maximum 10 gallery images allowed" });
      }

      for (const file of req.files.gallery) {
        const uploaded = await cloudinary.uploader.upload(file.path, {
          folder: "flights/gallery",
        });
        galleryImages.push(uploaded.secure_url);
      }
    }

    const flight = await Flight.create({
      vendor: req.vendor._id,
      flightName: req.body.flightName,
      flightNumber: req.body.flightNumber,
      fromCity: req.body.fromCity,
      toCity: req.body.toCity,
      departureTime: req.body.departureTime,
      arrivalTime: req.body.arrivalTime,
      travelDate: req.body.travelDate,
      totalSeats: req.body.totalSeats,
      price: req.body.price,
      image: mainImage.secure_url,
      gallery: galleryImages,
    });

    res.json({ success: true, flight });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ================= 📥 GET VENDOR FLIGHTS ================= */
exports.getVendorFlights = async (req, res) => {
  const flights = await Flight.find({ vendor: req.vendor._id }).sort({
    createdAt: -1,
  });
  res.json(flights);
};

/* ================= ✏️ UPDATE FLIGHT ================= */
exports.updateFlight = async (req, res) => {
  try {
    let updateData = {
      flightName: req.body.flightName,
      flightNumber: req.body.flightNumber,
      fromCity: req.body.fromCity,
      toCity: req.body.toCity,
      departureTime: req.body.departureTime,
      arrivalTime: req.body.arrivalTime,
      travelDate: req.body.travelDate,
      totalSeats: req.body.totalSeats,
      price: req.body.price,
    };

    // ✅ Update main image
    if (req.files?.image?.[0]) {
      const uploaded = await cloudinary.uploader.upload(
        req.files.image[0].path,
        { folder: "flights/main" }
      );
      updateData.image = uploaded.secure_url;
    }

    // ✅ Append / replace gallery
    if (req.files?.gallery) {
      if (req.files.gallery.length > 10) {
        return res
          .status(400)
          .json({ message: "Maximum 10 gallery images allowed" });
      }

      let galleryImages = [];
      for (const file of req.files.gallery) {
        const uploaded = await cloudinary.uploader.upload(file.path, {
          folder: "flights/gallery",
        });
        galleryImages.push(uploaded.secure_url);
      }
      updateData.gallery = galleryImages;
    }

    const flight = await Flight.findOneAndUpdate(
      { _id: req.params.id, vendor: req.vendor._id },
      updateData,
      { new: true }
    );

    res.json({ success: true, flight });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ================= ❌ DELETE FLIGHT ================= */
exports.deleteFlight = async (req, res) => {
  await Flight.findOneAndDelete({
    _id: req.params.id,
    vendor: req.vendor._id,
  });
  res.json({ success: true });
};

/* ================= 🔍 USER SEARCH ================= */
exports.searchFlights = async (req, res) => {
  const { fromCity, toCity, travelDate } = req.query;

  const flights = await Flight.find({
    fromCity,
    toCity,
    travelDate,
    isActive: true,
  }).populate("vendor", "name");

  res.json(flights);
};
