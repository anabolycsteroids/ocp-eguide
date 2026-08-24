export type VisitStatus = "PENDING" | "APPROVED" | "ARRIVED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export interface GuestVisit {
  id: string;
  purpose: string;
  status: VisitStatus;
  scheduledDate: string;
  scheduledTime: string | null;
  checkedInAt: string | null;
  checkedOutAt: string | null;
  notes: string | null;
  guestToken?: string;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  host: {
    id: string;
    firstName: string;
    lastName: string;
    department: string;
    position: string | null;
    email?: string;
  };
  place: {
    id: string;
    name: string;
    code: string;
    capacity: number;
    currentOccupancy: number;
    status: string;
  } | null;
  qrCode: {
    id: string;
    token: string;
  } | null;
}

export interface HostPresence {
  userId: string;
  user: { id: string; firstName: string; lastName: string; email: string; role: string; department: string };
  status: string;
  statusLabel: string;
  statusNote: string | null;
  lastSeen: string;
  lastHeartbeat: string;
}

export interface GuestNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export interface GuestVisitNotification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}
