export interface Profile {
  id: string;
  name: string;
  email?: string;
  bio?: string;
  location?: string;
  skills: string[];
  available: boolean;
  role?: string;
  avatarUrl?: string;
  githubUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data: T;
  pagination?: PaginationMeta;
  message?: string;
  error?: string;
}

export type UserRole = 'admin' | 'analyst';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface ProfilesQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  skills?: string;
  location?: string;
  available?: boolean;
}
