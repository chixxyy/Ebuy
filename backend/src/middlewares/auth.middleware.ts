import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../db";

interface AuthRequest extends Request {
  user?: any;
}

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  jwt.verify(token, process.env.JWT_SECRET as string, async (err, decoded: any) => {
    if (err || !decoded) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }

    try {
      // Enforce strict identity validation by querying the DB
      const userRecord = await prisma.user.findUnique({
        where: { id: decoded.userId }
      });

      // If user doesn't exist, or if the email in the DB doesn't match the JWT (meaning the DB was reset)
      if (!userRecord || userRecord.email !== decoded.email) {
        return res.status(403).json({ message: "Session invalid or expired. Please log in again." });
      }

      req.user = decoded;
      next();
    } catch (e) {
      console.error("Auth Middleware DB Error:", e);
      return res.status(500).json({ message: "Internal server error during authentication" });
    }
  });
};
