import asyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { prisma } from "../db";
import { Request, Response } from "express";
import { LoginRequest, LogoutRequest, RegisterRequest, User } from "../types/authTypes";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { firstName, lastName, email, password, role } = req.body as RegisterRequest;

  // hash password
  const hashedPassowrd = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      password: hashedPassowrd,
      role,
    },
  });

  if (user) {
    res.status(201).json(user);
  } else {
    res.status(400);
    throw new Error("Failed to create user");
  }
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as LoginRequest;

  // check if email is valid or nor
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    res.status(404);
    throw new Error("Invalid Email");
  }

  // check if passowrd is valid or not
  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    res.status(404);
    throw new Error("Invalid Password");
  }

  // generate jwt for the user
  const jwtToken = generateJWT(user);

  // send response
  res.send({ jwtToken, user });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const { jwtToken } = req.body as LogoutRequest;

  console.log(jwtToken);

  const revokedToken = await prisma.revokedToken.create({
    data: {
      token: jwtToken,
    },
  });

  if (revokedToken) {
    res.json({ message: "Logged out successfully" });
  } else {
    res.status(400);
    throw new Error("Failed to logout");
  }
});

function generateJWT(user: User) {
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "30d" });
}
