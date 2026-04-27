const Palace = require("../models/palaceModel");

/* ================= ADD PALACE ================= */

exports.addPalace = async (req, res) => {
  try {

    let images = [];

    if (req.files && req.files.length > 0) {
      const images = [];

if (req.files && req.files.length > 0) {
  req.files.forEach(file => {
    images.push(file.path || file.url);
  });
}
      // images = req.files.map(file => file.path);
    }

    let rooms = [];

    if (req.body.rooms) {
      rooms = typeof req.body.rooms === "string"
        ? JSON.parse(req.body.rooms)
        : req.body.rooms;
    }

    const palace = new Palace({
      propertyName: req.body.propertyName,
      description: req.body.description,
      ownerName: req.body.ownerName,
      email: req.body.email,
      phone: req.body.phone,
      password: req.body.password,

      country: req.body.country,
      state: req.body.state,
      city: req.body.city,
      fullAddress: req.body.fullAddress,

      latitude: req.body.latitude,
      longitude: req.body.longitude,

      totalRooms: req.body.totalRooms,
      heritageCertified: req.body.heritageCertified,

      weddingAllowed: req.body.weddingAllowed,
      eventAllowed: req.body.eventAllowed,

      amenities: req.body.amenities,

      basePrice: req.body.basePrice,
      weekendPrice: req.body.weekendPrice,

      images,
      rooms
    });

    await palace.save();

    res.status(201).json({
      success: true,
      message: "Palace added successfully",
      data: palace
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};


/* ================= GET ALL PALACES ================= */

exports.getAllPalaces = async (req, res) => {
  try {

    const palaces = await Palace.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: palaces.length,
      data: palaces
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};


/* ================= GET SINGLE PALACE ================= */

exports.getPalaceById = async (req, res) => {
  try {

    const palace = await Palace.findById(req.params.id);

    if (!palace) {
      return res.status(404).json({
        success: false,
        message: "Palace not found"
      });
    }

    res.status(200).json({
      success: true,
      data: palace
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};


/* ================= UPDATE PALACE ================= */

exports.updatePalace = async (req, res) => {
  try {

    let images = [];

    if (req.files && req.files.length > 0) {
      images = req.files.map(file => file.path);
      req.body.images = images;
    }

    if (req.body.rooms && typeof req.body.rooms === "string") {
      req.body.rooms = JSON.parse(req.body.rooms);
    }

    const palace = await Palace.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!palace) {
      return res.status(404).json({
        success: false,
        message: "Palace not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Palace updated successfully",
      data: palace
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};


/* ================= DELETE PALACE ================= */

exports.deletePalace = async (req, res) => {
  try {

    const palace = await Palace.findByIdAndDelete(req.params.id);

    if (!palace) {
      return res.status(404).json({
        success: false,
        message: "Palace not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Palace deleted successfully"
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};