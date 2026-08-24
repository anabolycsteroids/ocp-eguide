const BASE_URL = "http://localhost:5000";

async function api(method: string, path: string, body?: any, token?: string) {
  const headers: any = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, data: await res.json() as any };
}

describe("Auth API", () => {
  let accessToken = "";
  let refreshToken = "";

  test("register a new user", async () => {
    const res = await api("POST", "/api/auth/register", {
      firstName: "Test", lastName: "User",
      email: `test${Date.now()}@ocp.ma`, password: "Password123!",
    });
    expect(res.status).toBe(201);
    expect(res.data.success).toBe(true);
    expect(res.data.data.accessToken).toBeDefined();
    expect(res.data.data.refreshToken).toBeDefined();
    accessToken = res.data.data.accessToken;
    refreshToken = res.data.data.refreshToken;
  });

  test("reject duplicate email", async () => {
    const email = `dup${Date.now()}@ocp.ma`;
    await api("POST", "/api/auth/register", { firstName: "A", lastName: "B", email, password: "Password123!" });
    const res = await api("POST", "/api/auth/register", { firstName: "A", lastName: "B", email, password: "Password123!" });
    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  test("login with valid credentials", async () => {
    const res = await api("POST", "/api/auth/login", { email: "imrane.belkoufa@ocp.ma", password: "imrane123" });
    expect(res.status).toBe(200);
    expect(res.data.data.accessToken).toBeDefined();
    accessToken = res.data.data.accessToken;
  });

  test("reject invalid password", async () => {
    const res = await api("POST", "/api/auth/login", { email: "imrane.belkoufa@ocp.ma", password: "WrongPassword" });
    expect(res.status).toBe(401);
  });

  test("refresh tokens", async () => {
    const loginRes = await api("POST", "/api/auth/login", { email: "imrane.belkoufa@ocp.ma", password: "imrane123" });
    const rt = loginRes.data.data.refreshToken;
    const res = await api("POST", "/api/auth/refresh", { refreshToken: rt });
    expect(res.status).toBe(200);
    expect(res.data.data.accessToken).toBeDefined();
  });

  test("get current user with valid token", async () => {
    const loginRes = await api("POST", "/api/auth/login", { email: "imrane.belkoufa@ocp.ma", password: "imrane123" });
    const token = loginRes.data.data.accessToken;
    const res = await api("GET", "/api/auth/me", undefined, token);
    expect(res.status).toBe(200);
    expect(res.data.data.email).toBe("imrane.belkoufa@ocp.ma");
  });

  test("reject without token", async () => {
    const res = await api("GET", "/api/auth/me");
    expect(res.status).toBe(401);
  });

  test("logout", async () => {
    const loginRes = await api("POST", "/api/auth/login", { email: "imrane.belkoufa@ocp.ma", password: "imrane123" });
    const token = loginRes.data.data.accessToken;
    const res = await api("POST", "/api/auth/logout", undefined, token);
    expect(res.status).toBe(200);
  });
});

describe("Role-Based Authorization", () => {
  let internToken = "";
  let adminToken = "";

  beforeAll(async () => {
    const i = await api("POST", "/api/auth/login", { email: "amine.benaloun.intern@ocp.ma", password: "amine123" });
    internToken = i.data.data.accessToken;
    const a = await api("POST", "/api/auth/login", { email: "imrane.belkoufa@ocp.ma", password: "imrane123" });
    adminToken = a.data.data.accessToken;
  });

  test("INTERN cannot access /api/users", async () => {
    const res = await api("GET", "/api/users", undefined, internToken);
    expect(res.status).toBe(403);
  });

  test("ADMIN can access /api/users", async () => {
    const res = await api("GET", "/api/users", undefined, adminToken);
    expect(res.status).toBe(200);
    expect(res.data.success).toBe(true);
  });
});

describe("Employee Status", () => {
  let token = "";

  beforeAll(async () => {
    const r = await api("POST", "/api/auth/login", { email: "imrane.belkoufa@ocp.ma", password: "imrane123" });
    token = r.data.data.accessToken;
  });

  test("get employees", async () => {
    const res = await api("GET", "/api/users/employees", undefined, token);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.data.employees)).toBe(true);
  });

  test("update employee status", async () => {
    const list = await api("GET", "/api/users/employees", undefined, token);
    const id = list.data.employees[0].id;
    const res = await api("PATCH", `/api/users/employees/${id}/status`, { status: "BUSY" }, token);
    expect(res.status).toBe(200);
    expect(res.data.data.status).toBe("BUSY");
  });
});

