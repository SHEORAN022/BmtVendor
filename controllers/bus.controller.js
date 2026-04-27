const Bus = require("../models/Bus.model");
const cloudinary = require("../config/cloudinary");

/* =========================================================
   HELPERS
========================================================= */

const parseArray = (field) => {
  if (!field) return [];
  if (Array.isArray(field)) return field;
  if (typeof field === "string")
    return field.split(",").map((s) => s.trim()).filter(Boolean);
  return [];
};

// Accepts JSON string OR "Location|Time|Address|Landmark, ..." format
const parsePoints = (field) => {
  if (!field) return [];
  if (Array.isArray(field)) return field;
  try {
    const parsed = JSON.parse(field);
    if (Array.isArray(parsed)) return parsed;
  } catch (_) {}
  return field
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((point) => {
      const parts = point.split("|").map((p) => p.trim());
      return {
        location: parts[0] || "",
        time:     parts[1] || "",
        address:  parts[2] || "",
        landmark: parts[3] || "",
      };
    });
};

// "A1:500, A2:600" or JSON
const parseSeatPrice = (field) => {
  if (!field) return [];
  if (Array.isArray(field)) return field;
  try {
    const parsed = JSON.parse(field);
    if (Array.isArray(parsed)) return parsed;
  } catch (_) {}
  return field
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((item) => {
      const [seatNo, price] = item.split(":").map((p) => p.trim());
      return { seatNo: seatNo || "", price: price || "" };
    });
};

// Upload single file to Cloudinary
const uploadToCloudinary = async (filePath, folder) => {
  const result = await cloudinary.uploader.upload(filePath, { folder });
  return { public_id: result.public_id, url: result.secure_url };
};

