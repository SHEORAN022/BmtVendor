const Apartment = require("../models/Apartment.model");
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
   CREATE APARTMENT
===================================================== */
exports.createApartment = async (req, res) => {
  try {
    const b = req.body;

    // Upload images to Cloudinary
    const imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (let file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "vendor-apartments",
        });
        imageUrls.push(result.secure_url);
      }
    }

    const apartment = await Apartment.create({
      vendor: req.vendor._id,

      // BASIC
      apartmentName: b.apartmentName,
      propertyType: b.propertyType || "Apartment",
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
      mapLocation: { lat: b.lat, lng: b.lng },

      // BUILDING
      buildingName: b.buildingName,
      towerName: b.towerName,
      floorNumber: b.floorNumber,
      totalFloors: b.totalFloors,
      flatNumber: b.flatNumber,
      societyName: b.societyName,

      // APARTMENT DETAILS
      apartmentType: b.apartmentType,
      furnishing: b.furnishing,
      carpetArea: b.carpetArea,
      superArea: b.superArea,
      bedrooms: b.bedrooms,
      hall: b.hall,
      kitchen: b.kitchen,
      bathrooms: b.bathrooms,
      balcony: b.balcony,
      maxGuests: b.maxGuests,
      beds: b.beds,

      // CAPACITY EXTRAS
      extraMattressAllowed: b.extraMattressAllowed === "true",
      childrenAllowed: b.childrenAllowed === "true",
      petsAllowed: b.petsAllowed === "true",

      // CHECK IN / OUT
      checkInTime: b.checkInTime,
      checkOutTime: b.checkOutTime,

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
        monthlyPrice: b.monthlyPrice,
        weekendPrice: b.weekendPrice,
        extraGuestPrice: b.extraGuestPrice,
        cleaningFee: b.cleaningFee,
        securityDeposit: b.securityDeposit,
      },

      // ROOM INFO
      roomType: b.roomType,
      mealPlan: b.mealPlan,

      // AVAILABILITY
      availableFrom: b.availableFrom,
      availableTo: b.availableTo,

      // RULES
      houseRules: parseJSON(b.houseRules, {}),
      cancellationPolicy: b.cancellationPolicy,

      // MEDIA
      thumbnail: imageUrls[0] || "",
      images: imageUrls,

      // META
      notes: b.notes,
    });

    res.status(201).json({ success: true, data: apartment });
  } catch (error) {
    console.error("❌ CREATE APARTMENT ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* =====================================================
   GET MY APARTMENTS
===================================================== */
exports.getMyApartments = async (req, res) => {
  try {
    const apartments = await Apartment.find({ vendor: req.vendor._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: apartments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* =====================================================
   GET SINGLE APARTMENT
===================================================== */
exports.getApartmentById = async (req, res) => {
  try {
    const apartment = await Apartment.findOne({ _id: req.params.id, vendor: req.vendor._id });
    if (!apartment) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: apartment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* =====================================================
   UPDATE APARTMENT
   (status & vendor fields are protected)
===================================================== */
exports.updateApartment = async (req, res) => {
  try {
    const b = req.body;

    const existing = await Apartment.findOne({ _id: req.params.id, vendor: req.vendor._id });
    if (!existing) return res.status(404).json({ success: false, message: "Not found" });

    // Upload new images and merge with existing
    let imageUrls = existing.images || [];
    if (req.files && req.files.length > 0) {
      const newUrls = [];
      for (let file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, { folder: "vendor-apartments" });
        newUrls.push(result.secure_url);
      }
      imageUrls = [...imageUrls, ...newUrls];
    }

    // Strip protected fields
    const { status, vendor, ...updateData } = b;

    const updated = await Apartment.findByIdAndUpdate(
      req.params.id,
      {
        ...updateData,
        amenities: b.amenities ? parseJSON(b.amenities, []) : existing.amenities,
        houseRules: b.houseRules ? parseJSON(b.houseRules, {}) : existing.houseRules,
        pricing: {
          basePrice: b.basePrice ?? existing.pricing?.basePrice,
          monthlyPrice: b.monthlyPrice ?? existing.pricing?.monthlyPrice,
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
    console.error("❌ UPDATE APARTMENT ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* =====================================================
   DELETE APARTMENT
===================================================== */
exports.deleteApartment = async (req, res) => {
  try {
    const deleted = await Apartment.findOneAndDelete({ _id: req.params.id, vendor: req.vendor._id });
    if (!deleted) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, message: "Apartment deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* =====================================================
   TOGGLE ACTIVE / INACTIVE
   (only approved listings can be toggled by vendor)
===================================================== */
exports.toggleActiveStatus = async (req, res) => {
  try {
    const apartment = await Apartment.findOne({ _id: req.params.id, vendor: req.vendor._id });
    if (!apartment) return res.status(404).json({ success: false, message: "Not found" });

    if (apartment.status !== "approved" && apartment.status !== "inactive") {
      return res.status(400).json({ success: false, message: "Only approved apartments can be toggled" });
    }

    apartment.status = apartment.status === "approved" ? "inactive" : "approved";
    await apartment.save();

    res.json({ success: true, data: apartment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};