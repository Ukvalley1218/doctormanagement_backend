import Promocode from "../../models/Promocode.js";

// ✅ Admin: Create promo code
export const createPromoCode = async (req, res) => {
  try {
    const { code, discountPercentage, expiryDate, usageLimit } = req.body;

    if (!code || !discountPercentage || !expiryDate || !usageLimit) {
      return res.status(400).json({ message: "Invalid data" });
    }
    const promo = new Promocode({
      code,
      discountPercentage,
      expiryDate,
      usageLimit,
    });

    await promo.save();
    res.status(201).json({ message: "Promo code created", promo });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Admin: Get all promo codes
export const getAllPromoCodes = async (req, res) => {
  try {
    const promos = await Promocode.find();
    res.json(promos);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Admin: Delete promo code
export const deletePromoCode = async (req, res) => {
  try {
    const { id } = req.params;
    const promo = await Promocode.findByIdAndDelete(id);

    if (!promo) return res.status(404).json({ message: "Promo code not found" });

    res.json({ message: "Promo code deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ User: Apply promo code
export const applyPromoCode = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) return res.status(400).json({ message: "Promo code required" });

    const promo = await Promocode.findOne({ code: code.toUpperCase(), isActive: true });

    if (!promo) return res.status(404).json({ message: "Invalid promo code" });

    if (promo.expiryDate < new Date()) {
      return res.status(400).json({ message: "Promo code expired" });
    }

    if (promo.usageLimit > 0 && promo.usedCount >= promo.usageLimit) {
      return res.status(400).json({ message: "Promo code usage limit reached" });
    }

    // ✅ Send discount % to frontend
    res.json({
      message: "Promo code applied",
      discountPercentage: promo.discountPercentage,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// get promocode by id  
export const getpromocodebyid = async (req,res)=>{
try {
    const {id} = req.params;
    const promo = await Promocode.findById(id);
    if (!promo) return res.status(404).json({ message: "Promo code not found" });
    res.json(promo);
    


    
} catch (error) {
    res.status(500).json({ message: "Server error", error: err.message });
}
}

// Update Promo Code (Admin only)
export const updatePromoCode = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body; // code, discountPercentage, expiryDate, isActive, usageLimit

    const promo = await Promocode.findByIdAndUpdate(id, updates, { new: true });

    if (!promo) {
      return res.status(404).json({ message: "Promo code not found" });
    }

    res.json({ message: "Promo code updated successfully", promo });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};