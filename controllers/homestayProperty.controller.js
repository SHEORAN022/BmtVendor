const Homestay = require("../models/Homestay.model");

/* ================= HELPER ================= */
const parseArray = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  return String(val)
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
};

const toNum = (val, fallback = 0) => {
  const n = Number(val);
  return isNaN(n) ? fallback : n;
};

/* ================= CREATE ================= */
exports.createHomestayProperty = async (req, res) => {
  try {
    const d = req.body;

    if (!d.propertyName || !String(d.propertyName).trim()) {
      return res.status(400).json({ message: "Property name is required" });
    }

    const homestay = await Homestay.create({
      vendor: req.vendor._id,

      propertyName:  String(d.propertyName).trim(),
      propertyType:  d.propertyType  || "Homestay",
      description:   d.description   || "",
      hostName:      d.hostName       || "",

      phone:    d.phone    || "",
      altPhone: d.altPhone || "",
      email:    d.email    || "",

      country:  d.country  || "India",
      state:    d.state    || "",
      city:     d.city     || "",
      area:     d.area     || "",
      address:  d.address  || "",
      pincode:  d.pincode  || "",
      landmark: d.landmark || "",
      mapLocation: {
        lat: d.lat || "",
        lng: d.lng || "",
      },

      maxGuests: toNum(d.maxGuests),
      bedrooms:  toNum(d.bedrooms),
      bathrooms: toNum(d.bathrooms),
      beds:      toNum(d.beds),

      extraMattressAllowed: Boolean(d.extraMattressAllowed),
      childrenAllowed:      Boolean(d.childrenAllowed),
      petsAllowed:          Boolean(d.petsAllowed),

      amenities: parseArray(d.amenities),

      kitchenAvailable:    Boolean(d.kitchenAvailable),
      selfCookingAllowed:  Boolean(d.selfCookingAllowed),
      vegFoodAvailable:    Boolean(d.vegFoodAvailable),
      nonVegAllowed:       Boolean(d.nonVegAllowed),

      pricing: {
        basePrice:       toNum(d.basePrice),
        weekendPrice:    toNum(d.weekendPrice),
        extraGuestPrice: toNum(d.extraGuestPrice),
        cleaningFee:     toNum(d.cleaningFee),
        securityDeposit: toNum(d.securityDeposit),
      },

      checkInTime:  d.checkInTime  || "",
      checkOutTime: d.checkOutTime || "",

      availableFrom: d.availableFrom || null,
      availableTo:   d.availableTo   || null,

      roomType: d.roomType || "",
      mealPlan: d.mealPlan || "",

      houseRules: {
        smoking:           Boolean(d.smoking),
        alcohol:           Boolean(d.alcohol),
        parties:           Boolean(d.parties),
        loudMusic:         Boolean(d.loudMusic),
        unmarriedCouples:  Boolean(d.unmarriedCouples),
        localIdAllowed:    Boolean(d.localIdAllowed),
      },

      cancellationPolicy: d.cancellationPolicy || "",
      thumbnail:          d.thumbnail          || "",
      images:             parseArray(d.images),
      notes:              d.notes              || "",
    });

    return res.status(201).json({ success: true, homestay });

  } catch (err) {
    console.error("createHomestayProperty error:", err);
    return res.status(500).json({ message: err.message });
  }
};

/* ================= GET ALL ================= */
exports.getVendorHomestayProperties = async (req, res) => {
  try {
    const data = await Homestay.find({ vendor: req.vendor._id }).sort({
      createdAt: -1,
    });
    return res.json({ success: true, data });
  } catch (err) {
    console.error("getVendorHomestayProperties error:", err);
    return res.status(500).json({ message: err.message });
  }
};

/* ================= GET SINGLE ================= */
exports.getSingleHomestayProperty = async (req, res) => {
  try {
    const homestay = await Homestay.findOne({
      _id:    req.params.id,
      vendor: req.vendor._id,
    });

    if (!homestay) {
      return res.status(404).json({ message: "Homestay not found" });
    }

    return res.json({ success: true, homestay });
  } catch (err) {
    console.error("getSingleHomestayProperty error:", err);
    return res.status(500).json({ message: err.message });
  }
};

/* ================= UPDATE ================= */
exports.updateHomestayProperty = async (req, res) => {
  try {
    const d = req.body;

    // Build update object — only include fields that were actually sent
    const updateData = {};

    const strFields = [
      "propertyName", "propertyType", "description", "hostName",
      "phone", "altPhone", "email",
      "country", "state", "city", "area", "address", "pincode", "landmark",
      "checkInTime", "checkOutTime",
      "cancellationPolicy", "notes", "roomType", "mealPlan", "thumbnail",
    ];

    strFields.forEach((key) => {
      if (d[key] !== undefined) updateData[key] = String(d[key]).trim();
    });

    const numFields = ["maxGuests", "bedrooms", "bathrooms", "beds"];
    numFields.forEach((key) => {
      if (d[key] !== undefined) updateData[key] = toNum(d[key]);
    });

    const boolFields = [
      "extraMattressAllowed", "childrenAllowed", "petsAllowed",
      "kitchenAvailable", "selfCookingAllowed", "vegFoodAvailable", "nonVegAllowed",
    ];
    boolFields.forEach((key) => {
      if (d[key] !== undefined) updateData[key] = Boolean(d[key]);
    });

    if (d.amenities !== undefined) {
      updateData.amenities = parseArray(d.amenities);
    }

    if (d.images !== undefined) {
      updateData.images = parseArray(d.images);
    }

    // Pricing — build sub-object only with fields that were sent
    const pricingFields = [
      "basePrice", "weekendPrice", "extraGuestPrice", "cleaningFee", "securityDeposit",
    ];
    const hasPricing = pricingFields.some((k) => d[k] !== undefined);
    if (hasPricing) {
      updateData.pricing = {};
      pricingFields.forEach((key) => {
        if (d[key] !== undefined) updateData.pricing[key] = toNum(d[key]);
      });
    }

    // House rules
    const ruleFields = [
      "smoking", "alcohol", "parties", "loudMusic", "unmarriedCouples", "localIdAllowed",
    ];
    const hasRules = ruleFields.some((k) => d[k] !== undefined);
    if (hasRules) {
      updateData.houseRules = {};
      ruleFields.forEach((key) => {
        if (d[key] !== undefined) updateData.houseRules[key] = Boolean(d[key]);
      });
    }

    const homestay = await Homestay.findOneAndUpdate(
      { _id: req.params.id, vendor: req.vendor._id },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!homestay) {
      return res.status(404).json({ message: "Homestay not found" });
    }

    return res.json({ success: true, homestay });

  } catch (err) {
    console.error("updateHomestayProperty error:", err);
    return res.status(500).json({ message: err.message });
  }
};

/* ================= UPDATE LOCATION ================= */
exports.updateHomestayLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;

    if (lat === undefined || lng === undefined) {
      return res.status(400).json({ message: "lat and lng are required" });
    }

    const homestay = await Homestay.findOneAndUpdate(
      { _id: req.params.id, vendor: req.vendor._id },
      { $set: { mapLocation: { lat: String(lat), lng: String(lng) } } },
      { new: true }
    );

    if (!homestay) {
      return res.status(404).json({ message: "Homestay not found" });
    }

    return res.json({ success: true, homestay });

  } catch (err) {
    console.error("updateHomestayLocation error:", err);
    return res.status(500).json({ message: err.message });
  }
};