const Offer = require("../Models/offersModel");

// Controller functions for handling CRUD operations
exports.getAllOffers = async (req, res) => {
  try {
    const offers = await Offer.find();
    res.json(offers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOfferById = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }
    res.json(offer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createOffer = async (req, res) => {
  const offer = new Offer({
    products: req.body.products,
    coupon: req.body.coupon,
    discount: req.body.discount,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
  });

  try {
    const newOffer = await offer.save();
    res.status(201).json(newOffer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateOffer = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    offer.products = req.body.products;
    offer.coupon = req.body.coupon;
    offer.discount = req.body.discount;
    offer.startDate = req.body.startDate;
    offer.endDate = req.body.endDate;

    const updatedOffer = await offer.save();
    res.json(updatedOffer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteOffer = async (req, res) => {
  try {
    await Offer.findByIdAndDelete(req.params.id);

    res.json({ message: "Offer deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
