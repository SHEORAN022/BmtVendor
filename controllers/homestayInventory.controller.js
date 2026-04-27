// const Inventory = require("../models/HomestayInventory.model");
// const Homestay = require("../models/Homestay.model");

// /* ================= HELPER ================= */
// const getDatesBetween = (start, end) => {
//   const dates = [];
//   const cur = new Date(start);
//   const last = new Date(end);

//   while (cur <= last) {
//     dates.push(new Date(cur));
//     cur.setDate(cur.getDate() + 1);
//   }

//   return dates;
// };

// /* =================================================
//    GET INVENTORY
// ================================================= */
// exports.getInventory = async (req, res) => {
//   try {
//     const { homestayId, startDate, endDate } = req.query;

//     if (!homestayId || !startDate || !endDate) {
//       return res.status(400).json({
//         message: "homestayId, startDate, endDate required",
//       });
//     }

//     const data = await Inventory.find({
//       homestay: homestayId,
//       date: {
//         $gte: new Date(startDate),
//         $lte: new Date(endDate),
//       },
//     }).sort({ date: 1 });

//     res.json({ success: true, data });

//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// /* =================================================
//    BULK UPDATE
// ================================================= */
// exports.updateInventory = async (req, res) => {
//   try {
//     const {
//       homestayId,
//       startDate,
//       endDate,
//       price,
//       availableRooms,
//       isClosed,
//     } = req.body;

//     if (!homestayId || !startDate || !endDate) {
//       return res.status(400).json({ message: "Missing fields" });
//     }

//     const homestay = await Homestay.findById(homestayId);

//     if (!homestay) {
//       return res.status(404).json({ message: "Homestay not found" });
//     }

//     const totalRooms = homestay.bedrooms || 1;
//     const basePrice = homestay.pricing?.basePrice || 1000;

//     const dates = getDatesBetween(startDate, endDate);

//     const bulkOps = dates.map((date) => {
//       const setFields = {};

//       if (price !== undefined) setFields.price = Number(price);
//       if (availableRooms !== undefined)
//         setFields.availableRooms = Number(availableRooms);
//       if (isClosed !== undefined)
//         setFields.isClosed = Boolean(isClosed);

//       const setOnInsert = {
//         homestay: homestayId,
//         date,
//         totalRooms,
//       };

//       if (price === undefined) setOnInsert.price = basePrice;
//       if (availableRooms === undefined)
//         setOnInsert.availableRooms = totalRooms;
//       if (isClosed === undefined) setOnInsert.isClosed = false;

//       return {
//         updateOne: {
//           filter: { homestay: homestayId, date },
//           update: {
//             $setOnInsert: setOnInsert,
//             ...(Object.keys(setFields).length && { $set: setFields }),
//           },
//           upsert: true,
//         },
//       };
//     });

//     await Inventory.bulkWrite(bulkOps);

//     res.json({
//       success: true,
//       message: `Updated ${dates.length} days`,
//     });

//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// /* =================================================
//    SINGLE DATE UPDATE
// ================================================= */
// exports.updateSingleDate = async (req, res) => {
//   try {
//     const { homestayId, date, price, availableRooms, isClosed } = req.body;

//     if (!homestayId || !date) {
//       return res.status(400).json({ message: "Missing fields" });
//     }

//     const homestay = await Homestay.findById(homestayId);

//     if (!homestay) {
//       return res.status(404).json({ message: "Not found" });
//     }

//     const data = await Inventory.findOneAndUpdate(
//       { homestay: homestayId, date: new Date(date) },
//       {
//         $set: {
//           ...(price !== undefined && { price }),
//           ...(availableRooms !== undefined && { availableRooms }),
//           ...(isClosed !== undefined && { isClosed }),
//         },
//         $setOnInsert: {
//           homestay: homestayId,
//           date: new Date(date),
//           totalRooms: homestay.bedrooms || 1,
//           price: homestay.pricing?.basePrice || 1000,
//           availableRooms: homestay.bedrooms || 1,
//           isClosed: false,
//         },
//       },
//       { new: true, upsert: true }
//     );

//     res.json({ success: true, data });

//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// /* =================================================
//    INIT INVENTORY (VERY IMPORTANT)
// ================================================= */
// exports.initInventory = async (req, res) => {
//   try {
//     const { homestayId, days = 90 } = req.body;

//     const homestay = await Homestay.findById(homestayId);

//     if (!homestay) {
//       return res.status(404).json({ message: "Not found" });
//     }

//     const start = new Date();
//     start.setHours(0, 0, 0, 0);

//     const end = new Date(start);
//     end.setDate(end.getDate() + days - 1);

//     const dates = getDatesBetween(start, end);

