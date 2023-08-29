import { Request } from "express";
import { User } from "./authTypes";

export interface CustomRequest extends Request {
  user: User;
}
