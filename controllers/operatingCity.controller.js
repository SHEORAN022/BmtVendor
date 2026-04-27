// const OperatingCity = require("../models/OperatingCity.model");

// /* =========================================================
//    CREATE CITY
// ========================================================= */
// exports.createCity = async (req, res) => {
//   try {
//     const { city, state, country } = req.body;

//     if (!city) {
//       return res.status(400).json({
//         success: false,
//         message: "City is required",
//       });
//     }

//     const exists = await OperatingCity.findOne({
//       vendor: req.vendor._id,
//       city: new RegExp(`^${city}$`, "i"),
//     });

//     if (exists) {
//       return res.status(400).json({
//         success: false,
//         message: "City already exists",
//       });
//     }

//     const newCity = await OperatingCity.create({
//       vendor: req.vendor._id,
//       city,
//       state,
//       country,
//     });

//     res.status(201).json({
//       success: true,
//       message: "City added successfully",
//       city: newCity,
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// /* =========================================================
//    GET ALL CITIES (VENDOR)
// ========================================================= */
// exports.getCities = async (req, res) => {
//   try {
//     const cities = await OperatingCity.find({
//       vendor: req.vendor._id,
//     }).sort({ createdAt: -1 });

//     res.json({ success: true, cities });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// /* =========================================================
//    GET SINGLE CITY
// ========================================================= */
// exports.getCityById = async (req, res) => {
//   try {
//     const city = await OperatingCity.findOne({
//       _id: req.params.id,
//       vendor: req.vendor._id,
//     });

//     if (!city) {
//       return res.status(404).json({
//         success: false,
//         message: "City not found",
//       });
//     }

//     res.json({ success: true, city });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// /* =========================================================
//    UPDATE CITY
// ========================================================= */
// exports.updateCity = async (req, res) => {
//   try {
//     const { city, state, country } = req.body;

//     const existing = await OperatingCity.findOne({
//       _id: req.params.id,
//       vendor: req.vendor._id,
//     });

//     if (!existing) {
//       return res.status(404).json({
//         success: false,
//         message: "City not found",
//       });
//     }

//     // duplicate check
//     if (city) {
//       const duplicate = await OperatingCity.findOne({
//         vendor: req.vendor._id,
//         city: new RegExp(`^${city}$`, "i"),
//         _id: { $ne: req.params.id },
//       });

//       if (duplicate) {
//         return res.status(400).json({
//           success: false,
//           message: "City already exists",
//         });
//       }
//     }

//     existing.city = city || existing.city;
//     existing.state = state || existing.state;
//     existing.country = country || existing.country;

//     await existing.save();

//     res.json({
//       success: true,
//       message: "City updated successfully",
//       city: existing,
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// /* =========================================================
//    DELETE CITY
// ========================================================= */
// exports.deleteCity = async (req, res) => {
//   try {
//     const city = await OperatingCity.findOneAndDelete({
//       _id: req.params.id,
//       vendor: req.vendor._id,
//     });

//     if (!city) {
//       return res.status(404).json({
//         success: false,
//         message: "City not found",
//       });
//     }

//     res.json({
//       success: true,
//       message: "City deleted successfully",
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// /* =========================================================
//    TOGGLE ACTIVE
// ========================================================= */
// exports.toggleCityStatus = async (req, res) => {
//   try {
//     const city = await OperatingCity.findOne({
//       _id: req.params.id,
//       vendor: req.vendor._id,
//     });

//     if (!city) {
//       return res.status(404).json({
//         success: false,
//         message: "City not found",
//       });
//     }

//     city.isActive = !city.isActive;
//     await city.save();

//     res.json({
//       success: true,
//       message: `City ${city.isActive ? "activated" : "deactivated"}`,
//       isActive: city.isActive,
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// /* =========================================================
//    PUBLIC (USER DROPDOWN)
// ========================================================= */
// exports.getAllActiveCities = async (req, res) => {
//   try {
//     const cities = await OperatingCity.find({ isActive: true })
//       .distinct("city");

//     res.json({ success: true, cities });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };


const OperatingCity = require("../models/OperatingCity.model");

// ─── helper ──────────────────────────────────────────────
const findCity = (id, vendorId) =>
  OperatingCity.findOne({ _id: id, vendor: vendorId });

