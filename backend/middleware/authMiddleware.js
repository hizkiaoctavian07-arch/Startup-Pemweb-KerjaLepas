import jwt from "jsonwebtoken";

export const verifikasiToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  console.log("Authorization Header:", authHeader);

  if (!authHeader) {
    return res.status(401).json({
      message: "Akses ditolak, token tidak ditemukan!",
    });
  }

  const token = authHeader.split(" ")[1];

  console.log("Token:", token);
  console.log("JWT_SECRET:", process.env.JWT_SECRET);

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);

    console.log("Payload:", verified);

    req.user = verified;
    next();
  } catch (err) {
    console.log("JWT Error:", err.message);

    return res.status(400).json({
      message: "Token tidak valid!",
    });
  }
};