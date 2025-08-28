// middleware/auth.js
import jwt from "jsonwebtoken";

export function auth(req, res, next) {
  const authHeader = req.headers["authorization"]; // standard way
  if (!authHeader) {
    return res.status(401).json({ msg: "No token, access denied" });
  }

  const token = authHeader.split(" ")[1]; // Extract after 'Bearer '
  if (!token) {
    return res.status(401).json({ msg: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).json({ msg: "Token is not valid" });
  }
}

