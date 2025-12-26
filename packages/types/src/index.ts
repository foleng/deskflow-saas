// Export types here
export interface User {
  id: number;
  nickname?: string;
  email?: string;
  role?: 'admin' | 'agent';
  avatar?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  nickname: string;
}

export interface UpdateProfileDto {
  nickname?: string;
  email?: string;
  password?: string;
  avatar?: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  newPassword: string;
}

export interface AuthResponse {
    success: boolean;
    token: string;
    agent: User;
}
