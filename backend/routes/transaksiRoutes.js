import express from "express";
import Transaksi from "../models/transaksi.js";
import { verifikasiToken } from "../middleware/authMiddleware.js";
import { hanyaAdmin } from "../middleware/roleMiddleware.js";

const router = express.Router();

/* ==========================================
   GET - Ambil Semua Transaksi
========================================== */
router.get("/", verifikasiToken, hanyaAdmin, async (req, res) => {
      try {
        const data = await Transaksi.find().sort({ createdAt: -1 });
        res.status(200).json(data);
    } catch (error) {
        console.error("ERROR GET TRANSAKSI:");
        console.error(error);

        res.status(500).json({
            message: "Gagal mengambil data transaksi",
            error: error.message
        });
    }
});


/* ==========================================
   POST - Tambah Transaksi
========================================== */
router.post("/", verifikasiToken, async (req, res) => {

    console.log("=== DATA DITERIMA DARI FRONTEND ===");
    console.log(req.body);

    try {

        const {
            clientName,
            serviceName,
            freelancer,
            price,
            notes
        } = req.body;

        // Validasi data
        if (!clientName || !serviceName || !freelancer || price === undefined) {
            return res.status(400).json({
                message: "Semua data transaksi wajib diisi."
            });
        }

        const transaksiBaru = new Transaksi({
            clientName,
            serviceName,
            freelancer,
            price: Number(price),
            notes
        });

        const hasil = await transaksiBaru.save();

        console.log("Transaksi berhasil disimpan.");
        console.log(hasil);

        res.status(201).json(hasil);

    } catch (error) {

        console.error("=== ERROR SIMPAN TRANSAKSI ===");
        console.error(error);

        res.status(400).json({
            message: error.message
        });
    }

});


/* ==========================================
   PUT - Update Status
========================================== */
router.put("/:id", verifikasiToken, hanyaAdmin, async (req, res) => {
  
    try {

        const transaksi = await Transaksi.findByIdAndUpdate(
            req.params.id,
            {
                status: req.body.status
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!transaksi) {
            return res.status(404).json({
                message: "Transaksi tidak ditemukan."
            });
        }

        res.json(transaksi);

    } catch (error) {

        console.error(error);

        res.status(400).json({
            message: error.message
        });
    }

});


/* ==========================================
   DELETE - Hapus Transaksi
========================================== */
router.delete("/:id", verifikasiToken, hanyaAdmin, async (req, res) => {
  
    try {

        const transaksi = await Transaksi.findByIdAndDelete(req.params.id);

        if (!transaksi) {
            return res.status(404).json({
                message: "Transaksi tidak ditemukan."
            });
        }

        res.json({
            message: "Transaksi berhasil dihapus."
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: error.message
        });
    }

});

export default router;
