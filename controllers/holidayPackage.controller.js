const HolidayPackage = require("../models/HolidayPackage.model");
const cloudinary = require("../config/cloudinary");

/* ================= CREATE ================= */
exports.createHoliday = async (req, res) => {
  try {
    let bannerImage = "";
    const galleryImages = [];

    if (req.files?.banner) {
      const r = await cloudinary.uploader.upload(
        req.files.banner[0].path
      );
      bannerImage = r.secure_url;
    }

    if (req.files?.gallery) {
      for (let file of req.files.gallery) {
        const r = await cloudinary.uploader.upload(file.path);
        galleryImages.push(r.secure_url);
      }
    }

    const holiday = await HolidayPackage.create({
      vendor: req.vendor._id,
      title: req.body.title,
      destination: req.body.destination,
      country: req.body.country,
      duration: req.body.duration,
      packageType: req.body.packageType,
      category: req.body.category,
      overview: req.body.overview,
      pricing: JSON.parse(req.body.pricing || "{}"),
      validFrom: req.body.validFrom,
      validTill: req.body.validTill,
      bannerImage,
      galleryImages,
    });

    res.status(201).json({ success: true, data: holiday });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ================= READ ================= */
exports.getVendorHolidays = async (req, res) => {
  const data = await HolidayPackage.find({ vendor: req.vendor._id }).sort({
    createdAt: -1,
  });
  res.json({ success: true, data });
};

/* ================= UPDATE ================= */
exports.updateHoliday = async (req, res) => {
  try {
    const holiday = await HolidayPackage.findOne({
      _id: req.params.id,
      vendor: req.vendor._id,
    });

    if (!holiday) {
      return res.status(404).json({
        success: false,
        message: "Holiday not found",
      });
    }

    if (req.files?.banner) {
      const r = await cloudinary.uploader.upload(
        req.files.banner[0].path
      );
      holiday.bannerImage = r.secure_url;
    }

    if (req.files?.gallery) {
      for (let file of req.files.gallery) {
        const r = await cloudinary.uploader.upload(file.path);
        holiday.galleryImages.push(r.secure_url);
      }
    }

    holiday.title = req.body.title;
    holiday.destination = req.body.destination;
    holiday.country = req.body.country;
    holiday.duration = req.body.duration;
    holiday.packageType = req.body.packageType;
    holiday.category = req.body.category;
    holiday.overview = req.body.overview;
    holiday.pricing = JSON.parse(req.body.pricing || "{}");
    holiday.validFrom = req.body.validFrom;
    holiday.validTill = req.body.validTill;

    await holiday.save();

    res.json({ success: true, data: holiday });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ================= DELETE ================= */
exports.deleteHoliday = async (req, res) => {
  await HolidayPackage.findOneAndDelete({
    _id: req.params.id,
    vendor: req.vendor._id,
  });
  res.json({ success: true, message: "Holiday deleted" });
};
