import axios from "axios";
import { authHeader } from "@/shared/_helper/auth-header";

export const rootUrl = "http://localhost:4000/api/v1";

const authUrl = rootUrl + "/admin";
const colorUrl = rootUrl + "/color";

// Admin login api service function
export async function loginUser(data: object) {
  return await axios.post(authUrl + "/login", data);
}

// Admin me api service function
export async function me() {
  return await axios.get(authUrl + "/me", {
    headers: await authHeader(),
  });
}

// Admin update profile
export async function updateProfile(data: object) {
  return await axios.patch(`${authUrl}/update`, data, {
    headers: await authHeader(),
  });
}

// Reset Password api service function
export async function resetPassword(data: object) {
  return await axios.patch(`${authUrl}/reset-password`, data, {
    headers: await authHeader(),
  });
}

// Colors api service functions
// Add color api service function
export async function addColor(data: object) {
  return await axios.post(colorUrl + "/create", data, {
    headers: await authHeader(),
  });
}

// Get all colors api service function
export async function getAllColors(params: {
  offset?: number;
  limit?: number;
  status?: string;
  query?: string;
  sort?: "asc" | "desc";
  sortBy?: "name" | "hexCode" | "createdAt" | "updatedAt";
}) {
  return await axios.get(colorUrl + "/list", { params });
}

// Update color api service function
export async function updateColor(id: string, data: object) {
  return await axios.patch(`${colorUrl}/update/${id}`, data, {
    headers: await authHeader(),
  });
}

// Delete color api service function
export async function deleteColor(id: string) {
  return await axios.delete(`${colorUrl}/delete/${id}`, {
    headers: await authHeader(),
  });
}
