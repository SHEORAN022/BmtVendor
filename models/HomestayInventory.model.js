const mongoose = require("mongoose");

const schema = new mongoose.Schema(
{
  homestay: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Homestay",
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

  availableRooms: {
    type: Number,
    required: true,
  },

  totalRooms: {
    type: Number,
    required: true,
  },

  isClosed: {
    type: Boolean,
    default: false,
  },
},
{ timestamps: true }
);

// unique per day
schema.index({ homestay: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("HomestayInventory", schema);