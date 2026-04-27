const mongoose = require("mongoose");

const schema = new mongoose.Schema(
{
  vacationHouse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "VacationHouse",
    required: true,
  },

  date: {
    type: Date,
    required: true,
  },

  price: {
    type: Number,
    required: true,
  },

  available: {
    type: Boolean,
    default: true,
  },

  totalRooms: {
    type: Number,
    default: 1,
  },

  availableRooms: {
    type: Number,
    default: 1,
  },

  isClosed: {
    type: Boolean,
    default: false,
  },
},
{ timestamps: true }
);

// unique per day
schema.index({ vacationHouse: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("VacationHouseInventory", schema);