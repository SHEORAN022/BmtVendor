const Inventory = require("../models/Inventory");
const Hotel = require("../models/Hotel.model");

function getDatesBetween(start, end) {
  const dates = [];
  const cur = new Date(start);
  const last = new Date(end);
  while (cur <= last) {
    dates.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}


exports.getInventory = async (req, res) => {
  try {
    const { hotelId, roomId, startDate, endDate } = req.query;

    if (!hotelId || !roomId || !startDate || !endDate) {
      return res.status(400).json({ message: "hotelId, roomId, startDate, endDate are required" });
    }

    const data = await Inventory.find({
      hotel: hotelId,
      room:  roomId,
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    }).sort({ date: 1 });

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.updateInventory = async (req, res) => {
  try {
    const { hotelId, roomId, startDate, endDate, price, availableRooms, isClosed } = req.body;

    if (!hotelId || !roomId || !startDate || !endDate) {
      return res.status(400).json({ message: "hotelId, roomId, startDate, endDate are required" });
    }

    // Get room's totalRooms for upsert fallback
    const hotel = await Hotel.findById(hotelId).select("rooms");
    const room  = hotel?.rooms?.id(roomId);
    if (!room) return res.status(404).json({ message: "Room not found" });

    const totalRooms = room.totalRooms;
    const basePrice  = room.basePrice;

    const dates = getDatesBetween(startDate, endDate);

    const bulkOps = dates.map(date => {
      // Fields to always set (provided by user)
      const setFields = {};
      if (price          !== undefined) setFields.price          = Number(price);
      if (availableRooms !== undefined) setFields.availableRooms = Number(availableRooms);
      if (isClosed       !== undefined) setFields.isClosed       = Boolean(isClosed);

      // Fields only set on INSERT — must NOT overlap with $set keys
      const setOnInsertFields = {
        hotel:     hotelId,
        room:      roomId,
        date,
        totalRooms,
      };
      // Only add defaults for fields NOT already in $set (avoids conflict)
      if (price          === undefined) setOnInsertFields.price          = basePrice;
      if (availableRooms === undefined) setOnInsertFields.availableRooms = totalRooms;
      if (isClosed       === undefined) setOnInsertFields.isClosed       = false;

      const update = { $setOnInsert: setOnInsertFields };
      if (Object.keys(setFields).length > 0) update.$set = setFields;

      return {
        updateOne: {
          filter: { hotel: hotelId, room: roomId, date },
          update,
          upsert: true,
        },
      };
    });

    await Inventory.bulkWrite(bulkOps);

    res.json({ success: true, message: `Inventory updated for ${dates.length} date(s)` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.updateSingleDate = async (req, res) => {
  try {
    const { hotelId, roomId, date, price, availableRooms, isClosed } = req.body;

    if (!hotelId || !roomId || !date) {
      return res.status(400).json({ message: "hotelId, roomId, date are required" });
    }

    const setFields = {};
    if (price          !== undefined) setFields.price          = Number(price);
    if (availableRooms !== undefined) setFields.availableRooms = Number(availableRooms);
    if (isClosed       !== undefined) setFields.isClosed       = Boolean(isClosed);

    // If no existing record, pull defaults from room schema
    const hotel = await Hotel.findById(hotelId).select("rooms");
    const room  = hotel?.rooms?.id(roomId);
    if (!room) return res.status(404).json({ message: "Room not found" });

    const setOnInsertFields = {
      hotel:      hotelId,
      room:       roomId,
      date:       new Date(date),
      totalRooms: room.totalRooms,
    };
    if (price          === undefined) setOnInsertFields.price          = room.basePrice;
    if (availableRooms === undefined) setOnInsertFields.availableRooms = room.totalRooms;
    if (isClosed       === undefined) setOnInsertFields.isClosed       = false;

    const updateOp = { $setOnInsert: setOnInsertFields };
    if (Object.keys(setFields).length > 0) updateOp['$set'] = setFields;

    const data = await Inventory.findOneAndUpdate(
      { hotel: hotelId, room: roomId, date: new Date(date) },
      updateOp,
      { new: true, upsert: true }
    );

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.initInventory = async (req, res) => {
  try {
    const { hotelId, roomId, days = 90 } = req.body;

    const hotel = await Hotel.findById(hotelId).select("rooms");
    const room  = hotel?.rooms?.id(roomId);
    if (!room) return res.status(404).json({ message: "Room not found" });

    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + days - 1);

    const dates = getDatesBetween(startDate, endDate);

    const bulkOps = dates.map(date => ({
      updateOne: {
        filter: { hotel: hotelId, room: roomId, date },
        update: {
          $setOnInsert: {
            hotel:          hotelId,
            room:           roomId,
            date,
            price:          room.basePrice,
            availableRooms: room.totalRooms,
            totalRooms:     room.totalRooms,
            isClosed:       false,
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