import { NextFunction, Response } from "express";
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import { prisma } from "../db";
import { CustomRequest } from "../types";

export const isAuthenticated = asyncHandler(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers["authorization"];
    const jwtToken = authHeader && authHeader.split(" ")[1];

    if (!jwtToken) {
      res.status(401);
      throw new Error("Unauthorized");
    }

    const revokedToken = await prisma.revokedToken.findFirst({
      where: {
        token: jwtToken,
      },
    });

    if (revokedToken) {
      res.status(403);
      throw new Error("Invalid Token");
    }

    let decoded: { id: string; email: string; iat: number; exp: number };
    try {
      decoded = jwt.verify(jwtToken, process.env.JWT_SECRET) as {
        id: string;
        email: string;
        iat: number;
        exp: number;
      };
    } catch (e) {
      res.status(403);
      throw new Error("Invalid Token");
    }

    const user = await prisma.user.findUnique({
      where: { email: decoded.email },
    });
    req.user = user;
    next();
  }
);

export const hasRole = (role: string) => {
  return (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!(req.user.role === role)) {
      res.status(401);
      throw new Error("Unauthorized");
    }
    next();
  };
};
