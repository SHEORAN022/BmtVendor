const Campaign = require("../models/SponsoredCampaign");

/* CREATE */
exports.createCampaign = async (req, res) => {
  try {
    const d = req.body;

    if (!d.hotel) return res.status(400).json({ message: "Hotel required" });
    if (!d.campaignName) return res.status(400).json({ message: "Campaign name required" });

    const cpc = Number(d.cpc);
    const clicks = Number(d.clicks);

    const totalCost = cpc * clicks;
    const gst = totalCost * 0.18;
    const finalAmount = totalCost + gst;

    const campaign = await Campaign.create({
      vendor: req.vendor._id,
      hotel: d.hotel,
      campaignName: d.campaignName,
      startDate: d.startDate,
      endDate: d.endDate,
      cpc,
      clicks,
      totalCost,
      gst,
      finalAmount,
      paymentMethod: d.paymentMethod,
    });

    res.json({ success: true, campaign });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

/* GET ALL */
exports.getCampaigns = async (req, res) => {
  try {
    const data = await Campaign.find({ vendor: req.vendor._id })
      .populate("hotel", "hotelName")
      .sort({ createdAt: -1 });

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};