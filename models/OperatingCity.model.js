// const mongoose = require("mongoose");

// const operatingCitySchema = new mongoose.Schema(
//   {
//     vendor: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Vendor",
//       required: true,
//     },

//     city: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     state: {
//       type: String,
//       default: "",
//     },

//     country: {
//       type: String,
//       default: "India",
//     },

//     isActive: {
//       type: Boolean,
//       default: true,
//     },
//   },
//   { timestamps: true }
// );

// // prevent duplicate city per vendor
// operatingCitySchema.index({ vendor: 1, city: 1 }, { unique: true });

// module.exports = mongoose.model("OperatingCity", operatingCitySchema);

const mongoose = require("mongoose");

const pointSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Point name is required"],
      trim: true,
    },
    address: {
      type: String,
      default: "",
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { _id: true, timestamps: true }
);

const operatingCitySchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    city: {
      type: String,
      required: [true, "City name is required"],
      trim: true,
    },
    state: {
      type: String,
      default: "",
      trim: true,
    },
    country: {
      type: String,
      default: "India",
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    pickupPoints: {
      type: [pointSchema],
      default: [],
    },
    dropPoints: {
      type: [pointSchema],
      default: [],
    },
  },
  { timestamps: true }
);

operatingCitySchema.index({ vendor: 1, city: 1 }, { unique: true });

module.exports = mongoose.model("OperatingCity", operatingCitySchema);