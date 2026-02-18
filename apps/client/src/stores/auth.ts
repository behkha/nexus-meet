import { computed, ref } from "vue";
import { defineStore } from "pinia";
import * as AuthService from "#/services/auth.service";
import type { IUser } from "#/types/user.type";

const REFRESH_TOKEN_APP_KEY = "nexus-meet-rt-key";
export const useAuthStore = defineStore("auth", () => {
  const accessToken = ref<string | null>(null);
  const refreshToken = ref(localStorage.getItem(REFRESH_TOKEN_APP_KEY));
  const user = ref<IUser | null>(null);

  const isAuthenticated = computed(() => {
    return !!accessToken.value;
  });

  async function login(email: string) {}

  async function loginWithGoogle(credential: string) {
    try {
      const response = await AuthService.loginWithGoogle(credential);
      const { accessToken, refreshToken } = response.data;
      setTokens(accessToken, refreshToken);
      fetchUserProfile();
    } catch (error) {
      throw error;
    }
  }

  async function refreshAccessToken() {
    try {
      const response = await AuthService.refreshAccessToken(
        refreshToken.value!,
      );
      const { accessToken, refreshToken: rt } = response.data;
      setTokens(accessToken, rt);
      return accessToken as string;
    } catch (error) {
      console.log(error);
      clearTokens();
      throw error;
    }
  }

  function setTokens(access: string, refresh: string) {
    accessToken.value = access;
    refreshToken.value = refresh;
    localStorage.setItem(REFRESH_TOKEN_APP_KEY, refresh);
  }

  function clearTokens() {
    accessToken.value = null;
    refreshToken.value = null;
    localStorage.removeItem(REFRESH_TOKEN_APP_KEY);
  }

  function clearState() {
    clearTokens();
    user.value = null;
  }

  async function fetchUserProfile() {
    try {
      const userResponse = await AuthService.getUserProfile();
      user.value = userResponse.data.data;
    } catch (error) {
      throw error
    }
  }

  async function initializeAuth() {
    if (accessToken.value) return;

    if (!refreshToken.value) {
      clearState();
      return;
    }

    if (refreshToken.value && !accessToken.value) {
      await refreshAccessToken();
    }

    if (accessToken.value && !user.value) {
      await fetchUserProfile();
    }
  }

  return {
    accessToken,
    refreshToken,
    isAuthenticated,
    user,
    initializeAuth,
    login,
    loginWithGoogle,
    refreshAccessToken,
  };
});
