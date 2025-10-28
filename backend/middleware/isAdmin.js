// middleware/isAdmin.js
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const { supabase } = require("../services/supabase.js");
dotenv.config();

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ fetch user from DB to get role info
    const { data: user, error } = await supabase
      .from("users")
      .select("id, name, email, role")
      .eq("id", decoded.id)
      .single();

    if (error || !user) {
      console.error("Supabase fetch error:", error);
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user;
    req.isAdmin = user.role === "admin";

    if (!req.isAdmin) {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    next();
  } catch (error) {
    console.error("isAdmin middleware error:", error.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
