import { getAccessToken } from "./api";
import type { GuestVisit, HostPresence, GuestNotification } from "@/types/guest";

function resolveApiBase(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl) return envUrl;
  if (typeof window !== "undefined") {
    return `${window.location.protocol}//${window.location.hostname}:5000`;
  }
  return "http://localhost:5000";
}

const API_BASE = resolveApiBase();

interface GuestApiOptions extends RequestInit {
  params?: Record<string, string>;
}

async function guestFetch<T>(endpoint: string, options: GuestApiOptions = {}): Promise<T> {
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

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: { message: "Request failed" } }));
    throw new Error(err.error?.message || `HTTP ${res.status}`);
  }

  return res.json();
}

// ─── Visits ─────────────────────────────────────────────────────────

export async function getGuestVisits(): Promise<{ success: boolean; data: GuestVisit[] }> {
  return guestFetch("/api/guest/visits");
}

export async function getActiveVisit(): Promise<{ success: boolean; data: GuestVisit | null }> {
  return guestFetch("/api/guest/visit/active");
}

export async function getVisitById(id: string): Promise<{ success: boolean; data: GuestVisit }> {
  return guestFetch(`/api/guest/visit/${id}`);
}

export interface CreateVisitInput {
  purpose: string;
  hostId: string;
  placeId?: string;
  scheduledDate: string;
  scheduledTime?: string;
  notes?: string;
}

export async function createVisit(data: CreateVisitInput): Promise<{ success: boolean; data: GuestVisit }> {
  return guestFetch("/api/guest/visit", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function checkIn(visitId: string): Promise<{ success: boolean; data: GuestVisit }> {
  return guestFetch(`/api/guest/visit/${visitId}/check-in`, { method: "POST" });
}

export async function checkOut(visitId: string): Promise<{ success: boolean; data: GuestVisit }> {
  return guestFetch(`/api/guest/visit/${visitId}/check-out`, { method: "POST" });
}

// ─── Host Presence ──────────────────────────────────────────────────

export async function getHostPresence(hostId: string): Promise<{ success: boolean; data: HostPresence }> {
  return guestFetch(`/api/guest/host/${hostId}/presence`);
}

// ─── Host Search ────────────────────────────────────────────────────

export interface HostSearchResult {
  id: string;
  name: string;
  email: string;
  department: string;
  profile: string;
}

export async function searchHosts(query: string): Promise<{ success: boolean; data: HostSearchResult[] }> {
  return guestFetch(`/api/guest/hosts/search?q=${encodeURIComponent(query)}`);
}

// ─── Notifications ──────────────────────────────────────────────────

export async function getGuestNotifications(): Promise<{ success: boolean; data: GuestNotification[] }> {
  return guestFetch("/api/guest/notifications");
}

// ─── QR Access ──────────────────────────────────────────────────────

export interface VisitQrData {
  id: string;
  token: string;
  imageUrl?: string | null;
}

export async function generateVisitQr(visitId: string): Promise<{ success: boolean; data: VisitQrData }> {
  return guestFetch(`/api/guest/visit/${visitId}/qr`, { method: "POST" });
}

// ─── Public Guest API (no auth) ─────────────────────────────────────

export interface PublicCreateVisitInput {
  purpose: string;
  hostId: string;
  placeId?: string;
  scheduledDate: string;
  scheduledTime?: string;
  notes?: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
}

export async function publicCreateVisit(data: PublicCreateVisitInput): Promise<{ success: boolean; data: GuestVisit }> {
  return guestFetch("/api/guest-public/visit", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function publicGetVisit(guestToken: string): Promise<{ success: boolean; data: GuestVisit }> {
  return guestFetch(`/api/guest-public/visit/${guestToken}`);
}

export async function publicGenerateQr(visitId: string): Promise<{ success: boolean; data: { id: string; token: string; qrCodeImage: string } }> {
  return guestFetch(`/api/guest-public/visit/${visitId}/qr`, { method: "POST" });
}

export async function publicGetHostPresence(hostId: string): Promise<{ success: boolean; data: HostPresence }> {
  return guestFetch(`/api/guest-public/host/${hostId}/presence`);
}

export async function publicSearchHosts(query: string): Promise<{ success: boolean; data: HostSearchResult[] }> {
  return guestFetch(`/api/guest-public/hosts/search?q=${encodeURIComponent(query)}`);
}

export async function publicGetPlaces(): Promise<{ success: boolean; data: any[] }> {
  return guestFetch("/api/guest-public/places");
}
