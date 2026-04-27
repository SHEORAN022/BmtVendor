const Bnb = require("../models/bnbModel");
const cloudinary = require("../config/cloudinary");
const { handleError } = require("../utils/common");

/* ================= CLOUDINARY UPLOAD ================= */

const uploadToCloudinary = (fileBuffer, folder) => {
  return new Promise((resolve, reject) => {

    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );

    stream.end(fileBuffer);

  });
};


/* ================= ADD PROPERTY ================= */

exports.addBnb = async (req, res) => {
  try {

    const body = req.body;

    if (body.roomTypes) body.roomTypes = JSON.parse(body.roomTypes);
    if (body.amenities) body.amenities = JSON.parse(body.amenities);

    let propertyImages = [];
    let frontImages = [];
    let receptionImages = [];

    /* PROPERTY IMAGES */

    if (req.files?.propertyImages) {

      for (const file of req.files.propertyImages) {

        const url = await uploadToCloudinary(
          file.buffer,
          "bnb/property"
        );

        propertyImages.push(url);
      }

    }

    /* FRONT IMAGES */

    if (req.files?.frontImages) {

      for (const file of req.files.frontImages) {

        const url = await uploadToCloudinary(
          file.buffer,
          "bnb/front"
        );

        frontImages.push(url);
      }

    }

    /* RECEPTION IMAGES */

    if (req.files?.receptionImages) {

      for (const file of req.files.receptionImages) {

        const url = await uploadToCloudinary(
          file.buffer,
          "bnb/reception"
        );

        receptionImages.push(url);
      }

    }

    const property = new Bnb({
      ...body,
      propertyImages,
      frontImages,
      receptionImages
    });

    await property.save();

    res.status(201).json({
      success: true,
      message: "Bnb property created successfully",
      data: property
    });

  } catch (error) {

    //    let message = "Server error";
    //    console.log(error?.errors,'get all ');

    // if (error.errors) {
    //   console.log(error.errors,'get all errors ')
    //   // Mongoose validation errors
    //   const firstErrorKey = Object.keys(error.errors)[0];
    //   message = error.errors[firstErrorKey].message;
    // } else if (error.message) {
    //   message = error.message;
    // }

    // res.status(500).json({
    //   success: false,
    //   message
    // });


     handleError(res, error);

  }
};



/* ================= GET ALL ================= */

exports.getAllBnb = async (req, res) => {
  try {

    const { city, featured, approved } = req.query;

    let filter = {};

    if (city) filter.city = city;
    if (featured) filter.isFeatured = featured === "true";
    if (approved) filter.isApproved = approved === "true";

    const properties = await Bnb
      .find(filter)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: properties.length,
      data: properties
    });

  } catch (error) {

    console.error("Get Bnb Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }
};



/* ================= GET SINGLE ================= */

exports.getSingleBnb = async (req, res) => {
  try {

    const property = await Bnb.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found"
      });
    }

    res.json({
      success: true,
      data: property
    });

  } catch (error) {

    console.error("Get Single Bnb Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }
};



/* ================= UPDATE PROPERTY ================= */

exports.updateBnb = async (req, res) => {
  try {

    const property = await Bnb.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found"
      });
    }

    let updateData = { ...req.body };

    /* PROPERTY IMAGES */

    if (req.files?.propertyImages) {

      let images = [];

      for (const file of req.files.propertyImages) {

        const url = await uploadToCloudinary(
          file.buffer,
          "bnb/property"
        );

        images.push(url);
      }

      updateData.propertyImages = images;

    }

    /* FRONT IMAGES */

    if (req.files?.frontImages) {

      let images = [];

      for (const file of req.files.frontImages) {

        const url = await uploadToCloudinary(
          file.buffer,
          "bnb/front"
        );

        images.push(url);
      }

      updateData.frontImages = images;

    }

    /* RECEPTION IMAGES */

    if (req.files?.receptionImages) {

      let images = [];

      for (const file of req.files.receptionImages) {

        const url = await uploadToCloudinary(
          file.buffer,
          "bnb/reception"
        );

        images.push(url);
      }

      updateData.receptionImages = images;

    }

    const updatedProperty = await Bnb.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json({
      success: true,
      message: "Property updated successfully",
      data: updatedProperty
    });

  } catch (error) {

    console.error("Update Bnb Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }
};



/* ================= DELETE PROPERTY ================= */

exports.deleteBnb = async (req, res) => {
  try {

    const property = await Bnb.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found"
      });
    }

    await property.deleteOne();

    res.json({
      success: true,
      message: "Property deleted successfully"
    });

  } catch (error) {

    console.error("Delete Bnb Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }
};



/* ================= APPROVE PROPERTY ================= */

exports.approveProperty = async (req, res) => {
  try {

    const property = await Bnb.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    );

    res.json({
      success: true,
      message: "Property approved",
      data: property
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }
};



/* ================= FEATURE PROPERTY ================= */

exports.featureProperty = async (req, res) => {
  try {

    const property = await Bnb.findByIdAndUpdate(
      req.params.id,
      { isFeatured: true },
      { new: true }
    );

    res.json({
      success: true,
      message: "Property marked as featured",
      data: property
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }
};