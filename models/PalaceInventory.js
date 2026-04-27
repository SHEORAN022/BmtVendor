const mongoose = require("mongoose");

const schema = new mongoose.Schema(
{
  palace: { type: mongoose.Schema.Types.ObjectId, ref: "Palace", required: true },
  room:   { type: mongoose.Schema.Types.ObjectId, required: true },

  date: { type: Date, required: true },

  price: { type: Number, required: true },

  availableRooms: { type: Number, required: true },
  totalRooms:     { type: Number, required: true },

  isClosed: { type: Boolean, default: false }
},
{ timestamps: true }
);

schema.index({ palace: 1, room: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("PalaceInventory", schema);