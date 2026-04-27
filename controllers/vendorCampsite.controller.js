const Campsite = require("../models/VendorCampsite.model");

/* ================= CREATE ================= */
exports.createCampsite = async (req, res) => {
  try {
    const b = req.body;

    const campsite = await Campsite.create({
      vendor: req.vendor._id,
      campsiteName: b.campsiteName,
      description: b.description,
      category: b.category,
      address: b.address,
      location: {
        latitude: b.latitude,
        longitude: b.longitude
      },
      price: {
        perNight: b.perNight,
        weekendPrice: b.weekendPrice
      },
      amenities: b.amenities || [],
      status: "pending"
    });

    res.status(201).json({ success: true, data: campsite });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ================= GET MY ================= */
exports.getMyCampsites = async (req, res) => {
  const data = await Campsite.find({ vendor: req.vendor._id });
  res.json({ success: true, data });
};