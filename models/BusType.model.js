const mongoose = require("mongoose");

const seatSchema = new mongoose.Schema({
  seatNo:  { type: String, required: false, trim: true, default: "" },
  row:     { type: Number, required: true, min: 0 },
  col:     { type: Number, required: true, min: 0 },
  type:    { type: String, enum: ["seat", "sleeper", "driver"], default: "seat" },
  deck:    { type: String, enum: ["lower", "upper"], default: "lower" },
});

const busTypeSchema = new mongoose.Schema(
  {
    vendor:      { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
    name:        { type: String, required: [true, "Bus name is required"], trim: true },
    vehicleMake: { type: String, trim: true, default: "" },
    seatingType: { type: String, enum: ["2+2", "2+1", "1+1", "3+2"], default: "2+2" },
    isAC:        { type: Boolean, default: false },
    lowerDeck:   { type: [seatSchema], default: [] },
    upperDeck:   { type: [seatSchema], default: [] },
    totalSeats:  { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ✅ FIXED: async use karo — next() ki zaroorat nahi Mongoose v6+ mein
busTypeSchema.pre("save", async function () {
  this.totalSeats = this.lowerDeck.length + this.upperDeck.length;
});

module.exports = mongoose.model("BusType", busTypeSchema);