import { axiosInstance } from "./index.service";

export async function loginWithGoogle(credential: string) {
  return await axiosInstance.post("/auth/google", {
    credential,
  });
}

export async function refreshAccessToken(refreshToken: string) {
  return await axiosInstance.post("/auth/refresh", {
    token: refreshToken,
  });
}

export async function getUserProfile() {
  return axiosInstance.get("/profile/me");
}

export async function logout(refreshToken: string) {
  return await axiosInstance.post("/auth/logout", {
    token: refreshToken,
  });
}
