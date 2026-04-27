const MotelVendor = require("../models/motelVendorModel");
const uploadToCloudinary = require("../utils/uploadToCloudinary");

/* ================= ADD MOTEL VENDOR ================= */

exports.addMotelVendor = async (req, res) => {
  try {

    const data = req.body;

    let profileImage = "";
    let gstImage = "";
    let panImage = "";
    let aadhaarImage = "";

    if (req.files?.profileImage) {
      profileImage = await uploadToCloudinary(
        req.files.profileImage[0].buffer,
        "motel/profile"
      );
    }

    if (req.files?.gstImage) {
      gstImage = await uploadToCloudinary(
        req.files.gstImage[0].buffer,
        "motel/documents"
      );
    }

    if (req.files?.panImage) {
      panImage = await uploadToCloudinary(
        req.files.panImage[0].buffer,
        "motel/documents"
      );
    }

    if (req.files?.aadhaarImage) {
      aadhaarImage = await uploadToCloudinary(
        req.files.aadhaarImage[0].buffer,
        "motel/documents"
      );
    }

    const vendor = new MotelVendor({
      ...data,
      profileImage,
      gstImage,
      panImage,
      aadhaarImage
    });

    await vendor.save();

    res.status(201).json({
      success: true,
      message: "Motel Vendor Added Successfully",
      data: vendor
    });

  } catch (error) {

    console.log("Add Motel Vendor Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};


/* ================= GET ALL VENDORS ================= */

exports.getAllMotelVendors = async (req, res) => {
  try {

    const vendors = await MotelVendor.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: vendors.length,
      data: vendors
    });

  } catch (error) {

    console.log("Get Vendors Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};


/* ================= GET VENDOR BY ID ================= */

exports.getMotelVendorById = async (req, res) => {
  try {

    const vendor = await MotelVendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found"
      });
    }

    res.status(200).json({
      success: true,
      data: vendor
    });

  } catch (error) {

    console.log("Get Vendor Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};


/* ================= UPDATE VENDOR ================= */

exports.updateMotelVendor = async (req, res) => {

  try {

    const data = req.body;

    let updateData = { ...data };

    if (req.files?.profileImage) {
      updateData.profileImage = await uploadToCloudinary(
        req.files.profileImage[0].buffer,
        "motel/profile"
      );
    }

    if (req.files?.gstImage) {
      updateData.gstImage = await uploadToCloudinary(
        req.files.gstImage[0].buffer,
        "motel/documents"
      );
    }

    if (req.files?.panImage) {
      updateData.panImage = await uploadToCloudinary(
        req.files.panImage[0].buffer,
        "motel/documents"
      );
    }

    if (req.files?.aadhaarImage) {
      updateData.aadhaarImage = await uploadToCloudinary(
        req.files.aadhaarImage[0].buffer,
        "motel/documents"
      );
    }

    const vendor = await MotelVendor.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Vendor Updated Successfully",
      data: vendor
    });

  } catch (error) {

    console.log("Update Vendor Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};


/* ================= DELETE VENDOR ================= */

exports.deleteMotelVendor = async (req, res) => {

  try {

    const vendor = await MotelVendor.findByIdAndDelete(req.params.id);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Vendor Deleted Successfully"
    });

  } catch (error) {

    console.log("Delete Vendor Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};