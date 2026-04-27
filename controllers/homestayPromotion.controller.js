const Promotion = require("../models/HomestayPromotion");

/* ── helper: get vendor id from req (handles both req.vendor and req.user) ── */
const getVendorId = (req) => {
  return req.vendor?._id || req.user?._id || req.vendor || req.user;
};

/* ════════ CREATE ════════ */
exports.createPromotion = async (req, res) => {
  try {
    const d = req.body;
    const vendorId = getVendorId(req);

    /* ── Basic validation ── */
    if (!vendorId)
      return res.status(401).json({ message: "Unauthorized: vendor not found in token" });

    if (!d.homestay)
      return res.status(400).json({ message: "Homestay is required" });

    if (!d.name || !d.name.trim())
      return res.status(400).json({ message: "Promotion name is required" });

    if (!d.discountValue || isNaN(Number(d.discountValue)) || Number(d.discountValue) <= 0)
      return res.status(400).json({ message: "Valid discount value is required" });

    if (!d.type || !["basic", "early", "last", "long"].includes(d.type))
      return res.status(400).json({ message: "Invalid promotion type" });

    /* ── Type-specific validation ── */
    if (d.type === "long" && (!d.minStay || Number(d.minStay) < 1))
      return res.status(400).json({ message: "Minimum stay (nights) is required for Long stay promotion" });

    if (d.type === "early" && (!d.advanceDays || Number(d.advanceDays) < 1))
      return res.status(400).json({ message: "Advance booking days is required for Early bird promotion" });

    if (d.type === "last" && (d.lastMinuteDays === undefined || d.lastMinuteDays === ""))
      return res.status(400).json({ message: "Last minute window is required for Last minute promotion" });

    /* ── Build payload (avoid NaN for optional number fields) ── */
    const payload = {
      vendor: vendorId,
      homestay: d.homestay,
      name: d.name.trim(),
      type: d.type,
      discountType: d.discountType || "percent",
      discountValue: Number(d.discountValue),
      startDate: d.startDate || undefined,
      endDate: d.endDate || undefined,
      days: Array.isArray(d.days) ? d.days : [],
    };

    if (d.minStay && !isNaN(Number(d.minStay)))      payload.minStay      = Number(d.minStay);
    if (d.maxStay && !isNaN(Number(d.maxStay)))      payload.maxStay      = Number(d.maxStay);
    if (d.advanceDays && !isNaN(Number(d.advanceDays))) payload.advanceDays = Number(d.advanceDays);
    if (d.lastMinuteDays !== undefined && d.lastMinuteDays !== "" && !isNaN(Number(d.lastMinuteDays)))
      payload.lastMinuteDays = Number(d.lastMinuteDays);

    const promo = await Promotion.create(payload);

    return res.status(201).json({ success: true, promo });

  } catch (err) {
    console.error("createPromotion error:", err);

    /* Mongoose validation error — send readable message */
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(", ") });
    }

    /* Duplicate or cast errors */
    if (err.name === "CastError")
      return res.status(400).json({ message: `Invalid value for field: ${err.path}` });

    return res.status(500).json({ message: err.message || "Internal server error" });
  }
};

/* ════════ GET ALL ════════ */
exports.getPromotions = async (req, res) => {
  try {
    const vendorId = getVendorId(req);

    if (!vendorId)
      return res.status(401).json({ message: "Unauthorized" });

    const data = await Promotion.find({ vendor: vendorId })
      .populate("homestay", "propertyName city")
      .sort({ createdAt: -1 });

    return res.json(data);

  } catch (err) {
    console.error("getPromotions error:", err);
    return res.status(500).json({ message: err.message || "Internal server error" });
  }
};

/* ════════ DELETE ════════ */
exports.deletePromotion = async (req, res) => {
  try {
    const vendorId = getVendorId(req);

    if (!vendorId)
      return res.status(401).json({ message: "Unauthorized" });

    const deleted = await Promotion.findOneAndDelete({
      _id: req.params.id,
      vendor: vendorId,
    });

    if (!deleted)
      return res.status(404).json({ message: "Promotion not found" });

    return res.json({ success: true, message: "Promotion deleted" });

  } catch (err) {
    console.error("deletePromotion error:", err);

    if (err.name === "CastError")
      return res.status(400).json({ message: "Invalid promotion ID" });

    return res.status(500).json({ message: err.message || "Internal server error" });
  }
};