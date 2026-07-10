// Single client for the Express/MongoDB backend. Used by every page.
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8001';
const TOKEN_KEY = 'mikon_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok || json.success === false) {
    if (res.status === 401 || res.status === 403) clearToken();
    throw new ApiError(json.message || `Request failed (${res.status})`, res.status);
  }

  return json.data as T;
}

// ---- Auth ----
export interface BackendUser {
  id?: string;
  _id?: string;
  username: string;
  email: string;
  role: 'Admin' | 'Manager';
  maxHoursCapacity?: number;
}

export async function login(email: string, password: string) {
  const data = await request<{ user: BackendUser; token: string }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setToken(data.token);
  return data.user;
}

export async function register(username: string, email: string, password: string) {
  const data = await request<{ user: BackendUser; token: string }>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, email, password }),
  });
  setToken(data.token);
  return data.user;
}

export const getMe = () => request<BackendUser>('/api/auth/me');

export const updateProfile = (data: { username?: string; maxHoursCapacity?: number }) =>
  request<BackendUser>('/api/auth/profile', { method: 'PUT', body: JSON.stringify(data) });

// ---- Projects ----
export interface PaginatedResponse {
  pagination: { page: number; limit: number; total: number; pages: number };
  [key: string]: any;
}

export const getProjects = () =>
  request<{ projects: any[]; pagination: any }>('/api/projects?limit=100');
export const createProject = (data: any) =>
  request('/api/projects', { method: 'POST', body: JSON.stringify(data) });
export const updateProject = (id: string, data: any) =>
  request(`/api/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteProject = (id: string) =>
  request(`/api/projects/${id}`, { method: 'DELETE' });

// ---- Expenses (FixedCost) ----
export const getExpenses = () =>
  request<{ expenses: any[]; pagination: any }>('/api/expenses?limit=100');
export const createExpense = (data: any) =>
  request('/api/expenses', { method: 'POST', body: JSON.stringify(data) });
export const updateExpense = (id: string, data: any) =>
  request(`/api/expenses/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteExpense = (id: string) =>
  request(`/api/expenses/${id}`, { method: 'DELETE' });

// ---- Services ----
export const getServices = () => request<any[]>('/api/services');
export const createService = (data: any) =>
  request('/api/services', { method: 'POST', body: JSON.stringify(data) });
export const updateService = (id: string, data: any) =>
  request(`/api/services/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteService = (id: string) =>
  request(`/api/services/${id}`, { method: 'DELETE' });

// ---- Leads (Pipeline) ----
export const getLeads = (stage?: string) =>
  request<any[]>(`/api/leads${stage ? `?stage=${stage}` : ''}`);
export const createLead = (data: any) =>
  request('/api/leads', { method: 'POST', body: JSON.stringify(data) });
export const updateLead = (id: string, data: any) =>
  request(`/api/leads/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteLead = (id: string) =>
  request(`/api/leads/${id}`, { method: 'DELETE' });

// ---- Ghostwriter ----
// This endpoint returns { success, content, model, elapsedMs } (no `data` wrapper),
// unlike the rest of the API, so it can't go through the generic request() helper.
export interface GhostwriterPayload {
  contentType: string;
  service: string;
  audience: string;
  model: string;
  context: string;
}

export interface GhostwriterResult {
  content: string;
  model: string;
  elapsedMs: number;
}

export async function generateGhostwriterContent(payload: GhostwriterPayload): Promise<GhostwriterResult> {
  const token = getToken();
  const res = await fetch(`${BACKEND_URL}/api/ghostwriter/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok || json.success === false) {
    if (res.status === 401 || res.status === 403) clearToken();
    throw new ApiError(json.message || `Request failed (${res.status})`, res.status);
  }

  return { content: json.content, model: json.model, elapsedMs: json.elapsedMs };
}

// ---- Analytics ----
export const getDashboardAnalytics = () => request<any>('/api/analytics/dashboard');

// ---- Audit Log (Admin only) ----
export interface AuditLogEntry {
  _id: string;
  userEmail: string;
  action: 'create' | 'update' | 'delete';
  entityType: 'Project' | 'Expense' | 'Service';
  entityLabel: string;
  createdAt: string;
}

export const getAuditLogs = (page = 1) =>
  request<{ logs: AuditLogEntry[]; pagination: any }>(`/api/audit-logs?page=${page}&limit=20`);
