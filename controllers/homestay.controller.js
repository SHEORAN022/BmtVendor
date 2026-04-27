
const Homestay = require("../models/Homestay.model");
const cloudinary = require("../config/cloudinary");

/* ================= HELPER ================= */
const parseJSON = (val, fallback) => {
  try {
    return typeof val === "string" ? JSON.parse(val) : val ?? fallback;
  } catch {
    return fallback;
  }
};

/* =====================================================
   CREATE HOMESTAY
===================================================== */
exports.createHomestay = async (req, res) => {
  try {
    const b = req.body;

    // Upload images to cloudinary
    const imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (let file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "vendor-homestays",
        });
        imageUrls.push(result.secure_url);
      }
    }

    const homestay = await Homestay.create({
      vendor: req.vendor._id,

      // BASIC
      propertyName: b.propertyName,
      propertyType: b.propertyType,
      description: b.description,
      hostName: b.hostName,

      // CONTACT
      phone: b.phone,
      altPhone: b.altPhone,
      email: b.email,

      // LOCATION
      country: b.country || "India",
      state: b.state,
      city: b.city,
      area: b.area,
      address: b.address,
      pincode: b.pincode,
      landmark: b.landmark,
      mapLocation: {
        lat: b.lat,
        lng: b.lng,
      },

      // CAPACITY
      maxGuests: b.maxGuests,
      bedrooms: b.bedrooms,
      bathrooms: b.bathrooms,
      beds: b.beds,
      extraMattressAllowed: b.extraMattressAllowed === "true",
      childrenAllowed: b.childrenAllowed === "true",
      petsAllowed: b.petsAllowed === "true",

      // AMENITIES
      amenities: parseJSON(b.amenities, []),

      // FOOD
      kitchenAvailable: b.kitchenAvailable === "true",
      selfCookingAllowed: b.selfCookingAllowed === "true",
      vegFoodAvailable: b.vegFoodAvailable === "true",
      nonVegAllowed: b.nonVegAllowed === "true",

      // PRICING
      pricing: {
        basePrice: b.basePrice,
        weekendPrice: b.weekendPrice,
        extraGuestPrice: b.extraGuestPrice,
        cleaningFee: b.cleaningFee,
        securityDeposit: b.securityDeposit,
      },

      // CHECK IN / OUT
      checkInTime: b.checkInTime,
      checkOutTime: b.checkOutTime,

      // AVAILABILITY
      availableFrom: b.availableFrom,
      availableTo: b.availableTo,

      // ROOM
      roomType: b.roomType,
      mealPlan: b.mealPlan,

      // RULES
      houseRules: parseJSON(b.houseRules, {}),
      cancellationPolicy: b.cancellationPolicy,

      // MEDIA
      thumbnail: imageUrls[0] || "",
      images: imageUrls,

      // META
      notes: b.notes,
    });

    res.status(201).json({ success: true, data: homestay });
  } catch (error) {
    console.error("❌ CREATE HOMESTAY ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* =====================================================
   GET MY HOMESTAYS (vendor ke apne)
===================================================== */
exports.getMyHomestays = async (req, res) => {
  try {
    const homestays = await Homestay.find({ vendor: req.vendor._id }).sort({
      createdAt: -1,
    });
    res.json({ success: true, data: homestays });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* =====================================================
   GET SINGLE HOMESTAY
===================================================== */
exports.getHomestayById = async (req, res) => {
  try {
    const homestay = await Homestay.findOne({
      _id: req.params.id,
      vendor: req.vendor._id,
    });
    if (!homestay)
      return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: homestay });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* =====================================================
   UPDATE HOMESTAY
   (status field update nahi hogi - admin ka kaam)
===================================================== */
exports.updateHomestay = async (req, res) => {
  try {
    const b = req.body;

    // Pehle existing fetch karo
    const existing = await Homestay.findOne({
      _id: req.params.id,
      vendor: req.vendor._id,
    });
    if (!existing)
      return res.status(404).json({ success: false, message: "Not found" });

    // Naye images upload karo (agar hain)
    let imageUrls = existing.images || [];
    if (req.files && req.files.length > 0) {
      const newUrls = [];
      for (let file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "vendor-homestays",
        });
        newUrls.push(result.secure_url);
      }
      imageUrls = [...imageUrls, ...newUrls];
    }

    // Status ko update hone se rokna
    const { status, vendor, ...updateData } = b;

    const updated = await Homestay.findByIdAndUpdate(
      req.params.id,
      {
        ...updateData,
        amenities: b.amenities ? parseJSON(b.amenities, []) : existing.amenities,
        houseRules: b.houseRules ? parseJSON(b.houseRules, {}) : existing.houseRules,
        pricing: {
          basePrice: b.basePrice ?? existing.pricing?.basePrice,
          weekendPrice: b.weekendPrice ?? existing.pricing?.weekendPrice,
          extraGuestPrice: b.extraGuestPrice ?? existing.pricing?.extraGuestPrice,
          cleaningFee: b.cleaningFee ?? existing.pricing?.cleaningFee,
          securityDeposit: b.securityDeposit ?? existing.pricing?.securityDeposit,
        },
        mapLocation: {
          lat: b.lat ?? existing.mapLocation?.lat,
          lng: b.lng ?? existing.mapLocation?.lng,
        },
        thumbnail: imageUrls[0] || existing.thumbnail,
        images: imageUrls,
      },
      { new: true }
    );

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error("❌ UPDATE HOMESTAY ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* =====================================================
   DELETE HOMESTAY
===================================================== */
exports.deleteHomestay = async (req, res) => {
  try {
    const deleted = await Homestay.findOneAndDelete({
      _id: req.params.id,
      vendor: req.vendor._id,
    });
    if (!deleted)
      return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, message: "Homestay deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* =====================================================
   TOGGLE STATUS (sirf active/inactive - vendor apna listing hide kar sakta hai)
===================================================== */
exports.toggleActiveStatus = async (req, res) => {
  try {
    const homestay = await Homestay.findOne({
      _id: req.params.id,
      vendor: req.vendor._id,
    });
    if (!homestay)
      return res.status(404).json({ success: false, message: "Not found" });

    // Sirf approved listings ko active/inactive toggle kar sakte hain
    if (homestay.status !== "approved" && homestay.status !== "inactive") {
      return res.status(400).json({
        success: false,
        message: "Only approved homestays can be toggled",
      });
    }

    homestay.status = homestay.status === "approved" ? "inactive" : "approved";
    await homestay.save();

    res.json({ success: true, data: homestay });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};