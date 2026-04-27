const Hotel = require("../models/Hotel.model");

/* =========================================
   HELPER
========================================= */
const parseAmenities = (a) => {
  if (!a) return [];
  if (Array.isArray(a)) return a;
  return a.split(",").map((x) => x.trim());
};

/* =========================================
   CREATE PROPERTY
========================================= */
exports.createProperty = async (req, res) => {
  try {
    const d = req.body;

    if (!d.hotelName) {
      return res.status(400).json({ message: "Hotel name required" });
    }

    const hotel = await Hotel.create({
      vendor: req.vendor._id,

      hotelName: d.hotelName,
      description: d.description || "",

      city: d.city || "",
      address: d.address || "",

      phone: d.phone || "",
      email: d.email || "",

      pricePerNight: Number(d.pricePerNight) || 0,

      amenities: parseAmenities(d.amenities),

      checkInTime: d.checkInTime || "",
      checkOutTime: d.checkOutTime || "",

      cancellationPolicy: d.cancellationPolicy || "",
      childPolicy: d.childPolicy || "",
      petPolicy: d.petPolicy || "",

      gstNumber: d.gstNumber || "",

      location: {
        type: "Point",
        coordinates: [
          Number(d.longitude) || 0,
          Number(d.latitude) || 0,
        ],
      },

      status: "pending",
    });

    res.json({ success: true, hotel });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =========================================
   GET ALL HOTELS (Vendor)
========================================= */
exports.getVendorHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find({ vendor: req.vendor._id })
      .sort({ createdAt: -1 });

    res.json(hotels);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =========================================
   GET SINGLE HOTEL
========================================= */
exports.getSingleHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findOne({
      _id: req.params.id,
      vendor: req.vendor._id,
    });

    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }

    res.json(hotel);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =========================================
   UPDATE PROPERTY
========================================= */
exports.updateProperty = async (req, res) => {
  try {
    const d = req.body;

    const updateData = {
      hotelName: d.hotelName,
      description: d.description,
      city: d.city,
      address: d.address,
      phone: d.phone,
      email: d.email,

      pricePerNight: d.pricePerNight !== undefined
        ? Number(d.pricePerNight)
        : undefined,

      amenities: d.amenities
        ? parseAmenities(d.amenities)
        : undefined,

      checkInTime: d.checkInTime,
      checkOutTime: d.checkOutTime,

      cancellationPolicy: d.cancellationPolicy,
      childPolicy: d.childPolicy,
      petPolicy: d.petPolicy,

      gstNumber: d.gstNumber,
    };

    // remove undefined
    Object.keys(updateData).forEach(
      (k) => updateData[k] === undefined && delete updateData[k]
    );

    const hotel = await Hotel.findOneAndUpdate(
      { _id: req.params.id, vendor: req.vendor._id },
      updateData,
      { new: true }
    );

    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }

    res.json({ success: true, hotel });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =========================================
   UPDATE LOCATION
========================================= */
exports.updateLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    const hotel = await Hotel.findOneAndUpdate(
      { _id: req.params.id, vendor: req.vendor._id },
      {
        location: {
          type: "Point",
          coordinates: [Number(longitude), Number(latitude)],
        },
      },
      { new: true }
    );

    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }

    res.json({ success: true, hotel });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};