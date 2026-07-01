import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.js";

const router = express.Router();

// 1. REGISTER
router.post("/register", async (req, res) => {
  const { nama, email, password, role } = req.body;
  try {
    const userExist = await User.findOne({ email });
    if (userExist)
      return res.status(400).json({ message: "Email sudah terdaftar!" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userBaru = new User({ nama, email, password: hashedPassword, role });
    await userBaru.save();

    res.status(201).json({ message: "Registrasi berhasil!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 2. LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(400)
        .json({ message: "Email salah atau tidak ditemukan!" });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword)
      return res.status(400).json({ message: "Password salah!" });

    // Buat Token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "secretamikom123",
      { expiresIn: "1d" },
    );

    res.json({
      token,
      user: { id: user._id, nama: user.nama, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