/* =========================================================
   ADD BUS  (Vendor)
========================================================= */
exports.addBus = async (req, res) => {
  try {
    const d = req.body;

    /* ── Validation ── */
    if (!req.files?.image) {
      return res
        .status(400)
        .json({ success: false, message: "Main bus image is required" });
    }

    /* ── Upload main image ── */
    const mainImg = await uploadToCloudinary(
      req.files.image[0].path,
      "buses/main"
    );

    /* ── Upload front / back / seatLayout / inside images ── */
    let frontImage = "";
    let backImage = "";
    let seatLayoutImage = "";
    let insideImages = [];

    if (req.files.frontImage?.[0])
      frontImage = (
        await uploadToCloudinary(req.files.frontImage[0].path, "buses/extra")
      ).url;

    if (req.files.backImage?.[0])
      backImage = (
        await uploadToCloudinary(req.files.backImage[0].path, "buses/extra")
      ).url;

    if (req.files.seatLayoutImage?.[0])
      seatLayoutImage = (
        await uploadToCloudinary(
          req.files.seatLayoutImage[0].path,
          "buses/extra"
        )
      ).url;

    if (req.files.insideImages?.length) {
      for (const file of req.files.insideImages) {
        const uploaded = await uploadToCloudinary(file.path, "buses/inside");
        insideImages.push(uploaded.url);
      }
    }

    /* ── Gallery ── */
    let gallery = [];
    if (req.files.gallery) {
      if (req.files.gallery.length > 10) {
        return res
          .status(400)
          .json({ success: false, message: "Max 10 gallery images allowed" });
      }
      for (const file of req.files.gallery) {
        const uploaded = await uploadToCloudinary(file.path, "buses/gallery");
        gallery.push(uploaded);
      }
    }

    /* ── Parse arrays ── */
    const amenities      = parseArray(d.amenities);
    const viaCities      = parseArray(d.viaCities);
    const boardingPoints = parsePoints(d.boardingPoints);
    const droppingPoints = parsePoints(d.droppingPoints);
    const seatPrice      = parseSeatPrice(d.seatPrice);
    const bookedSeats    = parseArray(d.bookedSeats);
    const blockedSeats   = parseArray(d.blockedSeats);

    /* ── Auto-generate seat numbers ── */
    const totalSeats = parseInt(d.totalSeats || 40);
    let seatNumbers = parseArray(d.seatNumbers);
    if (seatNumbers.length === 0) {
      for (let i = 1; i <= totalSeats; i++) seatNumbers.push(`S${i}`);
    }

    const bus = await Bus.create({
      vendor: req.vendor._id,

      // Basic
      busId:        d.busId,
      busName:      d.busName,
      busNumber:    d.busNumber,
      operatorName: d.operatorName,
      vendorName:   d.vendorName,
      busOwner:     d.busOwner,

      // Contact
      email:    d.email,
      phone:    d.phone,
      altPhone: d.altPhone,
      address:  d.address,
      city:     d.city,
      state:    d.state,
      country:  d.country,

      // Route
      fromCity:        d.fromCity,
      toCity:          d.toCity,
      viaCities,
      routeName:       d.routeName,
      boardingPoints,
      droppingPoints,

      // Timing
      departureTime:   d.departureTime,
      arrivalTime:     d.arrivalTime,
      journeyDuration: d.journeyDuration,
      reportingTime:   d.reportingTime,

      // Bus details
      busType:        d.busType,
      busCategory:    d.busCategory,
      busModel:       d.busModel,
      busColor:       d.busColor,
      seatLayoutType: d.seatLayoutType,
      totalSeats,
      availableSeats: totalSeats,
      upperSeats:     parseInt(d.upperSeats || 0),
      lowerSeats:     parseInt(d.lowerSeats || 0),

      // Seats
      seatNumbers,
      bookedSeats,
      blockedSeats,
      seatPrice,

      // Pricing
      price:               parseFloat(d.price),
      basePrice:           d.basePrice,
      tax:                 d.tax,
      tollTax:             d.tollTax,
      discount:            d.discount,
      offerPrice:          d.offerPrice,
      finalPrice:          d.finalPrice,
      agentCommission:     d.agentCommission,
      agentPrice:          d.agentPrice,
      vendorCost:          d.vendorCost,
      vendorPaymentStatus: d.vendorPaymentStatus,
      profit:              d.profit,

      // Driver
      driverName:    d.driverName,
      driverPhone:   d.driverPhone,
      driverLicense: d.driverLicense,
      helperName:    d.helperName,
      helperPhone:   d.helperPhone,

      // Documents
      rcNumber:        d.rcNumber,
      insuranceNumber: d.insuranceNumber,
      permitNumber:    d.permitNumber,
      fitnessExpiry:   d.fitnessExpiry,

      // Live Track
      gpsDeviceId:        d.gpsDeviceId,
      liveTrackingLink:   d.liveTrackingLink,
      busCurrentLocation: d.busCurrentLocation,

      // Amenities
      amenities,

      // Dates
      travelDate:       d.travelDate,
      returnDate:       d.returnDate || null,
      startBookingDate: d.startBookingDate || null,
      endBookingDate:   d.endBookingDate   || null,

      // Map
      routeMap: {
        fromLat: d.fromLat || "",
        fromLng: d.fromLng || "",
        toLat:   d.toLat   || "",
        toLng:   d.toLng   || "",
      },

      // Images
      image:           mainImg.url,
      frontImage,
      backImage,
      seatLayoutImage,
      insideImages,
      gallery,

      // Policy
      cancellationPolicy: d.cancellationPolicy,
      rating:   d.rating,
      reviews:  d.reviews,

      // Status & Admin
      status:     "pending",
      notes:      d.notes,
      addedBy:    "vendor",
      isActive:   true,
    });

    res.json({
      success: true,
      message: "Bus added successfully. Waiting for admin approval.",
      bus,
    });
  } catch (err) {
    console.error("addBus error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* =========================================================
   GET VENDOR'S OWN BUSES
========================================================= */
exports.getVendorBuses = async (req, res) => {
  try {
    const buses = await Bus.find({ vendor: req.vendor._id }).sort({
      createdAt: -1,
    });
    res.json({ success: true, buses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* =========================================================
   GET SINGLE BUS
========================================================= */
exports.getBusById = async (req, res) => {
  try {
    const bus = await Bus.findOne({
      _id:    req.params.id,
      vendor: req.vendor._id,
    });
    if (!bus)
      return res.status(404).json({ success: false, message: "Bus not found" });
    res.json({ success: true, bus });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* =========================================================
   UPDATE BUS
========================================================= */
exports.updateBus = async (req, res) => {
  try {
    const d = req.body;

    const bus = await Bus.findOne({
      _id:    req.params.id,
      vendor: req.vendor._id,
    });
    if (!bus)
      return res.status(404).json({ success: false, message: "Bus not found" });

    /* ── Parse arrays ── */
    const amenities      = parseArray(d.amenities);
    const viaCities      = parseArray(d.viaCities);
    const seatNumbers    = parseArray(d.seatNumbers);
    const boardingPoints = parsePoints(d.boardingPoints);
    const droppingPoints = parsePoints(d.droppingPoints);
    const seatPrice      = parseSeatPrice(d.seatPrice);

    /* ── Update scalar fields ── */
    Object.assign(bus, {
      busName:      d.busName,
      busNumber:    d.busNumber,
      operatorName: d.operatorName,
      vendorName:   d.vendorName,
      busOwner:     d.busOwner,

      email:    d.email,
      phone:    d.phone,
      altPhone: d.altPhone,
      address:  d.address,
      city:     d.city,
      state:    d.state,
      country:  d.country,

      fromCity:        d.fromCity,
      toCity:          d.toCity,
      viaCities,
      routeName:       d.routeName,
      boardingPoints,
      droppingPoints,

      departureTime:   d.departureTime,
      arrivalTime:     d.arrivalTime,
      journeyDuration: d.journeyDuration,
      reportingTime:   d.reportingTime,

      busType:        d.busType,
      busCategory:    d.busCategory,
      busModel:       d.busModel,
      busColor:       d.busColor,
      seatLayoutType: d.seatLayoutType,
      totalSeats:     parseInt(d.totalSeats || bus.totalSeats),
      upperSeats:     parseInt(d.upperSeats || 0),
      lowerSeats:     parseInt(d.lowerSeats || 0),
      seatNumbers:    seatNumbers.length ? seatNumbers : bus.seatNumbers,
      seatPrice,

      price:               d.price ? parseFloat(d.price) : bus.price,
      basePrice:           d.basePrice,
      tax:                 d.tax,
      tollTax:             d.tollTax,
      discount:            d.discount,
      offerPrice:          d.offerPrice,
      finalPrice:          d.finalPrice,
      agentCommission:     d.agentCommission,
      agentPrice:          d.agentPrice,
      vendorCost:          d.vendorCost,
      vendorPaymentStatus: d.vendorPaymentStatus,
      profit:              d.profit,

      driverName:    d.driverName,
      driverPhone:   d.driverPhone,
      driverLicense: d.driverLicense,
      helperName:    d.helperName,
      helperPhone:   d.helperPhone,

      rcNumber:        d.rcNumber,
      insuranceNumber: d.insuranceNumber,
      permitNumber:    d.permitNumber,
      fitnessExpiry:   d.fitnessExpiry,

      gpsDeviceId:        d.gpsDeviceId,
      liveTrackingLink:   d.liveTrackingLink,
      busCurrentLocation: d.busCurrentLocation,

      amenities,

      travelDate:       d.travelDate       || bus.travelDate,
      returnDate:       d.returnDate       || null,
      startBookingDate: d.startBookingDate || null,
      endBookingDate:   d.endBookingDate   || null,

      routeMap: {
        fromLat: d.fromLat || "",
        fromLng: d.fromLng || "",
        toLat:   d.toLat   || "",
        toLng:   d.toLng   || "",
      },

      cancellationPolicy: d.cancellationPolicy,
      notes:              d.notes,
      modifiedDate:       new Date(),
    });

    /* ── Update images if new files sent ── */
    if (req.files?.image?.[0]) {
      const uploaded = await uploadToCloudinary(
        req.files.image[0].path,
        "buses/main"
      );
      bus.image = uploaded.url;
    }

    if (req.files?.frontImage?.[0]) {
      const uploaded = await uploadToCloudinary(
        req.files.frontImage[0].path,
        "buses/extra"
      );
      bus.frontImage = uploaded.url;
    }

    if (req.files?.backImage?.[0]) {
      const uploaded = await uploadToCloudinary(
        req.files.backImage[0].path,
        "buses/extra"
      );
      bus.backImage = uploaded.url;
    }

    if (req.files?.seatLayoutImage?.[0]) {
      const uploaded = await uploadToCloudinary(
        req.files.seatLayoutImage[0].path,
        "buses/extra"
      );
      bus.seatLayoutImage = uploaded.url;
    }

    if (req.files?.insideImages?.length) {
      bus.insideImages = [];
      for (const file of req.files.insideImages) {
        const uploaded = await uploadToCloudinary(file.path, "buses/inside");
        bus.insideImages.push(uploaded.url);
      }
    }

    /* ── Append new gallery images ── */
    if (req.files?.gallery?.length) {
      for (const file of req.files.gallery) {
        const uploaded = await uploadToCloudinary(file.path, "buses/gallery");
        bus.gallery.push(uploaded);
      }
    }

    /* ── Remove gallery by public_id if requested ── */
    if (d.removeGallery) {
      const toRemove = parseArray(d.removeGallery);
      bus.gallery = bus.gallery.filter(
        (g) => !toRemove.includes(g.public_id)
      );
    }

    await bus.save();
    res.json({ success: true, message: "Bus updated successfully", bus });
  } catch (err) {
    console.error("updateBus error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* =========================================================
   DELETE BUS
========================================================= */
exports.deleteBus = async (req, res) => {
  try {
    const bus = await Bus.findOneAndDelete({
      _id:    req.params.id,
      vendor: req.vendor._id,
    });
    if (!bus)
      return res.status(404).json({ success: false, message: "Bus not found" });
    res.json({ success: true, message: "Bus deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* =========================================================
   USER SEARCH  (approved + active only)
========================================================= */
exports.searchBuses = async (req, res) => {
  try {
    const { fromCity, toCity, travelDate } = req.query;

    const query = { status: "approved", isActive: true };
    if (fromCity)   query.fromCity  = new RegExp(fromCity, "i");
    if (toCity)     query.toCity    = new RegExp(toCity,   "i");
    if (travelDate) query.travelDate = new Date(travelDate);

    const buses = await Bus.find(query).populate("vendor", "name email phone");
    res.json({ success: true, buses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* =========================================================
   TOGGLE ACTIVE STATUS
========================================================= */
exports.toggleBusStatus = async (req, res) => {
  try {
    const bus = await Bus.findOne({
      _id:    req.params.id,
      vendor: req.vendor._id,
    });
    if (!bus)
      return res.status(404).json({ success: false, message: "Bus not found" });

    bus.isActive = !bus.isActive;
    await bus.save();

    res.json({
      success:  true,
      message:  `Bus ${bus.isActive ? "activated" : "deactivated"}`,
      isActive: bus.isActive,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};