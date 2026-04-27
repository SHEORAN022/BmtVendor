const Promotion = require("../models/Promotion");

/* =========================================
   HELPER
========================================= */
const toNumber = (v) => (v !== undefined ? Number(v) : undefined);

/* =========================================
   CREATE PROMOTION
========================================= */
exports.createPromotion = async (req, res) => {
  try {
    const d = req.body;

    /* ===== VALIDATION ===== */
    if (!d.hotel) {
      return res.status(400).json({ message: "Hotel is required" });
    }

    if (!d.name) {
      return res.status(400).json({ message: "Promotion name required" });
    }

    if (!d.type) {
      return res.status(400).json({ message: "Promotion type required" });
    }

    if (!d.discountValue) {
      return res.status(400).json({ message: "Discount value required" });
    }

    /* TYPE BASED VALIDATION */
    if (d.type === "early" && !d.advanceDays) {
      return res.status(400).json({ message: "Advance days required for early bird" });
    }

    if (d.type === "last" && !d.lastMinuteDays) {
      return res.status(400).json({ message: "Last minute days required" });
    }

    if (d.type === "long" && !d.minStay) {
      return res.status(400).json({ message: "Minimum stay required" });
    }

    /* ===== CREATE ===== */
    const promo = await Promotion.create({
      vendor: req.vendor._id,
      hotel: d.hotel,

      name: d.name,
      type: d.type,

      discountType: d.discountType || "percent",
      discountValue: toNumber(d.discountValue),

      minStay: toNumber(d.minStay),
      maxStay: toNumber(d.maxStay),

      advanceDays: toNumber(d.advanceDays),
      lastMinuteDays: toNumber(d.lastMinuteDays),

      startDate: d.startDate,
      endDate: d.endDate,

      days: d.days || [],

      status: d.status || "active",
    });

    res.json({ success: true, promo });

  } catch (err) {
    console.error("CREATE PROMO ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

/* =========================================
   GET ALL PROMOTIONS (VENDOR)
========================================= */
exports.getPromotions = async (req, res) => {
  try {
    const data = await Promotion.find({ vendor: req.vendor._id })
      .populate("hotel", "hotelName city")
      .sort({ createdAt: -1 });

    res.json(data);

  } catch (err) {
    console.error("GET PROMO ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

/* =========================================
   GET SINGLE PROMOTION
========================================= */
exports.getSinglePromotion = async (req, res) => {
  try {
    const promo = await Promotion.findOne({
      _id: req.params.id,
      vendor: req.vendor._id,
    }).populate("hotel");

    if (!promo) {
      return res.status(404).json({ message: "Promotion not found" });
    }

    res.json(promo);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =========================================
   UPDATE PROMOTION
========================================= */
exports.updatePromotion = async (req, res) => {
  try {
    const promo = await Promotion.findOneAndUpdate(
      { _id: req.params.id, vendor: req.vendor._id },
      req.body,
      { new: true }
    );

    if (!promo) {
      return res.status(404).json({ message: "Promotion not found" });
    }

    res.json({ success: true, promo });

  } catch (err) {
    console.error("UPDATE PROMO ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

/* =========================================
   DELETE PROMOTION
========================================= */
exports.deletePromotion = async (req, res) => {
  try {
    const promo = await Promotion.findOneAndDelete({
      _id: req.params.id,
      vendor: req.vendor._id,
    });

    if (!promo) {
      return res.status(404).json({ message: "Promotion not found" });
    }

    res.json({ success: true, message: "Promotion deleted" });

  } catch (err) {
    console.error("DELETE PROMO ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

/* =========================================
   TOGGLE STATUS (ACTIVE / INACTIVE)
========================================= */
exports.toggleStatus = async (req, res) => {
  try {
    const promo = await Promotion.findOne({
      _id: req.params.id,
      vendor: req.vendor._id,
    });

    if (!promo) {
      return res.status(404).json({ message: "Promotion not found" });
    }

    promo.status = promo.status === "active" ? "inactive" : "active";
    await promo.save();

    res.json({ success: true, status: promo.status });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};