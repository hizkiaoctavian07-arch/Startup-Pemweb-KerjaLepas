import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

// Import Rute
import authRoutes from "./routes/authRoutes.js";
import transaksiRoutes from "./routes/transaksiRoutes.js";
import userRoutes from "./routes/userRoutes.js"; // Rute baru untuk Profil Freelancer

dotenv.config();
console.log("JWT SECRET :", process.env.JWT_SECRET);

const app = express();
const PORT = process.env.PORT || 5000;
app.get("/", (req, res) => {
  res.send("API Server berjalan dengan lancar!");
});
// Middleware
app.use(cors());
app.use(express.json());

// Koneksi MongoDB
// Catatan: Di Render.com, pastikan variabel MONGO_URI sudah diisi di dashboard Environment
const dbURI = process.env.MONGO_URI;

mongoose
  .connect(dbURI)
  .then(() => console.log("Sukses Terhubung ke MongoDB Atlas Cloud!"))
  .catch((err) => {
    console.error("Gagal koneksi ke database:", err.message);
  });

// Rute API Utama
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transaksiRoutes);
app.use("/api/users", userRoutes); // Mengelola Profil Freelancer

// Jalankan Server
app.listen(PORT, () =>
  console.log(`Server Backend berjalan di http://localhost:${PORT}`)
);
