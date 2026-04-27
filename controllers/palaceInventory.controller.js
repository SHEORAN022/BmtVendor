const Inventory = require("../models/PalaceInventory");
const Palace = require("../models/palaceModel");

/* HELPER */
const getDates = (start, end) => {
  const arr = [];
  let d = new Date(start);
  while (d <= new Date(end)) {
    arr.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return arr;
};

/* ================= GET ================= */
exports.getInventory = async (req, res) => {
  try {
    const { palaceId, roomId, startDate, endDate } = req.query;

    const data = await Inventory.find({
      palace: palaceId,
      room: roomId,
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }).sort({ date: 1 });

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= BULK ================= */
exports.updateInventory = async (req, res) => {
  try {
    const { palaceId, roomId, startDate, endDate, price, availableRooms, isClosed } = req.body;

    const palace = await Palace.findById(palaceId);
    const room = palace.rooms.id(roomId);

    const dates = getDates(startDate, endDate);

    const ops = dates.map(date => ({
      updateOne: {
        filter: { palace: palaceId, room: roomId, date },
        update: {
          $set: {
            ...(price !== undefined && { price }),
            ...(availableRooms !== undefined && { availableRooms }),
            ...(isClosed !== undefined && { isClosed })
          },
          $setOnInsert: {
            palace: palaceId,
            room: roomId,
            date,
            totalRooms: palace.totalRooms,
            price: room.price || palace.basePrice,
            availableRooms: palace.totalRooms
          }
        },
        upsert: true
      }
    }));

    await Inventory.bulkWrite(ops);

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= SINGLE ================= */
exports.updateSingleDate = async (req, res) => {
  try {
    const { palaceId, roomId, date, price, availableRooms, isClosed } = req.body;

    const palace = await Palace.findById(palaceId);
    const room = palace.rooms.id(roomId);

    const data = await Inventory.findOneAndUpdate(
      { palace: palaceId, room: roomId, date: new Date(date) },
      {
        $set: {
          ...(price !== undefined && { price }),
          ...(availableRooms !== undefined && { availableRooms }),
          ...(isClosed !== undefined && { isClosed })
        },
        $setOnInsert: {
          palace: palaceId,
          room: roomId,
          date,
          totalRooms: palace.totalRooms,
          price: room.price || palace.basePrice,
          availableRooms: palace.totalRooms
        }
      },
      { new: true, upsert: true }
    );

    res.json(data);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= INIT ================= */
exports.initInventory = async (req, res) => {
  try {
    const { palaceId, roomId, days = 90 } = req.body;

    const palace = await Palace.findById(palaceId);
    const room = palace.rooms.id(roomId);

    const start = new Date();
    const end = new Date();
    end.setDate(start.getDate() + days);

    const dates = getDates(start, end);

    const ops = dates.map(date => ({
      updateOne: {
        filter: { palace: palaceId, room: roomId, date },
        update: {
          $setOnInsert: {
            palace: palaceId,
            room: roomId,
            date,
            totalRooms: palace.totalRooms,
            price: room.price || palace.basePrice,
            availableRooms: palace.totalRooms,
            isClosed: false
          }
        },
        upsert: true
      }
    }));

    await Inventory.bulkWrite(ops);

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};