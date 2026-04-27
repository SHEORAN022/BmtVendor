const VacationHouse = require("../models/vacationHouseModel");
const uploadToCloudinary = require("../utils/uploadToCloudinary");

/* =========================================================
   ADD VACATION HOUSE
========================================================= */

exports.addVacationHouse = async (req, res) => {

  try {

    const body = req.body;
    const files = req.files || [];

    /* ===== IMAGE ARRAYS ===== */

    const frontView = [];
    const bedRoom = [];
    const kitchen = [];
    const washroom = [];

    const propertyDocument = [];
    const ownerIdProof = [];
    const addressProof = [];
    const govtLicense = [];

    /* ===== UPLOAD FILES ===== */

    for (const file of files) {

      const url = await uploadToCloudinary(
        file.buffer,
        "vacation-houses"
      );

      if (file.fieldname === "frontView") frontView.push(url);

      if (file.fieldname === "bedRoom") bedRoom.push(url);

      if (file.fieldname === "kitchen") kitchen.push(url);

      if (file.fieldname === "washroom") washroom.push(url);

      if (file.fieldname === "propertyDocument") propertyDocument.push(url);

      if (file.fieldname === "ownerIdProof") ownerIdProof.push(url);

      if (file.fieldname === "addressProof") addressProof.push(url);

      if (file.fieldname === "govtLicense") govtLicense.push(url);
    }

    /* ===== CREATE HOUSE ===== */

    const house = await VacationHouse.create({

      propertyName: body.propertyName,
      description: body.description,
      shortDescription: body.shortDescription,
      starRating: body.starRating,

      address: {
        street: body.street,
        city: body.city,
        state: body.state,
        pincode: body.pincode,
        latitude: body.latitude,
        longitude: body.longitude
      },

      owner: {
        ownerName: body.ownerName,
        phone: body.phone,
        alternatePhone: body.alternatePhone,
        email: body.email
      },

      pricing: {
        basePrice: body.basePrice,
        weekendPrice: body.weekendPrice,
        monthlyPrice: body.monthlyPrice,
        cleaningFee: body.cleaningFee,
        securityDeposit: body.securityDeposit
      },

      checkInTime: body.checkInTime,
      checkOutTime: body.checkOutTime,

      petsAllowed: body.petsAllowed,
      smokingAllowed: body.smokingAllowed,

      cancellationPolicy: body.cancellationPolicy,
      houseRules: body.houseRules,

      images: {
        frontView,
        bedRoom,
        kitchen,
        washroom
      },

      documents: {
        propertyDocument,
        ownerIdProof,
        addressProof,
        govtLicense
      },

      vendorId: req.vendor._id

    });

    res.status(201).json({
      success: true,
      message: "Vacation house added successfully",
      data: house
    });

  } catch (error) {

    console.error("Add Vacation House Error:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};


/* =========================================================
   GET ALL HOUSES OF VENDOR
========================================================= */

exports.getVendorVacationHouses = async (req, res) => {

  try {

    const houses = await VacationHouse.find({
      vendorId: req.vendor._id
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: houses.length,
      data: houses
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};


/* =========================================================
   GET SINGLE HOUSE
========================================================= */

exports.getSingleVacationHouse = async (req, res) => {

  try {

    const house = await VacationHouse.findById(req.params.id);

    if (!house) {
      return res.status(404).json({
        success: false,
        message: "Vacation house not found"
      });
    }

    res.json({
      success: true,
      data: house
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};


/* =========================================================
   UPDATE VACATION HOUSE
========================================================= */

exports.updateVacationHouse = async (req, res) => {

  try {

    const house = await VacationHouse.findById(req.params.id);

    if (!house) {
      return res.status(404).json({
        success: false,
        message: "House not found"
      });
    }

    const body = req.body;

    house.propertyName = body.propertyName || house.propertyName;
    house.description = body.description || house.description;
    house.shortDescription = body.shortDescription || house.shortDescription;
    house.starRating = body.starRating || house.starRating;

    house.checkInTime = body.checkInTime || house.checkInTime;
    house.checkOutTime = body.checkOutTime || house.checkOutTime;

    house.petsAllowed = body.petsAllowed ?? house.petsAllowed;
    house.smokingAllowed = body.smokingAllowed ?? house.smokingAllowed;

    house.cancellationPolicy = body.cancellationPolicy || house.cancellationPolicy;
    house.houseRules = body.houseRules || house.houseRules;

    await house.save();

    res.json({
      success: true,
      message: "Vacation house updated",
      data: house
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};


/* =========================================================
   DELETE VACATION HOUSE
========================================================= */

exports.deleteVacationHouse = async (req, res) => {

  try {

    const house = await VacationHouse.findById(req.params.id);

    if (!house) {
      return res.status(404).json({
        success: false,
        message: "House not found"
      });
    }

    await house.deleteOne();

    res.json({
      success: true,
      message: "Vacation house deleted"
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};