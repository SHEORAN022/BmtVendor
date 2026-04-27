const BusType = require("../models/BusType.model");


const sanitizeSeats = (arr, deck) => {
  if (!Array.isArray(arr)) return [];
  return arr
    .filter((s) => s && ["seat", "sleeper", "driver"].includes(s.type))
    .map((s, i) => ({
      seatNo:
        s.seatNo && String(s.seatNo).trim() !== ""
          ? String(s.seatNo).trim()
          : `${deck === "lower" ? "L" : "U"}${i + 1}`,
      row: Number(s.row) || 0,
      col: Number(s.col) || 0,
      type: s.type,
      deck,
    }));
};

// ─── CREATE ───────────────────────────────────────────────────────────────────
// exports.createBusType = async (req, res) => {
//   try {
//     const { name, vehicleMake, seatingType, isAC, lowerDeck, upperDeck } = req.body;

//     if (!name || name.trim() === "") {
//       return res.status(400).json({ success: false, message: "Bus name is required" });
//     }

//     const lower = sanitizeSeats(lowerDeck, "lower");
//     const upper = sanitizeSeats(upperDeck, "upper");

//     if (lower.length + upper.length === 0) {
//       return res.status(400).json({ success: false, message: "At least 1 seat is required" });
//     }

//     const busType = await BusType.create({
//       vendor: req.vendor._id,
//       name: name.trim(),
//       vehicleMake: vehicleMake || "",
//       seatingType: seatingType || "2+2",
//       isAC: isAC || false,
//       lowerDeck: lower,
//       upperDeck: upper,
//       totalSeats: lower.length + upper.length,
//     });

//     res.status(201).json({ success: true, message: "Bus type created", busType });
//   } catch (err) {
//     console.error("createBusType error:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

exports.createBusType = async (req, res) => {
  try {
    const {
      name,
      vehicleMake,
      seatingType,
      isAC,
      lowerDeck,
      upperDeck,
    } = req.body;

    /* ================= VALIDATION ================= */

    if (!name || name.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Bus name is required",
      });
    }

    /* ================= SANITIZE SEATS ================= */

    const lower = sanitizeSeats(lowerDeck, "lower");
    const upper = sanitizeSeats(upperDeck, "upper");

    /* ================= IMPORTANT CHANGE ================= */
    // ❗ Seats optional on CREATE (no error if empty)

    const totalSeats = lower.length + upper.length;

    /* ================= CREATE ================= */

    const busType = await BusType.create({
      vendor: req.vendor._id,

      name: name.trim(),

      vehicleMake: vehicleMake || "",
      seatingType: seatingType || "2+2",
      isAC: isAC || false,

      lowerDeck: lower,
      upperDeck: upper,

      totalSeats,
    });

    /* ================= RESPONSE ================= */

    res.status(201).json({
      success: true,
      message: "Bus type created successfully",
      data: busType,
    });

  } catch (err) {
    console.error("createBusType error:", err);

    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};
// ─── GET ALL ──────────────────────────────────────────────────────────────────
exports.getBusTypes = async (req, res) => {
  try {
    const busTypes = await BusType.find({ vendor: req.vendor._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: busTypes.length, data: busTypes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET ONE ──────────────────────────────────────────────────────────────────
exports.getBusTypeById = async (req, res) => {
  try {
    const busType = await BusType.findOne({ _id: req.params.id, vendor: req.vendor._id });
    if (!busType) return res.status(404).json({ success: false, message: "Bus type not found" });
    res.json({ success: true, data: busType });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── UPDATE ───────────────────────────────────────────────────────────────────
exports.updateBusType = async (req, res) => {
  try {
    const { name, vehicleMake, seatingType, isAC, lowerDeck, upperDeck } = req.body;
    const busType = await BusType.findOne({ _id: req.params.id, vendor: req.vendor._id });
    if (!busType) return res.status(404).json({ success: false, message: "Bus type not found" });

    if (name) busType.name = name.trim();
    if (vehicleMake !== undefined) busType.vehicleMake = vehicleMake;
    if (seatingType) busType.seatingType = seatingType;
    if (isAC !== undefined) busType.isAC = isAC;
    if (Array.isArray(lowerDeck)) busType.lowerDeck = sanitizeSeats(lowerDeck, "lower");
    if (Array.isArray(upperDeck)) busType.upperDeck = sanitizeSeats(upperDeck, "upper");
    busType.totalSeats = busType.lowerDeck.length + busType.upperDeck.length;

    await busType.save();
    res.json({ success: true, message: "Bus type updated", busType });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── DELETE ───────────────────────────────────────────────────────────────────
exports.deleteBusType = async (req, res) => {
  try {
    const busType = await BusType.findOneAndDelete({ _id: req.params.id, vendor: req.vendor._id });
    if (!busType) return res.status(404).json({ success: false, message: "Bus type not found" });
    res.json({ success: true, message: "Bus type deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};