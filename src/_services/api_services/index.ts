import { api } from "@/lib/axios.config";

export async function loginUser(data: object) {
  return await api.post("admin/login", data);
};

export async function me() {
  return await api.get("admin/me");
}