/* ==========================================================
   CITY CRUD
========================================================== */

// POST /api/operating-cities
exports.createCity = async (req, res) => {
  try {
    const { city, state, country, pickupPoints, dropPoints } = req.body;

    if (!city) {
      return res.status(400).json({ success: false, message: "City is required" });
    }

    const exists = await OperatingCity.findOne({
      vendor: req.vendor._id,
      city: new RegExp(`^${city.trim()}$`, "i"),
    });
    if (exists) {
      return res.status(400).json({ success: false, message: "City already exists" });
    }

    const newCity = await OperatingCity.create({
      vendor: req.vendor._id,
      city: city.trim(),
      state: state?.trim() || "",
      country: country?.trim() || "India",
      pickupPoints: Array.isArray(pickupPoints) ? pickupPoints : [],
      dropPoints: Array.isArray(dropPoints) ? dropPoints : [],
    });

    res.status(201).json({ success: true, message: "City added successfully", city: newCity });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/operating-cities
exports.getCities = async (req, res) => {
  try {
    const cities = await OperatingCity.find({ vendor: req.vendor._id }).sort({ createdAt: -1 });
    res.json({ success: true, cities });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/operating-cities/:id
exports.getCityById = async (req, res) => {
  try {
    const city = await findCity(req.params.id, req.vendor._id);
    if (!city) return res.status(404).json({ success: false, message: "City not found" });
    res.json({ success: true, city });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/operating-cities/:id
exports.updateCity = async (req, res) => {
  try {
    const { city, state, country } = req.body;

    const existing = await findCity(req.params.id, req.vendor._id);
    if (!existing) return res.status(404).json({ success: false, message: "City not found" });

    if (city && city.trim().toLowerCase() !== existing.city.toLowerCase()) {
      const duplicate = await OperatingCity.findOne({
        vendor: req.vendor._id,
        city: new RegExp(`^${city.trim()}$`, "i"),
        _id: { $ne: req.params.id },
      });
      if (duplicate) {
        return res.status(400).json({ success: false, message: "City already exists" });
      }
    }

    if (city) existing.city = city.trim();
    if (state !== undefined) existing.state = state.trim();
    if (country !== undefined) existing.country = country.trim();

    await existing.save();
    res.json({ success: true, message: "City updated successfully", city: existing });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/operating-cities/:id
exports.deleteCity = async (req, res) => {
  try {
    const city = await OperatingCity.findOneAndDelete({
      _id: req.params.id,
      vendor: req.vendor._id,
    });
    if (!city) return res.status(404).json({ success: false, message: "City not found" });
    res.json({ success: true, message: "City deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/operating-cities/:id/toggle
exports.toggleCityStatus = async (req, res) => {
  try {
    const city = await findCity(req.params.id, req.vendor._id);
    if (!city) return res.status(404).json({ success: false, message: "City not found" });

    city.isActive = !city.isActive;
    await city.save();

    res.json({
      success: true,
      message: `City ${city.isActive ? "activated" : "deactivated"}`,
      isActive: city.isActive,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/operating-cities/public/all  — for user dropdown
exports.getAllActiveCities = async (req, res) => {
  try {
    const cities = await OperatingCity.find({ isActive: true }).select(
      "city state country pickupPoints dropPoints"
    );
    res.json({ success: true, cities });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ==========================================================
   PICKUP POINTS
========================================================== */

// POST /api/operating-cities/:id/pickup
exports.addPickupPoint = async (req, res) => {
  try {
    const { name, address } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Point name is required" });
    }

    const city = await findCity(req.params.id, req.vendor._id);
    if (!city) return res.status(404).json({ success: false, message: "City not found" });

    const alreadyExists = city.pickupPoints.some(
      (p) => p.name.toLowerCase() === name.trim().toLowerCase()
    );
    if (alreadyExists) {
      return res.status(400).json({ success: false, message: "Pickup point already exists" });
    }

    city.pickupPoints.push({ name: name.trim(), address: address?.trim() || "" });
    await city.save();

    res.status(201).json({
      success: true,
      message: "Pickup point added",
      pickupPoints: city.pickupPoints,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/operating-cities/:id/pickup/:pointId
exports.updatePickupPoint = async (req, res) => {
  try {
    const { name, address } = req.body;

    const city = await findCity(req.params.id, req.vendor._id);
    if (!city) return res.status(404).json({ success: false, message: "City not found" });

    const point = city.pickupPoints.id(req.params.pointId);
    if (!point) return res.status(404).json({ success: false, message: "Pickup point not found" });

    if (name) point.name = name.trim();
    if (address !== undefined) point.address = address.trim();

    await city.save();
    res.json({ success: true, message: "Pickup point updated", pickupPoints: city.pickupPoints });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/operating-cities/:id/pickup/:pointId
exports.deletePickupPoint = async (req, res) => {
  try {
    const city = await findCity(req.params.id, req.vendor._id);
    if (!city) return res.status(404).json({ success: false, message: "City not found" });

    const point = city.pickupPoints.id(req.params.pointId);
    if (!point) return res.status(404).json({ success: false, message: "Pickup point not found" });

    point.deleteOne();
    await city.save();

    res.json({ success: true, message: "Pickup point deleted", pickupPoints: city.pickupPoints });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/operating-cities/:id/pickup/:pointId/toggle
exports.togglePickupPoint = async (req, res) => {
  try {
    const city = await findCity(req.params.id, req.vendor._id);
    if (!city) return res.status(404).json({ success: false, message: "City not found" });

    const point = city.pickupPoints.id(req.params.pointId);
    if (!point) return res.status(404).json({ success: false, message: "Pickup point not found" });

    point.isActive = !point.isActive;
    await city.save();

    res.json({
      success: true,
      message: `Pickup point ${point.isActive ? "activated" : "deactivated"}`,
      isActive: point.isActive,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ==========================================================
   DROP POINTS
========================================================== */

// POST /api/operating-cities/:id/drop
exports.addDropPoint = async (req, res) => {
  try {
    const { name, address } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Point name is required" });
    }

    const city = await findCity(req.params.id, req.vendor._id);
    if (!city) return res.status(404).json({ success: false, message: "City not found" });

    const alreadyExists = city.dropPoints.some(
      (p) => p.name.toLowerCase() === name.trim().toLowerCase()
    );
    if (alreadyExists) {
      return res.status(400).json({ success: false, message: "Drop point already exists" });
    }

    city.dropPoints.push({ name: name.trim(), address: address?.trim() || "" });
    await city.save();

    res.status(201).json({
      success: true,
      message: "Drop point added",
      dropPoints: city.dropPoints,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/operating-cities/:id/drop/:pointId
exports.updateDropPoint = async (req, res) => {
  try {
    const { name, address } = req.body;

    const city = await findCity(req.params.id, req.vendor._id);
    if (!city) return res.status(404).json({ success: false, message: "City not found" });

    const point = city.dropPoints.id(req.params.pointId);
    if (!point) return res.status(404).json({ success: false, message: "Drop point not found" });

    if (name) point.name = name.trim();
    if (address !== undefined) point.address = address.trim();

    await city.save();
    res.json({ success: true, message: "Drop point updated", dropPoints: city.dropPoints });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/operating-cities/:id/drop/:pointId
exports.deleteDropPoint = async (req, res) => {
  try {
    const city = await findCity(req.params.id, req.vendor._id);
    if (!city) return res.status(404).json({ success: false, message: "City not found" });

    const point = city.dropPoints.id(req.params.pointId);
    if (!point) return res.status(404).json({ success: false, message: "Drop point not found" });

    point.deleteOne();
    await city.save();

    res.json({ success: true, message: "Drop point deleted", dropPoints: city.dropPoints });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/operating-cities/:id/drop/:pointId/toggle
exports.toggleDropPoint = async (req, res) => {
  try {
    const city = await findCity(req.params.id, req.vendor._id);
    if (!city) return res.status(404).json({ success: false, message: "City not found" });

    const point = city.dropPoints.id(req.params.pointId);
    if (!point) return res.status(404).json({ success: false, message: "Drop point not found" });

    point.isActive = !point.isActive;
    await city.save();

    res.json({
      success: true,
      message: `Drop point ${point.isActive ? "activated" : "deactivated"}`,
      isActive: point.isActive,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};