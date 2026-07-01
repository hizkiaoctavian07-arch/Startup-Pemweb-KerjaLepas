import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    nama: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
role: {
    type: String,
    enum: ["admin", "client"],
    default: "client",
    required: true,
},    
    // --- TAMBAHAN UNTUK PROFIL FREELANCER ---
    bio: { type: String, default: "" },         // Penjelasan singkat tentang diri
    skill: { type: String, default: "" },       // Keahlian (misal: Web, Desain)
    pricePerHour: { type: Number, default: 0 }, // Tarif per jam
    avatarUrl: { type: String, default: "" }    // Opsional, untuk link foto profil
  },
  { timestamps: true },
);

export default mongoose.model("User", UserSchema);