describe("Internship API", () => {
  let adminToken = "";
  let internshipId = "";

  beforeAll(async () => {
    const r = await api("POST", "/api/auth/login", { email: "imrane.belkoufa@ocp.ma", password: "imrane123" });
    adminToken = r.data.data.accessToken;
  });

  test("get internships", async () => {
    const res = await api("GET", "/api/internships", undefined, adminToken);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.data.internships)).toBe(true);
    internshipId = res.data.internships[0].id;
  });

  test("get specific internship", async () => {
    const res = await api("GET", `/api/internships/${internshipId}`, undefined, adminToken);
    expect(res.status).toBe(200);
    expect(res.data.data.id).toBe(internshipId);
  });

  test("get internship progress", async () => {
    const res = await api("GET", `/api/internships/${internshipId}/progress`, undefined, adminToken);
    expect(res.status).toBe(200);
    expect(res.data.data).toHaveProperty("percentage");
  });
});

describe("Task API", () => {
  let adminToken = "";

  beforeAll(async () => {
    const r = await api("POST", "/api/auth/login", { email: "imrane.belkoufa@ocp.ma", password: "imrane123" });
    adminToken = r.data.data.accessToken;
  });

  test("get tasks", async () => {
    const res = await api("GET", "/api/tasks", undefined, adminToken);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.data.tasks)).toBe(true);
  });
});

describe("Request API", () => {
  let internToken = "";
  let adminToken = "";

  beforeAll(async () => {
    const i = await api("POST", "/api/auth/login", { email: "amine.benaloun.intern@ocp.ma", password: "amine123" });
    internToken = i.data.data.accessToken;
    const a = await api("POST", "/api/auth/login", { email: "imrane.belkoufa@ocp.ma", password: "imrane123" });
    adminToken = a.data.data.accessToken;
  });

  test("create request", async () => {
    const res = await api("POST", "/api/requests", {
      type: "GENERAL_REQUEST", title: "Test request", description: "Testing"
    }, internToken);
    expect(res.status).toBe(201);
    expect(res.data.data.title).toBe("Test request");
  });

  test("get requests", async () => {
    const res = await api("GET", "/api/requests", undefined, internToken);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.data.requests)).toBe(true);
  });

  test("approve request as admin", async () => {
    const list = await api("GET", "/api/requests", undefined, internToken);
    const pending = list.data.requests.find((r: any) => r.status === "PENDING");
    if (!pending) return;
    const res = await api("PATCH", `/api/requests/${pending.id}`, { status: "APPROVED", response: "Approved" }, adminToken);
    expect(res.status).toBe(200);
    expect(res.data.data.status).toBe("APPROVED");
  });
});

describe("Notification API", () => {
  let token = "";

  beforeAll(async () => {
    const r = await api("POST", "/api/auth/login", { email: "amine.benaloun.intern@ocp.ma", password: "amine123" });
    token = r.data.data.accessToken;
  });

  test("get notifications", async () => {
    const res = await api("GET", "/api/notifications", undefined, token);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.data.notifications)).toBe(true);
  });

  test("mark notification read", async () => {
    const list = await api("GET", "/api/notifications", undefined, token);
    const unread = list.data.notifications.find((n: any) => !n.read);
    if (!unread) return;
    const res = await api("PATCH", `/api/notifications/${unread.id}/read`, undefined, token);
    expect(res.status).toBe(200);
  });

  test("mark all as read", async () => {
    const res = await api("PATCH", "/api/notifications/read-all", undefined, token);
    expect(res.status).toBe(200);
  });
});

describe("Location API", () => {
  let token = "";

  beforeAll(async () => {
    const r = await api("POST", "/api/auth/login", { email: "imrane.belkoufa@ocp.ma", password: "imrane123" });
    token = r.data.data.accessToken;
  });

  test("get locations", async () => {
    const res = await api("GET", "/api/locations", undefined, token);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.data.locations)).toBe(true);
  });

  test("create location", async () => {
    const res = await api("POST", "/api/locations", {
      name: "Test Lab", category: "FACILITY", building: "Building X"
    }, token);
    expect(res.status).toBe(201);
  });
});

describe("QR Code API", () => {
  let token = "";

  beforeAll(async () => {
    const r = await api("POST", "/api/auth/login", { email: "imrane.belkoufa@ocp.ma", password: "imrane123" });
    token = r.data.data.accessToken;
  });

  test("generate QR code", async () => {
    const res = await api("POST", "/api/qr/generate", { type: "VISITOR_CHECKIN" }, token);
    expect(res.status).toBe(201);
    expect(res.data.data.qrCodeImage).toBeDefined();
  });
});

describe("Health Check", () => {
  test("GET /api/health", async () => {
    const res = await api("GET", "/api/health");
    expect(res.status).toBe(200);
    expect(res.data.success).toBe(true);
  });
});
