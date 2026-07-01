import express from "express";
import User from "../models/User.js";
import { verifikasiToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// 1. GET ALL FREELANCERS (Untuk halaman Info Anggota)
router.get("/all", async (req, res) => {
  try {
    const freelancers = await User.find({ role: "freelancer" }).select("-password");
    res.json(freelancers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 2. PUT UPDATE PROFILE (Untuk Freelancer edit profilnya)
router.put("/profile", verifikasiToken, async (req, res) => {
  try {
    const { bio, skill, pricePerHour } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id, // ID didapat dari middleware verifikasiToken
      { bio, skill, pricePerHour },
      { new: true }
    ).select("-password");
    
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;