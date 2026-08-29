function resolveApiBase(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl) return envUrl;
  if (typeof window !== "undefined") {
    return `${window.location.protocol}//${window.location.hostname}:5000`;
  }
  return "http://localhost:5000";
}

const API_BASE = resolveApiBase();

// ─── Token Management ────────────────────────────────────────────────

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("accessToken");
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("refreshToken");
}

export function setTokens(accessToken: string, refreshToken: string): void {
  sessionStorage.setItem("accessToken", accessToken);
  sessionStorage.setItem("refreshToken", refreshToken);
}

export function clearTokens(): void {
  sessionStorage.removeItem("accessToken");
  sessionStorage.removeItem("refreshToken");
}

// ─── API Fetch Wrapper ──────────────────────────────────────────────

interface ApiOptions extends RequestInit {
  params?: Record<string, string>;
}

async function apiFetch<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { params, headers: customHeaders, ...rest } = options;

  const url = new URL(`${API_BASE}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }

  const token = getAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(customHeaders as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url.toString(), { headers, ...rest });

  if (res.status === 401) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      headers["Authorization"] = `Bearer ${getAccessToken()}`;
      const retryRes = await fetch(url.toString(), { headers, ...rest });
      if (!retryRes.ok) {
        const err = await retryRes.json().catch(() => ({ error: { message: "Request failed" } }));
        throw new Error(err.error?.message || `HTTP ${retryRes.status}`);
      }
      return retryRes.json();
    }
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: { message: "Request failed" } }));
    throw new Error(err.error?.message || `HTTP ${res.status}`);
  }

  return res.json();
}

async function tryRefresh(): Promise<boolean> {
  const rt = getRefreshToken();
  if (!rt) return false;
  try {
    const res = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: rt }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    if (data.success) {
      setTokens(data.data.accessToken, data.data.refreshToken);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

// ─── Auth API ───────────────────────────────────────────────────────

export interface BackendProfile {
  id: string;
  name: string;
  slug: string;
  emailSlug: string | null;
  category: string;
  department: string | null;
  dashboardRoute: string;
  active: boolean;
}

export interface BackendUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department: string;
  position: string;
  phone: string;
  avatar: string | null;
  status: string;
  accountStatus: string;
  provider: string;
  lastActiveAt: string;
  lastLoginAt: string;
  createdAt: string;
  updatedAt: string;
  supervisorId: string | null;
  profileId: string | null;
  profile?: BackendProfile | null;
}

export interface LoginResponse {
  success: boolean;
  data: {
    user: BackendUser;
    accessToken: string;
    refreshToken: string;
    expiresIn: string;
  };
  message: string;
}

export interface ApiListResponse<T> {
  success: boolean;
  data: T[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiSingleResponse<T> {
  success: boolean;
  data: T;
}

export async function login(email: string, password: string, profileSlug?: string): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password, profileSlug }),
  });
}

export async function getMe(): Promise<ApiSingleResponse<BackendUser>> {
  return apiFetch("/api/auth/me");
}

export async function logout(): Promise<void> {
  try {
    await apiFetch("/api/auth/logout", { method: "POST" });
  } finally {
    clearTokens();
  }
}

// ─── Users API ──────────────────────────────────────────────────────

export async function getUsers(params?: Record<string, string>): Promise<{ success: boolean; users: BackendUser[] }> {
  return apiFetch("/api/users", { params });
}

export async function getUserById(id: string): Promise<{ success: boolean; user: BackendUser }> {
  return apiFetch(`/api/users/${id}`);
}

// ─── Internships API ────────────────────────────────────────────────

export interface BackendInternship {
  id: string;
  studentId: string;
  supervisorId: string;
  department: string;
  subject: string;
  startDate: string;
  endDate: string;
  status: string;
  description: string;
  student?: BackendUser;
  supervisor?: BackendUser;
  progress?: { id: string; internshipId: string; weekNumber: number; description: string; percentage: number; createdAt: string }[];
}

export async function getInternships(params?: Record<string, string>) {
  return apiFetch<ApiListResponse<BackendInternship>>("/api/internships", { params });
}

export async function getInternshipById(id: string) {
  return apiFetch<ApiSingleResponse<BackendInternship>>(`/api/internships/${id}`);
}

// ─── Tasks API ──────────────────────────────────────────────────────

export interface BackendTask {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string;
  assigneeId: string;
  creatorId: string;
  createdAt: string;
  assignee?: BackendUser;
  creator?: BackendUser;
}

export async function getTasks(params?: Record<string, string>): Promise<{ success: boolean; tasks: BackendTask[] }> {
  return apiFetch("/api/tasks", { params });
}

// ─── Requests API ───────────────────────────────────────────────────

export interface BackendRequest {
  id: string;
  type: string;
  status: string;
  description: string;
  requesterId: string;
  reviewerId: string | null;
  createdAt: string;
  requester?: BackendUser;
}

export async function getRequests(params?: Record<string, string>): Promise<{ success: boolean; requests: BackendRequest[] }> {
  return apiFetch("/api/requests", { params });
}

// ─── Notifications API ──────────────────────────────────────────────

export interface BackendNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  userId: string;
  createdAt: string;
}

export async function getNotifications(): Promise<{ success: boolean; notifications: BackendNotification[] }> {
  return apiFetch("/api/notifications");
}

// ─── Locations API ──────────────────────────────────────────────────

export interface BackendLocation {
  id: string;
  name: string;
  description: string;
  category: string;
  building: string | null;
  floor: string | null;
  roomNumber: string | null;
  latitude: number;
  longitude: number;
}

export async function getLocations() {
  return apiFetch<ApiListResponse<BackendLocation>>("/api/locations");
}

// ─── QR Codes API ───────────────────────────────────────────────────

export interface BackendQrCode {
  id: string;
  token: string;
  type: string;
  active: boolean;
  userId: string;
  createdAt: string;
}

export async function getQrCodes(params?: Record<string, string>) {
  return apiFetch<ApiListResponse<BackendQrCode>>("/api/qr", { params });
}

// ─── Presence API ──────────────────────────────────────────────────

export interface BackendPresence {
  userId: string;
  user: { id: string; firstName: string; lastName: string; email: string; role: string; department: string };
  status: "ACTIVE" | "BUSY" | "OFFLINE";
  statusLabel: string;
  statusNote: string | null;
  lastSeen: string;
  lastHeartbeat: string;
}

export async function getMyPresence() {
  return apiFetch<{ success: boolean; data: BackendPresence }>("/api/presence/me");
}

export async function getUserPresence(userId: string) {
  return apiFetch<{ success: boolean; data: BackendPresence }>(`/api/presence/${userId}`);
}

export async function getAllPresence() {
  return apiFetch<{ success: boolean; data: BackendPresence[] }>("/api/presence");
}

export async function sendHeartbeat() {
  return apiFetch<{ success: boolean; data: BackendPresence }>("/api/presence/heartbeat", { method: "POST" });
}

export async function setPresenceStatus(status: "ACTIVE" | "BUSY", statusNote?: string) {
  return apiFetch<{ success: boolean; data: BackendPresence }>("/api/presence/status", {
    method: "PATCH",
    body: JSON.stringify({ status, statusNote }),
    headers: { "Content-Type": "application/json" },
  });
}

// ─── Places API ────────────────────────────────────────────────────

export interface BackendPlace {
  id: string;
  name: string;
  code: string;
  description: string | null;
  type: string;
  latitude: number | null;
  longitude: number | null;
  capacity: number;
  currentOccupancy: number;
  status: "AVAILABLE" | "BUSY" | "FULL" | "CLOSED";
  statusLabel: string;
  occupancyPercentage: number;
}

export async function getPlaces(params?: Record<string, string>) {
  return apiFetch<{ success: boolean; data: BackendPlace[] }>("/api/places", { params });
}

export async function getPlaceById(id: string) {
  return apiFetch<{ success: boolean; data: BackendPlace }>(`/api/places/${id}`);
}

export async function getPlaceByCode(code: string) {
  return apiFetch<{ success: boolean; data: BackendPlace }>(`/api/places/code/${code}`);
}
