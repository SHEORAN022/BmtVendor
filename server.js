

require("dotenv").config();


const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const compression = require("compression");

const connectDB = require("./config/db");


const palaceRoutes = require("./routes/palaceRoutes");
const vacationHouseRoutes = require("./routes/vacationHouseRoutes");
const motelVendorRoutes = require("./routes/motelVendorRoutes");
const inventoryRoutes = require("./routes/inventory.routes");
const propertyRoutes = require("./routes/property.routes");
const promoRoutes = require("./routes/promotion.routes");
const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);
app.use(compression());
app.use(morgan("dev"));


app.use(
  cors({
    origin: [
      "http://localhost:3000",
       "http://localhost:3001",
      "http://localhost:7000",
    ],
    credentials: true,
  })
);


app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));


connectDB();
app.use("/api/vendor/auth", require("./routes/auth.routes"));


app.use("/api/vendor/hotels", require("./routes/hotel.routes"));
app.use("/api/hotel-bookings", require("./routes/hotelBooking.routes"));
app.use("/api/inventory", inventoryRoutes);
app.use("/api/reviews", require("./routes/Review.routes"));
app.use("/api/property", propertyRoutes);
app.use("/api/promotions", promoRoutes);
app.use("/api/sponsored", require("./routes/sponsored.routes"));
// CABS
app.use("/api/vendor/cabs", require("./routes/cab.routes"));
app.use("/api/cabs", require("./routes/cabBooking.routes"));
app.use("/api/vendor/cabs-booking", require("./routes/vendorCabBooking.routes")); 

// BUS
app.use("/api/buses", require("./routes/bus.routes"));
app.use("/api/bus-bookings", require("./routes/busBooking.routes"));
app.use("/api/operating-cities", require("./routes/operatingCity.routes"));
app.use("/api/bus-types", require("./routes/busType.routes"));

// FLIGHT
app.use("/api/flights", require("./routes/flight.routes"));
app.use("/api/flight-bookings", require("./routes/flightBooking.routes"));

// HOMESTAY
app.use("/api/vendor/homestay", require("./routes/homestay.routes"));
app.use("/api/homestay-bookings", require("./routes/homestayBooking.routes"));
app.use("/api/homestay-inventory", require("./routes/homestayInventory.routes"));
app.use("/api/homestay-reviews", require("./routes/homestayReview.routes"));
app.use("/api/vendor/homestay-property", require("./routes/homestayProperty.routes"));
app.use("/api/homestay-promotions", require("./routes/homestayPromotion.routes"));
app.use("/api/vacation-house-inventory", require("./routes/vacationHouseInventory.routes"));
// HOLIDAY
app.use("/api/vendor/holidays", require("./routes/holiday.routes"));
app.use("/api/vendor/bnb", require("./routes/bnbRoutes"));
app.use("/api/holiday-bookings", require("./routes/holidayBooking.routes"));

// DARSHAN + APARTMENT
app.use("/api/vendor/darshans", require("./routes/vendorDarshanRoutes"));
app.use("/api/vendor/apartment", require("./routes/Apartment.routes"));

// CUSTOM
app.use("/api/vacation-house", vacationHouseRoutes);
app.use("/api/palaces", palaceRoutes);
app.use("/api/motel-vendors", motelVendorRoutes);
const campsiteRoutes = require("./routes/vendorCampsite.routes");

app.use("/api/vendor/campsite", campsiteRoutes);
/* ==============================
   ❤️ HEALTH CHECK
============================== */
app.get("/", (req, res) => {
  res.send("🚀 Vendor Backend Running Successfully");
});

/* ==============================
   ❌ API 404 HANDLER (FIXED)
============================== */
app.use("/api", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

/* ==============================
   ❌ GLOBAL 404
============================== */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

/* ==============================
   🔥 ERROR HANDLER
============================== */
app.use((err, req, res, next) => {
  console.error("🔥 Error:", err.message);

  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

/* ==============================
   🟢 START SERVER
============================== */
const PORT = process.env.PORT || 7000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
