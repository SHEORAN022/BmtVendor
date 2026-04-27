

const Hotel = require("../models/Hotel.model");
const cloudinary = require("../config/cloudinary");

/* ─────────────────────────────────────────
   HELPERS
───────────────────────────────────────── */
const parseArr = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  try { return JSON.parse(val); } catch { return val.split(",").map((s) => s.trim()); }
};

const toBool = (val) => val === "true" || val === true;

const uploadMany = async (files, folder) => {
  const urls = [];
  for (const file of files) {
    const res = await cloudinary.uploader.upload(file.path, { folder });
    urls.push(res.secure_url);
  }
  return urls;
};

/* ═══════════════════════════════════════════
   ADD HOTEL
═══════════════════════════════════════════ */
exports.addHotel = async (req, res) => {
  try {
    const d = req.body;

    if (!req.files?.hotelImages?.length) {
      return res.status(400).json({ message: "At least one hotel image is required" });
    }

    // Upload images
    const hotelImages = await uploadMany(req.files.hotelImages, "hotels/main");
    const roomImages  = req.files?.roomImages ? await uploadMany(req.files.roomImages, "hotels/rooms")   : [];
    const videos      = req.files?.videos     ? await uploadMany(req.files.videos,     "hotels/videos")  : [];

    // Location
    const location = {
      type: "Point",
      coordinates:
        d.latitude && d.longitude
          ? [parseFloat(d.longitude), parseFloat(d.latitude)]
          : [0, 0],
    };

    const hotel = await Hotel.create({
      vendor: req.vendor._id,

      // Basic
      hotelName:   d.hotelName,
      hotelType:   d.hotelType,
      description: d.description,
      starRating:  d.starRating  ? Number(d.starRating)  : undefined,
      yearBuilt:   d.yearBuilt   ? Number(d.yearBuilt)   : undefined,

      // Contact
      phone:          d.phone,
      alternatePhone: d.alternatePhone,
      email:          d.email,
      website:        d.website,

      // Address
      country:  d.country || "India",
      state:    d.state,
      city:     d.city,
      area:     d.area,
      address:  d.address,
      pincode:  d.pincode,
      landmark: d.landmark,
      location,

      // Facilities
      amenities:          parseArr(d.amenities),
      propertyHighlights: parseArr(d.propertyHighlights),
      foodAndDining:      parseArr(d.foodAndDining),
      safetyAndSecurity:  parseArr(d.safetyAndSecurity),
      wellnessAndSpa:     parseArr(d.wellnessAndSpa),
      businessFacilities: parseArr(d.businessFacilities),
      mediaAndTechnology: parseArr(d.mediaAndTechnology),
      transportServices:  parseArr(d.transportServices),
      paymentMethods:     parseArr(d.paymentMethods),

      // Media
      hotelImages,
      roomImages,
      videos,
      virtualTourLink: d.virtualTourLink,

      // Policies
      checkInTime:          d.checkInTime,
      checkOutTime:         d.checkOutTime,
      earlyCheckInAllowed:  d.earlyCheckInAllowed !== undefined ? toBool(d.earlyCheckInAllowed) : undefined,
      lateCheckOutAllowed:  d.lateCheckOutAllowed !== undefined ? toBool(d.lateCheckOutAllowed) : undefined,
      cancellationPolicy:   d.cancellationPolicy,
      childPolicy:          d.childPolicy,
      petPolicy:            d.petPolicy,
      coupleFriendly:       d.coupleFriendly  !== undefined ? toBool(d.coupleFriendly)  : true,
      localIdAllowed:       d.localIdAllowed  !== undefined ? toBool(d.localIdAllowed)  : true,

      // Pricing
      pricePerNight:  d.pricePerNight  ? Number(d.pricePerNight)  : undefined,
      taxPercentage:  d.taxPercentage  ? Number(d.taxPercentage)  : undefined,
      serviceCharge:  d.serviceCharge  ? Number(d.serviceCharge)  : undefined,
      extraBedCharge: d.extraBedCharge ? Number(d.extraBedCharge) : undefined,
      refundPolicy:   d.refundPolicy,
      gstNumber:      d.gstNumber,

      rooms: [],
    });

    res.status(201).json({ success: true, message: "Hotel added successfully", hotel });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ═══════════════════════════════════════════
   GET VENDOR HOTELS
═══════════════════════════════════════════ */
exports.getHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find({ vendor: req.vendor._id }).sort({ createdAt: -1 });
    res.json(hotels);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ═══════════════════════════════════════════
   GET SINGLE HOTEL
═══════════════════════════════════════════ */
exports.getSingleHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findOne({ _id: req.params.id, vendor: req.vendor._id });
    if (!hotel) return res.status(404).json({ message: "Hotel not found" });
    res.json(hotel);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ═══════════════════════════════════════════
   UPDATE HOTEL
═══════════════════════════════════════════ */
exports.updateHotel = async (req, res) => {
  try {
    const d = req.body;

    const updateData = {
      // Basic
      hotelName:   d.hotelName,
      hotelType:   d.hotelType,
      description: d.description,
      starRating:  d.starRating  ? Number(d.starRating)  : undefined,
      yearBuilt:   d.yearBuilt   ? Number(d.yearBuilt)   : undefined,

      // Contact
      phone:          d.phone,
      alternatePhone: d.alternatePhone,
      email:          d.email,
      website:        d.website,

      // Address
      country:  d.country,
      state:    d.state,
      city:     d.city,
      area:     d.area,
      address:  d.address,
      pincode:  d.pincode,
      landmark: d.landmark,

      // Facilities
      amenities:          parseArr(d.amenities),
      propertyHighlights: parseArr(d.propertyHighlights),
      foodAndDining:      parseArr(d.foodAndDining),
      safetyAndSecurity:  parseArr(d.safetyAndSecurity),
      wellnessAndSpa:     parseArr(d.wellnessAndSpa),
      businessFacilities: parseArr(d.businessFacilities),
      mediaAndTechnology: parseArr(d.mediaAndTechnology),
      transportServices:  parseArr(d.transportServices),
      paymentMethods:     parseArr(d.paymentMethods),

      // Media
      virtualTourLink: d.virtualTourLink,

      // Policies
      checkInTime:         d.checkInTime,
      checkOutTime:        d.checkOutTime,
      earlyCheckInAllowed: d.earlyCheckInAllowed !== undefined ? toBool(d.earlyCheckInAllowed) : undefined,
      lateCheckOutAllowed: d.lateCheckOutAllowed !== undefined ? toBool(d.lateCheckOutAllowed) : undefined,
      cancellationPolicy:  d.cancellationPolicy,
      childPolicy:         d.childPolicy,
      petPolicy:           d.petPolicy,
      coupleFriendly:      d.coupleFriendly  !== undefined ? toBool(d.coupleFriendly)  : undefined,
      localIdAllowed:      d.localIdAllowed  !== undefined ? toBool(d.localIdAllowed)  : undefined,

      // Pricing
      pricePerNight:  d.pricePerNight  ? Number(d.pricePerNight)  : undefined,
      taxPercentage:  d.taxPercentage  ? Number(d.taxPercentage)  : undefined,
      serviceCharge:  d.serviceCharge  ? Number(d.serviceCharge)  : undefined,
      extraBedCharge: d.extraBedCharge ? Number(d.extraBedCharge) : undefined,
      refundPolicy:   d.refundPolicy,
      gstNumber:      d.gstNumber,
    };

    // Location
    if (d.latitude && d.longitude) {
      updateData.location = {
        type: "Point",
        coordinates: [parseFloat(d.longitude), parseFloat(d.latitude)],
      };
    }

    // Append new images
    if (req.files?.hotelImages?.length) {
      const urls = await uploadMany(req.files.hotelImages, "hotels/main");
      updateData.$push = { ...(updateData.$push || {}), hotelImages: { $each: urls } };
    }
    if (req.files?.roomImages?.length) {
      const urls = await uploadMany(req.files.roomImages, "hotels/rooms");
      updateData.$push = { ...(updateData.$push || {}), roomImages: { $each: urls } };
    }
    if (req.files?.videos?.length) {
      const urls = await uploadMany(req.files.videos, "hotels/videos");
      updateData.$push = { ...(updateData.$push || {}), videos: { $each: urls } };
    }

    // Remove undefined keys (don't overwrite existing data with undefined)
    Object.keys(updateData).forEach(
      (k) => updateData[k] === undefined && delete updateData[k]
    );

    const hotel = await Hotel.findOneAndUpdate(
      { _id: req.params.id, vendor: req.vendor._id },
      updateData,
      { new: true }
    );

    if (!hotel) return res.status(404).json({ message: "Hotel not found" });
    res.json({ success: true, hotel });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ═══════════════════════════════════════════
   DELETE HOTEL
═══════════════════════════════════════════ */
exports.deleteHotel = async (req, res) => {
  try {
    await Hotel.findOneAndDelete({ _id: req.params.id, vendor: req.vendor._id });
    res.json({ success: true, message: "Hotel deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ═══════════════════════════════════════════
   ADD ROOM
═══════════════════════════════════════════ */
exports.addRoom = async (req, res) => {
  try {
    const d = req.body;

    // Upload room images
    let images = [];
    if (req.files?.roomGallery?.length) {
      if (req.files.roomGallery.length > 10) {
        return res.status(400).json({ message: "Maximum 10 images per room" });
      }
      images = await uploadMany(req.files.roomGallery, "hotels/room-gallery");
    }

    const roomData = {
      // Basic
      roomType:    d.roomType,
      roomName:    d.roomName,
      description: d.description,
      floorNumber: d.floorNumber,
      roomSize:    d.roomSize,
      viewType:    d.viewType,
      status:      d.status || "available",

      // Pricing
      basePrice:     Number(d.basePrice),
      offerPrice:    d.offerPrice    ? Number(d.offerPrice)    : undefined,
      tax:           d.tax           ? Number(d.tax)           : undefined,
      serviceCharge: d.serviceCharge ? Number(d.serviceCharge) : undefined,

      // Capacity
      totalRooms:     Number(d.totalRooms),
      availableRooms: Number(d.availableRooms),
      maxGuests:      d.maxGuests  ? Number(d.maxGuests)  : undefined,
      adults:         d.adults     ? Number(d.adults)     : undefined,
      children:       d.children   ? Number(d.children)   : undefined,

      // Bed
      bedType:           d.bedType,
      bedCount:          d.bedCount ? Number(d.bedCount) : undefined,
      extraBedAvailable: toBool(d.extraBedAvailable),
      extraBedCharge:    d.extraBedCharge ? Number(d.extraBedCharge) : undefined,

      // Room Features
      balcony:      toBool(d.balcony),
      airCondition: toBool(d.airCondition),
      heater:       toBool(d.heater),
      wifi:         toBool(d.wifi),
      tv:           toBool(d.tv),
      minibar:      toBool(d.minibar),
      wardrobe:     toBool(d.wardrobe),
      workDesk:     toBool(d.workDesk),
      iron:         toBool(d.iron),
      kitchen:      toBool(d.kitchen),

      // Bathroom
      bathroomType: d.bathroomType,
      bathtub:      toBool(d.bathtub),
      shower:       toBool(d.shower),
      toiletries:   toBool(d.toiletries),
      hairDryer:    toBool(d.hairDryer),

      // Meals
      breakfastIncluded: toBool(d.breakfastIncluded),
      lunchIncluded:     toBool(d.lunchIncluded),
      dinnerIncluded:    toBool(d.dinnerIncluded),

      // Policies
      smokingAllowed:     toBool(d.smokingAllowed),
      refundable:         toBool(d.refundable),
      cancellationPolicy: d.cancellationPolicy,

      images,
    };

    const hotel = await Hotel.findOneAndUpdate(
      { _id: req.params.hotelId, vendor: req.vendor._id },
      { $push: { rooms: roomData } },
      { new: true }
    );

    if (!hotel) return res.status(404).json({ message: "Hotel not found" });
    res.json({ success: true, hotel });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ═══════════════════════════════════════════
   UPDATE ROOM
═══════════════════════════════════════════ */
exports.updateRoom = async (req, res) => {
  try {
    const d = req.body;

    const hotel = await Hotel.findOne({ _id: req.params.hotelId, vendor: req.vendor._id });
    if (!hotel) return res.status(404).json({ message: "Hotel not found" });

    const room = hotel.rooms.id(req.params.roomId);
    if (!room) return res.status(404).json({ message: "Room not found" });

    // Append new images
    if (req.files?.roomGallery?.length) {
      const newImgs = await uploadMany(req.files.roomGallery, "hotels/room-gallery");
      room.images.push(...newImgs);
    }

    // String fields
    ["roomType","roomName","description","floorNumber","roomSize","viewType",
     "bedType","bathroomType","cancellationPolicy","status"].forEach((f) => {
      if (d[f] !== undefined) room[f] = d[f];
    });

    // Number fields
    ["basePrice","offerPrice","tax","serviceCharge","totalRooms","availableRooms",
     "maxGuests","adults","children","bedCount","extraBedCharge"].forEach((f) => {
      if (d[f] !== undefined && d[f] !== "") room[f] = Number(d[f]);
    });

    // Boolean fields
    ["extraBedAvailable","balcony","airCondition","heater","wifi","tv","minibar",
     "wardrobe","workDesk","iron","kitchen","bathtub","shower","toiletries",
     "hairDryer","breakfastIncluded","lunchIncluded","dinnerIncluded",
     "smokingAllowed","refundable"].forEach((f) => {
      if (d[f] !== undefined) room[f] = toBool(d[f]);
    });

    await hotel.save();
    res.json({ success: true, hotel });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ═══════════════════════════════════════════
   DELETE ROOM
═══════════════════════════════════════════ */
exports.deleteRoom = async (req, res) => {
  try {
    const hotel = await Hotel.findOneAndUpdate(
      { _id: req.params.hotelId, vendor: req.vendor._id },
      { $pull: { rooms: { _id: req.params.roomId } } },
      { new: true }
    );
    if (!hotel) return res.status(404).json({ message: "Hotel not found" });
    res.json({ success: true, hotel });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ═══════════════════════════════════════════
   DELETE ROOM IMAGE
═══════════════════════════════════════════ */
exports.deleteRoomImage = async (req, res) => {
  try {
    const { hotelId, roomId } = req.params;
    const { imageUrl } = req.body;

    const hotel = await Hotel.findOne({ _id: hotelId, vendor: req.vendor._id });
    if (!hotel) return res.status(404).json({ message: "Hotel not found" });

    const room = hotel.rooms.id(roomId);
    if (!room) return res.status(404).json({ message: "Room not found" });

    room.images = room.images.filter((img) => img !== imageUrl);
    await hotel.save();

    res.json({ success: true, hotel });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ═══════════════════════════════════════════
   DELETE HOTEL IMAGE
═══════════════════════════════════════════ */
exports.deleteHotelImage = async (req, res) => {
  try {
    const { imageUrl } = req.body;

    const hotel = await Hotel.findOneAndUpdate(
      { _id: req.params.id, vendor: req.vendor._id },
      { $pull: { hotelImages: imageUrl } },
      { new: true }
    );
    if (!hotel) return res.status(404).json({ message: "Hotel not found" });
    res.json({ success: true, hotel });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};