// Central API client with automatic JWT injection and error handling

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://trao-ai-8m4e.vercel.app/';

// ─── Token Helpers ─────────────────────────────────────────────────────────────

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('trao_token');
};

export const setToken = (token: string): void => {
  localStorage.setItem('trao_token', token);
};

export const removeToken = (): void => {
  localStorage.removeItem('trao_token');
  localStorage.removeItem('trao_user');
};

export const getUser = () => {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('trao_user');
  return raw ? JSON.parse(raw) : null;
};

export const setUser = (user: object): void => {
  localStorage.setItem('trao_user', JSON.stringify(user));
};

// ─── Core Fetch Wrapper ────────────────────────────────────────────────────────

interface RequestOptions {
  method?: string;
  body?: object;
  requiresAuth?: boolean;
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = 'GET', body, requiresAuth = true } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (requiresAuth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const config: RequestInit = {
    method,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  // Clean trailing slashes from API_BASE_URL and leading slashes from endpoint
  const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  const response = await fetch(`${baseUrl}${cleanEndpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    // Handle 401 by clearing auth state
    if (response.status === 401 && typeof window !== 'undefined') {
      removeToken();
      window.location.href = '/login';
    }
    throw new Error(data.message || `HTTP ${response.status}: Request failed`);
  }

  return data as T;
}

// ─── Auth API ─────────────────────────────────────────────────────────────────

export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    apiRequest('/api/auth/register', {
      method: 'POST',
      body: data,
      requiresAuth: false,
    }),

  login: (data: { email: string; password: string }) =>
    apiRequest('/api/auth/login', {
      method: 'POST',
      body: data,
      requiresAuth: false,
    }),

  getMe: () => apiRequest('/api/auth/me'),
};

// ─── Trips API ────────────────────────────────────────────────────────────────

export const tripsApi = {
  getAll: () => apiRequest('/api/trips'),

  getById: (id: string) => apiRequest(`/api/trips/${id}`),

  generate: (data: {
    destination: string;
    durationDays: number;
    budgetTier: string;
    interests: string[];
  }) =>
    apiRequest('/api/trips/generate', {
      method: 'POST',
      body: data,
    }),

  update: (
    id: string,
    data: { itinerary?: object[]; packingList?: object[] }
  ) =>
    apiRequest(`/api/trips/${id}`, {
      method: 'PUT',
      body: data,
    }),

  delete: (id: string) =>
    apiRequest(`/api/trips/${id}`, { method: 'DELETE' }),

  regenerateDay: (id: string, dayNumber: number, feedback?: string) =>
    apiRequest(`/api/trips/${id}/regenerate-day`, {
      method: 'POST',
      body: { dayNumber, feedback },
    }),
};
