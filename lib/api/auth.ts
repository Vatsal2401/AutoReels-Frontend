import apiClient from "./client";

export interface SignUpDto {
  email: string;
  password: string;
  name: string;
  country: string;
}

export interface SignInDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    email_verified: boolean;
  };
  access_token: string;
  refresh_token: string;
}

export interface User {
  userId: string;
  email: string;
  credits_balance?: number;
  is_premium?: boolean;
  email_verified?: boolean;
  country?: string;
}

export const authApi = {
  signUp: async (data: SignUpDto): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>("/auth/signup", data);
    return response.data;
  },

  signIn: async (data: SignInDto): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>("/auth/signin", data);
    return response.data;
  },

  getMe: async (): Promise<User> => {
    const response = await apiClient.get<User>("/auth/me");
    return response.data;
  },

  refreshToken: async (refreshToken: string): Promise<{ access_token: string; refresh_token: string }> => {
    const response = await apiClient.post<{ access_token: string; refresh_token: string }>(
      "/auth/refresh",
      { refresh_token: refreshToken }
    );
    return response.data;
  },

  verifyEmail: async (token: string, email?: string): Promise<AuthResponse & { message: string }> => {
    const url = email
      ? `/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}`
      : `/auth/verify-email?token=${token}`;
    const response = await apiClient.get<AuthResponse & { message: string }>(url);
    return response.data;
  },

  resendVerification: async (): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>("/auth/resend-verification");
    return response.data;
  },
};
