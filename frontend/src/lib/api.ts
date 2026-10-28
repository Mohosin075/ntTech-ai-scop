import { ApiResponse } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

export const isInvalidSessionError = (error: unknown): boolean =>
  error instanceof ApiError && [401, 404].includes(error.status);

export async function fetchApi<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  // Read auth token from localStorage if in client environment
  let token: string | null = null;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('scopeai_token');
  }

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers as Record<string, string>),
    },
  });

  const data = await response.json().catch((error: unknown) => {
    if (response.ok) throw error;
    return {};
  });

  if (!response.ok) {
    throw new ApiError(data.message || `API error: ${response.status} ${response.statusText}`, response.status);
  }

  return data;
}

export default fetchApi;
