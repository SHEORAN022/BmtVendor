const Vendor = require("../models/Vendor.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

/* =========================
        SIGNUP
========================= */

exports.signup = async (req, res) => {
  try {

    const { name, email, password, service } = req.body;

    // validation
    if (!name || !email || !password || !service) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    // check vendor exists
    const existingVendor = await Vendor.findOne({ email });

    if (existingVendor) {
      return res.status(400).json({
        success: false,
        message: "Vendor already exists"
      });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create vendor
    const vendor = await Vendor.create({
      name,
      email,
      password: hashedPassword,
      service
    });

    res.status(201).json({
      success: true,
      message: "Signup successful",
      vendor: {
        id: vendor._id,
        name: vendor.name,
        email: vendor.email,
        service: vendor.service
      }
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};



/* =========================
        LOGIN
========================= */

exports.login = async (req, res) => {

  try {

    const { email, password } = req.body;

    // validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password required"
      });
    }

    // find vendor
    const vendor = await Vendor.findOne({ email });

    if (!vendor) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // compare password
    const isMatch = await bcrypt.compare(password, vendor.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // generate token
    const token = jwt.sign(
      { id: vendor._id, service: vendor.service },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      vendor: {
        id: vendor._id,
        name: vendor.name,
        email: vendor.email,
        service: vendor.service
      }
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};