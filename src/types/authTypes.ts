export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  contactNumber: string;
  password: string;
  role: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LogoutRequest {
  jwtToken: string;
}

export enum UserRole {
  JobSeeker,
  Company,
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
}