//     const bulkOps = dates.map((date) => ({
//       updateOne: {
//         filter: { homestay: homestayId, date },
//         update: {
//           $setOnInsert: {
//             homestay: homestayId,
//             date,
//             price: homestay.pricing?.basePrice || 1000,
//             availableRooms: homestay.bedrooms || 1,
//             totalRooms: homestay.bedrooms || 1,
//             isClosed: false,
//           },
//         },
//         upsert: true,
//       },
//     }));

//     const result = await Inventory.bulkWrite(bulkOps);

//     res.json({
//       success: true,
//       message: `Initialized ${result.upsertedCount} days`,
//     });

//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

const Inventory = require("../models/HomestayInventory.model");
const Homestay  = require("../models/Homestay.model");

/* ═══════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════ */

/** Zero out time component so date comparisons are always UTC-day safe */
const normalizeDate = (d) => {
  const date = new Date(d);
  date.setUTCHours(0, 0, 0, 0);
  return date;
};

/** Return an array of Date objects for every day from start → end (inclusive) */
const getDatesBetween = (start, end) => {
  const dates = [];
  let   cur   = normalizeDate(start);
  const last  = normalizeDate(end);

  while (cur <= last) {
    dates.push(new Date(cur));
    cur = new Date(cur);                          // new object — don't mutate
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return dates;
};

/* ═══════════════════════════════════════════════
   GET  /api/homestay-inventory
   Query: homestayId, startDate, endDate
═══════════════════════════════════════════════ */
exports.getInventory = async (req, res) => {
  try {
    const { homestayId, startDate, endDate } = req.query;

    if (!homestayId || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "homestayId, startDate and endDate are required",
      });
    }

    const data = await Inventory.find({
      homestay: homestayId,
      date: {
        $gte: normalizeDate(startDate),
        $lte: normalizeDate(endDate),
      },
    }).sort({ date: 1 });

    return res.json({ success: true, data });
  } catch (err) {
    console.error("GET INVENTORY ERROR:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/* ═══════════════════════════════════════════════
   POST  /api/homestay-inventory/single
   Body: { homestayId, date, price?, availableRooms?, isClosed? }

   ✅ Uses find → save/create pattern.
      Never mixes $set + $setOnInsert (avoids error-40).
═══════════════════════════════════════════════ */
exports.updateSingleDate = async (req, res) => {
  try {
    const { homestayId, date, price, availableRooms, isClosed } = req.body;

    /* ── validation ── */
    if (!homestayId || !date) {
      return res.status(400).json({
        success: false,
        message: "homestayId and date are required",
      });
    }

    if (price === undefined && availableRooms === undefined && isClosed === undefined) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one field: price, availableRooms, isClosed",
      });
    }

    const homestay = await Homestay.findById(homestayId);
    if (!homestay) {
      return res.status(404).json({ success: false, message: "Homestay not found" });
    }

    const totalRooms     = homestay.bedrooms           || 1;
    const basePrice      = homestay.pricing?.basePrice || 1000;
    const normalizedDate = normalizeDate(date);

    if (availableRooms !== undefined && Number(availableRooms) > totalRooms) {
      return res.status(400).json({
        success: false,
        message: `availableRooms (${availableRooms}) cannot exceed totalRooms (${totalRooms})`,
      });
    }

    /* ── find existing → patch, else create ── */
    let doc = await Inventory.findOne({ homestay: homestayId, date: normalizedDate });

    if (doc) {
      if (price          !== undefined) doc.price          = Number(price);
      if (availableRooms !== undefined) doc.availableRooms = Number(availableRooms);
      if (isClosed       !== undefined) doc.isClosed       = Boolean(isClosed);
      await doc.save();
    } else {
      doc = await Inventory.create({
        homestay:       homestayId,
        date:           normalizedDate,
        totalRooms,
        price:          price          !== undefined ? Number(price)          : basePrice,
        availableRooms: availableRooms !== undefined ? Number(availableRooms) : totalRooms,
        isClosed:       isClosed       !== undefined ? Boolean(isClosed)      : false,
      });
    }

    return res.json({ success: true, message: "Date updated successfully", data: doc });
  } catch (err) {
    console.error("SINGLE UPDATE ERROR:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/* ═══════════════════════════════════════════════
   POST  /api/homestay-inventory/bulk
   Body: {
     homestayId,
     dates: ["2026-04-21", "2026-04-23", ...],   ← explicit date list (preferred)
     startDate?, endDate?,                         ← OR range (fallback)
     price?, availableRooms?, isClosed?
   }

   Strategy (no upsert, no operator conflict):
     1. updateMany  → update all existing docs
     2. find        → detect which dates are still missing
     3. insertMany  → create missing docs with defaults
═══════════════════════════════════════════════ */
exports.updateInventory = async (req, res) => {
  try {
    const { homestayId, dates: rawDates, startDate, endDate,
            price, availableRooms, isClosed } = req.body;

    /* ── validation ── */
    if (!homestayId) {
      return res.status(400).json({ success: false, message: "homestayId is required" });
    }

    // Accept either an explicit dates array OR a startDate/endDate range
    let allDates = [];
    if (Array.isArray(rawDates) && rawDates.length > 0) {
      allDates = rawDates.map(normalizeDate);
    } else if (startDate && endDate) {
      allDates = getDatesBetween(startDate, endDate).map(normalizeDate);
    } else {
      return res.status(400).json({
        success: false,
        message: "Provide either a 'dates' array or 'startDate' + 'endDate'",
      });
    }

    if (price === undefined && availableRooms === undefined && isClosed === undefined) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one field to update: price, availableRooms, isClosed",
      });
    }

    const homestay = await Homestay.findById(homestayId);
    if (!homestay) {
      return res.status(404).json({ success: false, message: "Homestay not found" });
    }

    const totalRooms = homestay.bedrooms           || 1;
    const basePrice  = homestay.pricing?.basePrice || 1000;

    if (availableRooms !== undefined && Number(availableRooms) > totalRooms) {
      return res.status(400).json({
        success: false,
        message: `availableRooms (${availableRooms}) cannot exceed totalRooms (${totalRooms})`,
      });
    }

    /* ── 1. Build $set payload ── */
    const setFields = {};
    if (price          !== undefined) setFields.price          = Number(price);
    if (availableRooms !== undefined) setFields.availableRooms = Number(availableRooms);
    if (isClosed       !== undefined) setFields.isClosed       = Boolean(isClosed);

    /* ── 2. Update existing docs (pure $set, no upsert) ── */
    const updateResult = await Inventory.updateMany(
      { homestay: homestayId, date: { $in: allDates } },
      { $set: setFields }
    );

    /* ── 3. Find which dates are still missing ── */
    const existing = await Inventory.find(
      { homestay: homestayId, date: { $in: allDates } },
      { date: 1 }
    ).lean();

    const existingISOSet = new Set(
      existing.map((d) => normalizeDate(d.date).toISOString())
    );
    const missingDates = allDates.filter(
      (d) => !existingISOSet.has(d.toISOString())
    );

    /* ── 4. Insert missing dates ── */
    let insertedCount = 0;
    if (missingDates.length > 0) {
      const newDocs = missingDates.map((d) => ({
        homestay:       homestayId,
        date:           d,
        totalRooms,
        price:          price          !== undefined ? Number(price)          : basePrice,
        availableRooms: availableRooms !== undefined ? Number(availableRooms) : totalRooms,
        isClosed:       isClosed       !== undefined ? Boolean(isClosed)      : false,
      }));
      const inserted = await Inventory.insertMany(newDocs, { ordered: false });
      insertedCount  = inserted.length;
    }

    return res.json({
      success:  true,
      message:  `Bulk update done for ${allDates.length} date(s)`,
      updated:  updateResult.modifiedCount,
      inserted: insertedCount,
    });
  } catch (err) {
    console.error("BULK UPDATE ERROR:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/* ═══════════════════════════════════════════════
   POST  /api/homestay-inventory/init
   Body: { homestayId, days? }

   Only inserts missing dates — never overwrites
   existing inventory records.
═══════════════════════════════════════════════ */
exports.initInventory = async (req, res) => {
  try {
    const { homestayId, days = 90 } = req.body;

    if (!homestayId) {
      return res.status(400).json({ success: false, message: "homestayId is required" });
    }

    const homestay = await Homestay.findById(homestayId);
    if (!homestay) {
      return res.status(404).json({ success: false, message: "Homestay not found" });
    }

    const totalRooms = homestay.bedrooms           || 1;
    const basePrice  = homestay.pricing?.basePrice || 1000;

    const start = normalizeDate(new Date());
    const end   = new Date(start);
    end.setUTCDate(end.getUTCDate() + Number(days) - 1);

    const allDates = getDatesBetween(start, end).map(normalizeDate);

    /* find already-existing dates */
    const existing = await Inventory.find(
      { homestay: homestayId, date: { $in: allDates } },
      { date: 1 }
    ).lean();

    const existingISOSet = new Set(
      existing.map((d) => normalizeDate(d.date).toISOString())
    );
    const missingDates = allDates.filter(
      (d) => !existingISOSet.has(d.toISOString())
    );

    let insertedCount = 0;
    if (missingDates.length > 0) {
      const newDocs = missingDates.map((d) => ({
        homestay:       homestayId,
        date:           d,
        totalRooms,
        price:          basePrice,
        availableRooms: totalRooms,
        isClosed:       false,
      }));
      const result  = await Inventory.insertMany(newDocs, { ordered: false });
      insertedCount = result.length;
    }

    return res.json({
      success:  true,
      message:  `Inventory initialized for ${days} day(s)`,
      inserted: insertedCount,
      skipped:  existing.length,
    });
  } catch (err) {
    console.error("INIT ERROR:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};