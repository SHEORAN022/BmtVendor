const Inventory = require("../models/VacationHouseInventory.model");
const VacationHouse = require("../models/VacationHouseModel");

function getDatesBetween(start, end) {
  const dates = [];
  const cur = new Date(start);
  const last = new Date(end);
  cur.setHours(0, 0, 0, 0);
  last.setHours(0, 0, 0, 0);
  while (cur <= last) {
    dates.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

/* ─── GET INVENTORY (date range) ─── */
exports.getInventory = async (req, res) => {
  try {
    const { vacationHouseId, startDate, endDate } = req.query;

    if (!vacationHouseId || !startDate || !endDate)
      return res.status(400).json({ message: "vacationHouseId, startDate, endDate required" });

    // ✅ FIX: Browser 304 cache rokne ke liye — har baar fresh data aayega
    res.setHeader("Cache-Control", "no-store");

    const data = await Inventory.find({
      vacationHouse: vacationHouseId,
      date: { $gte: new Date(startDate), $lte: new Date(endDate) },
    }).sort({ date: 1 });

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ─── INIT INVENTORY (next N days, skip existing) ─── */
exports.initInventory = async (req, res) => {
  try {
    const { vacationHouseId, days = 90 } = req.body;

    const house = await VacationHouse.findById(vacationHouseId);
    if (!house) return res.status(404).json({ message: "Vacation house not found" });

    const basePrice = house.pricing?.basePrice || 0;

    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + days - 1);

    const dates = getDatesBetween(startDate, endDate);

    const bulkOps = dates.map((date) => ({
      updateOne: {
        filter: { vacationHouse: vacationHouseId, date },
        update: {
          $setOnInsert: {
            vacationHouse: vacationHouseId,
            date,
            price: basePrice,
            totalRooms: 1,
            availableRooms: 1,
            available: true,
            isClosed: false,
          },
        },
        upsert: true,
      },
    }));

    const result = await Inventory.bulkWrite(bulkOps);

    res.json({
      success: true,
      message: `Initialized ${result.upsertedCount} new dates, ${result.matchedCount} already existed`,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ─── BULK UPDATE (date range) ─── */
exports.updateInventory = async (req, res) => {
  try {
    const { vacationHouseId, startDate, endDate, price, availableRooms, isClosed } = req.body;

    if (!vacationHouseId || !startDate || !endDate)
      return res.status(400).json({ message: "vacationHouseId, startDate, endDate required" });

    const house = await VacationHouse.findById(vacationHouseId);
    if (!house) return res.status(404).json({ message: "Vacation house not found" });

    const basePrice = house.pricing?.basePrice || 0;
    const dates = getDatesBetween(startDate, endDate);

    const bulkOps = dates.map((date) => {
      const setFields = {};
      if (price          !== undefined) setFields.price          = Number(price);
      if (availableRooms !== undefined) setFields.availableRooms = Number(availableRooms);
      if (isClosed       !== undefined) {
        setFields.isClosed  = Boolean(isClosed);
        setFields.available = !Boolean(isClosed);
      }

      const setOnInsertFields = { vacationHouse: vacationHouseId, date, totalRooms: 1 };
      if (price          === undefined) setOnInsertFields.price          = basePrice;
      if (availableRooms === undefined) setOnInsertFields.availableRooms = 1;
      if (isClosed       === undefined) { setOnInsertFields.isClosed = false; setOnInsertFields.available = true; }

      const update = { $setOnInsert: setOnInsertFields };
      if (Object.keys(setFields).length) update.$set = setFields;

      return {
        updateOne: {
          filter: { vacationHouse: vacationHouseId, date },
          update,
          upsert: true,
        },
      };
    });

    await Inventory.bulkWrite(bulkOps);

    res.json({ success: true, message: `Updated ${dates.length} date(s)` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ─── SINGLE DATE UPDATE ─── */
exports.updateSingleDate = async (req, res) => {
  try {
    const { vacationHouseId, date, price, availableRooms, isClosed } = req.body;

    if (!vacationHouseId || !date)
      return res.status(400).json({ message: "vacationHouseId and date required" });

    const house = await VacationHouse.findById(vacationHouseId);
    if (!house) return res.status(404).json({ message: "Vacation house not found" });

    const setFields = {};
    if (price          !== undefined) setFields.price          = Number(price);
    if (availableRooms !== undefined) setFields.availableRooms = Number(availableRooms);
    if (isClosed       !== undefined) {
      setFields.isClosed  = Boolean(isClosed);
      setFields.available = !Boolean(isClosed);
    }

    const setOnInsert = {
      vacationHouse: vacationHouseId,
      date: new Date(date),
      totalRooms: 1,
    };
    if (price          === undefined) setOnInsert.price          = house.pricing?.basePrice || 0;
    if (availableRooms === undefined) setOnInsert.availableRooms = 1;
    if (isClosed       === undefined) { setOnInsert.isClosed = false; setOnInsert.available = true; }

    const updateOp = { $setOnInsert: setOnInsert };
    if (Object.keys(setFields).length) updateOp.$set = setFields;

    const data = await Inventory.findOneAndUpdate(
      { vacationHouse: vacationHouseId, date: new Date(date) },
      updateOp,
      { upsert: true, new: true }
    );

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};