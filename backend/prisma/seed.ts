import { PrismaClient, UserRole, Department, UserStatus, UserAccountStatus, InternshipStatus, TaskStatus, TaskPriority, RequestType, RequestStatus, NotificationType, LocationCategory, Internship } from "@prisma/client";
import argon2 from "argon2";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password);
}

// ─── Profile Definitions ──────────────────────────────────────────
// One record per frontend composite role. slug = canonical identity.
// emailSlug = the part inserted into email: {prefix}.{emailSlug}@ocp.ma
// If emailSlug is null, email is {prefix}@ocp.ma (admin only).

const PROFILE_DEFS = [
  { slug: "employee-management",   name: "Management",            emailSlug: "management",       category: "employee", department: "MANAGEMENT",      dashboardRoute: "/dashboard" },
  { slug: "employee-reception",    name: "Reception",             emailSlug: "reception",        category: "employee", department: "RECEPTION",       dashboardRoute: "/dashboard/reception" },
  { slug: "employee-hr",           name: "Human Resources",       emailSlug: "hr",               category: "employee", department: "HUMAN_RESOURCES",  dashboardRoute: "/dashboard/hr" },
  { slug: "employee-it",           name: "IT Management",         emailSlug: "it",               category: "employee", department: "IT",              dashboardRoute: "/dashboard/it-security" },
  { slug: "employee-security",     name: "Security",              emailSlug: "security",         category: "employee", department: "SECURITY",        dashboardRoute: "/dashboard/security" },
  { slug: "intern-mechanical",     name: "Mechanical Engineering", emailSlug: "mechanical",      category: "intern", department: "ENGINEERING", dashboardRoute: "/dashboard/intern/mechanical-engineering" },
  { slug: "intern-chemical",       name: "Chemical Engineering",  emailSlug: "chemical",         category: "intern", department: "ENGINEERING", dashboardRoute: "/dashboard/intern/chemical-engineering" },
  { slug: "intern-electrical",     name: "Electrical Engineering", emailSlug: "electrical",      category: "intern", department: "ENGINEERING", dashboardRoute: "/dashboard/intern/electrical-engineering" },
  { slug: "intern-civil",          name: "Civil Engineering",     emailSlug: "civil",            category: "intern", department: "ENGINEERING", dashboardRoute: "/dashboard/intern/civil-engineering" },
  { slug: "intern-industrial",     name: "Industrial Engineering", emailSlug: "industrial",      category: "intern", department: "ENGINEERING", dashboardRoute: "/dashboard/intern/industrial-engineering" },
  { slug: "intern-hse",            name: "HSE",                   emailSlug: "hse",              category: "intern", department: "SECURITY",        dashboardRoute: "/dashboard/intern/hse" },
  { slug: "intern-environmental",  name: "Environmental Science", emailSlug: "environmental",    category: "intern", department: "RESEARCH",    dashboardRoute: "/dashboard/intern/environmental-science" },
  { slug: "intern-computer-science", name: "Computer Science",    emailSlug: "computer",         category: "intern", department: "IT",              dashboardRoute: "/dashboard/intern/computer-science" },
  { slug: "visitor-client",        name: "Client",                emailSlug: "client",           category: "visitor", department: null,              dashboardRoute: "/dashboard/visitor" },
  { slug: "visitor-delivery",      name: "Delivery",              emailSlug: "delivery",         category: "visitor", department: null,              dashboardRoute: "/dashboard/visitor/delivery" },
  { slug: "visitor-partner",       name: "Partner",               emailSlug: "partner",          category: "visitor", department: null,              dashboardRoute: "/dashboard/visitor/partner" },
  { slug: "visitor-supplier",      name: "Supplier",              emailSlug: "supplier",         category: "visitor", department: null,              dashboardRoute: "/dashboard/visitor/supplier" },
  { slug: "visitor-collaborator",  name: "Collaborator",          emailSlug: "collaborator",     category: "visitor", department: null,              dashboardRoute: "/dashboard/visitor/collaborator" },
  { slug: "visitor-contractor",    name: "Contractor",            emailSlug: "contractor",       category: "visitor", department: null,              dashboardRoute: "/dashboard/visitor/contractor" },
];

// ─── User-to-Profile Assignments ──────────────────────────────────
// Each person gets multiple profiles. email is derived from
// {firstName.lower}.{lastName.lower}.{profile.emailSlug}@ocp.ma
// Password is {firstName.lower}123

const PEOPLE = [
  { firstName: "Imrane",  lastName: "Belkoufa",     password: "imrane123" },
  { firstName: "Fouad",   lastName: "Ed-Dahdaoui",  password: "fouad123" },
  { firstName: "Imane",   lastName: "El Mansouri",   password: "imane123" },
  { firstName: "Amine",   lastName: "Benaloun",      password: "amine123" },
];

function emailPrefix(p: typeof PEOPLE[0]): string {
  return `${p.firstName.toLowerCase()}.${p.lastName.toLowerCase().replace(/\s+/g, "")}`;
}

function buildEmail(prefix: string, emailSlug: string): string {
  return `${prefix}.${emailSlug}@ocp.ma`;
}

const DEPARTMENT_TITLES: Record<string, string> = {
  MANAGEMENT: "Director",
  HUMAN_RESOURCES: "HR Manager",
  IT: "IT Specialist",
  SECURITY: "Security Officer",
  ENGINEERING: "Senior Engineer",
  RECEPTION: "Receptionist",
  FINANCE: "Financial Analyst",
  MAINTENANCE: "Maintenance Supervisor",
  LOGISTICS: "Logistics Coordinator",
  LEGAL: "Legal Advisor",
  COMMUNICATION: "Communications Officer",
  RESEARCH: "Research Lead",
  OTHER: "Staff",
};

const INTERNSHIP_DATA = [
  { personIdx: 0, profileSlug: "intern-mechanical",     title: "Process Control Software Development", description: "Develop automated monitoring tools for phosphate processing plants", status: "ACTIVE" as const, dept: "ENGINEERING" as Department, objectives: "Build a real-time dashboard for monitoring plant sensors" },
  { personIdx: 1, profileSlug: "intern-chemical",        title: "Chemical Process Optimization", description: "Optimize chemical processing parameters for efficiency", status: "ACTIVE" as const, dept: "ENGINEERING" as Department, objectives: "Reduce waste by 15% through process analysis" },
  { personIdx: 2, profileSlug: "intern-electrical",      title: "Power Systems Monitoring", description: "Monitor and report on electrical infrastructure", status: "PLANNED" as const, dept: "ENGINEERING" as Department, objectives: "Create automated alert system for power anomalies" },
  { personIdx: 3, profileSlug: "intern-civil",           title: "Infrastructure Assessment", description: "Assess building structural integrity", status: "ACTIVE" as const, dept: "ENGINEERING" as Department, objectives: "Complete safety audit of Buildings A-E" },
  { personIdx: 0, profileSlug: "intern-industrial",      title: "Operations Efficiency Study", description: "Analyze industrial workflows for optimization", status: "PLANNED" as const, dept: "ENGINEERING" as Department, objectives: "Map all current workflows and identify bottlenecks" },
  { personIdx: 1, profileSlug: "intern-hse",             title: "Safety Compliance Audit", description: "Audit workplace safety compliance", status: "ACTIVE" as const, dept: "SECURITY" as Department, objectives: "Complete OSHA compliance checklist for all facilities" },
  { personIdx: 2, profileSlug: "intern-environmental",   title: "Environmental Impact Analysis", description: "Measure and report on environmental metrics", status: "PLANNED" as const, dept: "RESEARCH" as Department, objectives: "Establish baseline environmental metrics for all sites" },
  { personIdx: 3, profileSlug: "intern-computer-science", title: "IT Helpdesk Automation", description: "Build automated ticketing and resolution system", status: "ACTIVE" as const, dept: "IT" as Department, objectives: "Reduce average ticket resolution time by 30%" },
];

const LOCATION_DATA = [
  { name: "Main Reception", description: "Main building reception area", category: "RECEPTION" as const, building: "Building A", floor: "1", roomNumber: "R001", latitude: 34.0331, longitude: -5.0003 },
  { name: "HR Department", description: "Human Resources office", category: "DEPARTMENT" as const, building: "Building A", floor: "2", roomNumber: "201", latitude: 34.0332, longitude: -5.0004 },
  { name: "IT Department", description: "IT operations center", category: "DEPARTMENT" as const, building: "Building B", floor: "3", roomNumber: "301", latitude: 34.0333, longitude: -5.0005 },
  { name: "Engineering Lab", description: "Process engineering laboratory", category: "FACILITY" as const, building: "Building C", floor: "1", roomNumber: "L001", latitude: 34.0334, longitude: -5.0006 },
  { name: "Management Office", description: "Executive management offices", category: "OFFICE" as const, building: "Building A", floor: "4", roomNumber: "401", latitude: 34.0335, longitude: -5.0007 },
  { name: "Main Mosque", description: "Prayer room and mosque", category: "MOSQUE" as const, building: "Building D", floor: "1", roomNumber: "M001", latitude: 34.0336, longitude: -5.0008 },
  { name: "Visitor Parking", description: "Parking area for visitors", category: "PARKING" as const, building: null, latitude: 34.0330, longitude: -5.0010 },
  { name: "Security Control Room", description: "Main security monitoring center", category: "SAFETY" as const, building: "Building A", floor: "1", roomNumber: "S001", latitude: 34.0331, longitude: -5.0002 },
  { name: "Conference Room A", description: "Large meeting room for 20 people", category: "FACILITY" as const, building: "Building A", floor: "3", roomNumber: "301", latitude: 34.0332, longitude: -5.0003 },
  { name: "Cafeteria", description: "Employee cafeteria and break area", category: "FACILITY" as const, building: "Building D", floor: "1", roomNumber: "C001", latitude: 34.0337, longitude: -5.0009 },
  { name: "Finance Department", description: "Financial operations office", category: "DEPARTMENT" as const, building: "Building A", floor: "3", roomNumber: "305", latitude: 34.0333, longitude: -5.0005 },
  { name: "Maintenance Workshop", description: "Equipment maintenance area", category: "FACILITY" as const, building: "Building E", floor: "1", roomNumber: "W001", latitude: 34.0338, longitude: -5.0011 },
  { name: "Logistics Warehouse", description: "Supply chain and logistics hub", category: "FACILITY" as const, building: "Building F", floor: "1", roomNumber: "WH01", latitude: 34.0339, longitude: -5.0012 },
  { name: "Legal Office", description: "Legal affairs department", category: "DEPARTMENT" as const, building: "Building A", floor: "4", roomNumber: "405", latitude: 34.0334, longitude: -5.0006 },
  { name: "Communication Center", description: "Media and communications", category: "DEPARTMENT" as const, building: "Building B", floor: "2", roomNumber: "202", latitude: 34.0335, longitude: -5.0007 },
  { name: "Research Center", description: "Research and development labs", category: "FACILITY" as const, building: "Building C", floor: "2", roomNumber: "R101", latitude: 34.0336, longitude: -5.0008 },
];

async function main() {
  console.log("Seeding database with profile-based identity system...\n");

  // Clean existing data
  await prisma.placeOccupancy.deleteMany();
  await prisma.place.deleteMany();
  await prisma.presence.deleteMany();
  await prisma.qrCode.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.document.deleteMany();
  await prisma.request.deleteMany();
  await prisma.task.deleteMany();
  await prisma.internshipProgress.deleteMany();
  await prisma.internship.deleteMany();
  await prisma.internProfile.deleteMany();
  await prisma.supervisorProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.location.deleteMany();

  console.log("Database cleaned.");

  // ─── PHASE 1: Create Profiles ──────────────────────────────────

  const profileMap: Record<string, { id: string; slug: string; emailSlug: string | null; category: string; department: string | null }> = {};

  for (const def of PROFILE_DEFS) {
    const profile = await prisma.profile.create({
      data: {
        name: def.name,
        slug: def.slug,
        emailSlug: def.emailSlug,
        category: def.category,
        department: def.department,
        dashboardRoute: def.dashboardRoute,
        active: true,
      },
    });
    profileMap[def.slug] = { id: profile.id, slug: profile.slug, emailSlug: profile.emailSlug, category: profile.category, department: profile.department };
  }

  console.log(`Created ${PROFILE_DEFS.length} profiles.`);

  // ─── PHASE 2: Create Users (one per person×profile) ────────────

  const userByEmail: Record<string, { id: string; firstName: string; lastName: string; profileSlug: string; role: string }> = {};
  const profileRoles: Record<string, string> = {
    "employee-management": "ADMIN",
    "employee-reception": "EMPLOYEE",
    "employee-hr": "EMPLOYEE",
    "employee-it": "EMPLOYEE",
    "employee-security": "EMPLOYEE",
  };

  const phoneNumbers = ["+212 6XX XXX 0001", "+212 6XX XXX 0002", "+212 6XX XXX 0003", "+212 6XX XXX 0004"];

  // Create ALL 4 people × ALL 19 profiles = 76 users
  const assignments: { personIdx: number; profileSlug: string; position: string }[] = [];

  const profilePositions: Record<string, string> = {
    "employee-management": "Director",
    "employee-reception": "Receptionist",
    "employee-hr": "HR Manager",
    "employee-it": "IT Specialist",
    "employee-security": "Security Officer",
    "intern-mechanical": "Intern",
    "intern-chemical": "Intern",
    "intern-electrical": "Intern",
    "intern-civil": "Intern",
    "intern-industrial": "Intern",
    "intern-hse": "Intern",
    "intern-environmental": "Intern",
    "intern-computer-science": "Intern",
    "visitor-client": "Client",
    "visitor-delivery": "Delivery Coordinator",
    "visitor-partner": "Partner Representative",
    "visitor-supplier": "Supplier Representative",
    "visitor-collaborator": "External Collaborator",
    "visitor-contractor": "Service Provider",
  };

  for (let pIdx = 0; pIdx < PEOPLE.length; pIdx++) {
    for (const def of PROFILE_DEFS) {
      assignments.push({
        personIdx: pIdx,
        profileSlug: def.slug,
        position: profilePositions[def.slug],
      });
    }
  }

  for (const a of assignments) {
    const person = PEOPLE[a.personIdx];
    const profile = profileMap[a.profileSlug];
    const prefix = emailPrefix(person);
    const email = buildEmail(prefix, profile.emailSlug);
    const role = (profileRoles[a.profileSlug] || (profile.category === "intern" ? "INTERN" : profile.category === "visitor" ? "VISITOR" : "EMPLOYEE")) as UserRole;
    const department = (profile.department || "OTHER") as Department;
    const hash = await hashPassword(person.password);

    const user = await prisma.user.create({
      data: {
        firstName: person.firstName,
        lastName: person.lastName,
        email,
        passwordHash: hash,
        role,
        department,
        position: a.position,
        phone: phoneNumbers[a.personIdx],
        status: a.personIdx % 2 === 0 ? "ONLINE" : "OFFLINE",
        accountStatus: "ACTIVE",
        profileId: profile.id,
      },
    });

    userByEmail[email] = { id: user.id, firstName: user.firstName, lastName: user.lastName, profileSlug: a.profileSlug, role };
  }

  console.log(`Created ${Object.keys(userByEmail).length} users (one per profile).`);

  // ─── PHASE 3: Supervisor Relationships ─────────────────────────

  const supMap: Record<string, string> = {};
  supMap["employee-management"] = userByEmail[buildEmail(emailPrefix(PEOPLE[0]), profileMap["employee-management"].emailSlug)].id;
  supMap["employee-reception"] = userByEmail[buildEmail(emailPrefix(PEOPLE[0]), profileMap["employee-reception"].emailSlug)].id;
  supMap["employee-it"] = userByEmail[buildEmail(emailPrefix(PEOPLE[1]), profileMap["employee-it"].emailSlug)].id;
  supMap["employee-hr"] = userByEmail[buildEmail(emailPrefix(PEOPLE[2]), profileMap["employee-hr"].emailSlug)].id;
  supMap["employee-security"] = userByEmail[buildEmail(emailPrefix(PEOPLE[3]), profileMap["employee-security"].emailSlug)].id;

  // Map intern profiles to their supervisors
  const internSupervisorMap: Record<string, string> = {
    "intern-mechanical": supMap["employee-management"],
    "intern-industrial": supMap["employee-management"],
    "intern-chemical": supMap["employee-it"],
    "intern-hse": supMap["employee-it"],
    "intern-electrical": supMap["employee-hr"],
    "intern-environmental": supMap["employee-hr"],
    "intern-civil": supMap["employee-security"],
    "intern-computer-science": supMap["employee-security"],
  };

  for (const [internSlug, supId] of Object.entries(internSupervisorMap)) {
    const internAssignment = assignments.find(a => a.profileSlug === internSlug)!;
    const person = PEOPLE[internAssignment.personIdx];
    const prefix = emailPrefix(person);
    const email = buildEmail(prefix, profileMap[internSlug].emailSlug);
    const internId = userByEmail[email].id;
    await prisma.user.update({ where: { id: internId }, data: { supervisorId: supId } });
  }

  console.log("Supervisor relationships set.");

  // ─── PHASE 4: Intern & Supervisor Profiles ─────────────────────

  const universities = ["Mohammed V University", "Al Akhawayn University", "ENCG Kenitra", "ENSAM Casablanca"];
  const majors = ["Computer Engineering", "Information Technology", "Human Resource Management", "Industrial Engineering"];

  for (let i = 0; i < PEOPLE.length; i++) {
    const person = PEOPLE[i];
    const prefix = emailPrefix(person);

    // Intern profile for each person's intern user
    const internSlugs = assignments.filter(a => a.personIdx === i && a.profileSlug.startsWith("intern-")).map(a => a.profileSlug);
    for (const slug of internSlugs) {
      const email = buildEmail(prefix, profileMap[slug].emailSlug);
      const userId = userByEmail[email].id;
      const supId = internSupervisorMap[slug];

      await prisma.internProfile.create({
        data: {
          userId,
          university: universities[i],
          major: majors[i],
          educationLevel: i % 2 === 0 ? "Master's" : "Bachelor's",
          startDate: new Date(`2026-0${6 + i}-01`),
          endDate: new Date(`2026-${9 + i > 12 ? 12 : 9 + i}-30`),
          mentorId: supId,
        },
      });
    }

    // Supervisor profile for each person's employee user
    const empSlugs = assignments.filter(a => a.personIdx === i && a.profileSlug.startsWith("employee-")).map(a => a.profileSlug);
    for (const slug of empSlugs) {
      const email = buildEmail(prefix, profileMap[slug].emailSlug);
      if (userByEmail[email]) {
        const userId = userByEmail[email].id;
        const existing = await prisma.supervisorProfile.findUnique({ where: { userId } });
        if (!existing) {
          await prisma.supervisorProfile.create({
            data: {
              userId,
              maxInterns: 5,
              specializations: DEPARTMENT_TITLES[profileMap[slug].department || "OTHER"],
              bio: `Experienced ${DEPARTMENT_TITLES[profileMap[slug].department || "OTHER"]} at OCP Group`,
            },
          });
        }
      }
    }
  }

  console.log("Intern and supervisor profiles created.");

  // ─── PHASE 5: Internships ──────────────────────────────────────

  const internshipIds: string[] = [];

  for (const data of INTERNSHIP_DATA) {
    const person = PEOPLE[data.personIdx];
    const prefix = emailPrefix(person);
    const email = buildEmail(prefix, profileMap[data.profileSlug].emailSlug);
    const internId = userByEmail[email].id;
    const supId = internSupervisorMap[data.profileSlug];

    const internship = await prisma.internship.create({
      data: {
        title: data.title,
        description: data.description,
        status: data.status,
        startDate: new Date("2026-07-01"),
        endDate: new Date("2026-09-30"),
        department: data.dept,
        objectives: data.objectives,
        internId,
        supervisorId: supId,
      },
    });
    internshipIds.push(internship.id);

    await prisma.internshipProgress.create({
      data: {
        internshipId: internship.id,
        completedTasks: Math.floor(Math.random() * 6),
        totalTasks: 8 + Math.floor(Math.random() * 5),
        percentage: Math.floor(Math.random() * 80) + 10,
        currentModule: "Core Training",
        totalModules: 8,
        completedModules: Math.floor(Math.random() * 5) + 1,
      },
    });
  }

  console.log(`Created ${internshipIds.length} internships with progress.`);

  // ─── PHASE 6: Tasks ────────────────────────────────────────────

  const taskTemplates = [
    { title: "Set up development environment", description: "Install all required tools and configure workspace", status: "COMPLETED" as const, priority: "HIGH" as const },
    { title: "Study API documentation", description: "Read and understand the system API", status: "COMPLETED" as const, priority: "MEDIUM" as const },
    { title: "Design wireframes", description: "Create initial wireframes", status: "COMPLETED" as const, priority: "MEDIUM" as const },
    { title: "Implement core module", description: "Build the main feature component", status: "IN_PROGRESS" as const, priority: "HIGH" as const },
    { title: "Write unit tests", description: "Create comprehensive test suite", status: "TODO" as const, priority: "MEDIUM" as const },
    { title: "Code review preparation", description: "Prepare code for supervisor review", status: "TODO" as const, priority: "HIGH" as const },
    { title: "Documentation update", description: "Update project documentation", status: "IN_PROGRESS" as const, priority: "LOW" as const },
    { title: "Final presentation", description: "Prepare internship final presentation", status: "TODO" as const, priority: "URGENT" as const },
  ];

  for (const internshipId of internshipIds) {
    for (const tmpl of taskTemplates) {
      const internship = await prisma.internship.findUnique({ where: { id: internshipId } });
      if (!internship) continue;
      await prisma.task.create({
        data: {
          title: tmpl.title,
          description: tmpl.description,
          status: tmpl.status,
          priority: tmpl.priority,
          internshipId,
          assigneeId: internship.internId,
          creatorId: internship.supervisorId,
          dueDate: new Date(Date.now() + Math.random() * 60 * 24 * 60 * 60 * 1000),
          completedAt: tmpl.status === "COMPLETED" ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) : null,
        },
      });
    }
  }

  console.log(`Created ${await prisma.task.count()} tasks.`);

  // ─── PHASE 7: Requests ─────────────────────────────────────────

  const internUserIds = INTERNSHIP_DATA.map(d => {
    const person = PEOPLE[d.personIdx];
    const prefix = emailPrefix(person);
    return userByEmail[buildEmail(prefix, profileMap[d.profileSlug].emailSlug)].id;
  });

  const requestTemplates: { type: RequestType; title: string; description: string; status: RequestStatus; responderIdx: number }[] = [
    { type: "DOCUMENT_REQUEST", title: "Internship certificate request", description: "Need official internship certificate for university", status: "PENDING", responderIdx: 0 },
    { type: "ACCESS_REQUEST", title: "Server room access", description: "Temporary access for network configuration", status: "APPROVED", responderIdx: 1 },
    { type: "MEETING_REQUEST", title: "Weekly sync with supervisor", description: "Request for weekly progress review meeting", status: "APPROVED", responderIdx: 2 },
    { type: "SUPERVISOR_REQUEST", title: "Change project topic", description: "Request to adjust project scope", status: "PENDING", responderIdx: 3 },
    { type: "GENERAL_REQUEST", title: "Parking badge request", description: "Need a parking badge for internship duration", status: "REJECTED", responderIdx: 0 },
    { type: "DOCUMENT_REQUEST", title: "Training completion certificate", description: "Request certificate for completed safety training", status: "APPROVED", responderIdx: 1 },
    { type: "ACCESS_REQUEST", title: "VPN access request", description: "Need remote access for off-site work", status: "PENDING", responderIdx: 2 },
    { type: "MEETING_REQUEST", title: "End-of-internship review", description: "Schedule final evaluation meeting", status: "PENDING", responderIdx: 3 },
  ];

  for (let i = 0; i < requestTemplates.length; i++) {
    const tmpl = requestTemplates[i];
    const creatorId = internUserIds[i % internUserIds.length];
    const supIds = Object.values(supMap);
    const responderId = supIds[tmpl.responderIdx % supIds.length];
    await prisma.request.create({
      data: {
        type: tmpl.type,
        title: tmpl.title,
        description: tmpl.description,
        status: tmpl.status,
        creatorId,
        handlerId: tmpl.status !== "PENDING" ? responderId : null,
        response: tmpl.status === "APPROVED" ? "Approved. Proceed as requested." : tmpl.status === "REJECTED" ? "Not available at this time." : null,
        resolvedAt: tmpl.status !== "PENDING" ? new Date() : null,
      },
    });
  }

  console.log(`Created ${await prisma.request.count()} requests.`);

  // ─── PHASE 8: Notifications ────────────────────────────────────

  const notifTemplates: { recipientIdx: number; senderIdx: number; title: string; message: string; type: NotificationType }[] = [
    { recipientIdx: 0, senderIdx: 0, title: "Welcome!", message: "Welcome to OCP eGuide. Your internship has been activated.", type: "GENERAL" },
    { recipientIdx: 1, senderIdx: 1, title: "Task Assigned", message: "You have been assigned: Implement core module", type: "TASK_ASSIGNED" },
    { recipientIdx: 2, senderIdx: 2, title: "Supervisor Message", message: "Great progress. Let's discuss next steps in our meeting.", type: "SUPERVISOR_MESSAGE" },
    { recipientIdx: 3, senderIdx: 3, title: "Announcement", message: "Company-wide safety training scheduled for next week.", type: "ANNOUNCEMENT" },
    { recipientIdx: 0, senderIdx: 1, title: "Request Update", message: "Your access request has been approved.", type: "REQUEST_APPROVED" },
    { recipientIdx: 1, senderIdx: 2, title: "Request Update", message: "Your parking badge request was not approved.", type: "REQUEST_REJECTED" },
    { recipientIdx: 2, senderIdx: 0, title: "Task Updated", message: "Your task 'Write unit tests' has been updated.", type: "TASK_UPDATED" },
    { recipientIdx: 3, senderIdx: 3, title: "System Notice", message: "Scheduled maintenance this weekend.", type: "SYSTEM" },
  ];

  const supIds = Object.values(supMap);

  for (const tmpl of notifTemplates) {
    const recipientId = internUserIds[tmpl.recipientIdx % internUserIds.length];
    const senderId = supIds[tmpl.senderIdx % supIds.length];
    await prisma.notification.create({
      data: {
        recipientId,
        senderId,
        title: tmpl.title,
        message: tmpl.message,
        type: tmpl.type,
        read: false,
      },
    });
  }

  console.log(`Created ${await prisma.notification.count()} notifications.`);

  // ─── PHASE 9: Locations ────────────────────────────────────────

  const locationIds: string[] = [];
  for (const loc of LOCATION_DATA) {
    const created = await prisma.location.create({ data: loc });
    locationIds.push(created.id);
  }

  console.log(`Created ${locationIds.length} locations.`);

  // ─── PHASE 10: QR Codes ────────────────────────────────────────

  for (const locId of locationIds) {
    await prisma.qrCode.create({
      data: {
        token: uuidv4().replace(/-/g, ""),
        type: "LOCATION",
        locationId: locId,
        active: true,
      },
    });
  }

  for (const a of assignments.filter(a => a.profileSlug.startsWith("intern-"))) {
    const person = PEOPLE[a.personIdx];
    const prefix = emailPrefix(person);
    const email = buildEmail(prefix, profileMap[a.profileSlug].emailSlug);
    const userId = userByEmail[email].id;
    await prisma.qrCode.create({
      data: {
        token: uuidv4().replace(/-/g, ""),
        type: "VISITOR_CHECKIN",
        userId,
        active: true,
        payload: { purpose: "intern_checkin" },
      },
    });
  }

  console.log(`Created ${await prisma.qrCode.count()} QR codes.`);

  // ─── PHASE 11: Places ──────────────────────────────────────────

  const placeData = [
    { name: "JFC5", code: "JFC5", type: "FACILITY", description: "Phosphate processing facility", capacity: 500, currentOccupancy: 210, status: "AVAILABLE" as const, latitude: 34.0331, longitude: -5.0003 },
    { name: "JESA", code: "JESA", type: "FACILITY", description: "Engineering services building", capacity: 300, currentOccupancy: 295, status: "BUSY" as const, latitude: 34.0340, longitude: -5.0015 },
    { name: "JFC1", code: "JFC1", type: "FACILITY", description: "Chemical processing unit", capacity: 400, currentOccupancy: 380, status: "BUSY" as const, latitude: 34.0345, longitude: -5.0020 },
    { name: "Administration Building", code: "ADMIN-BLDG", type: "OFFICE", description: "Main administration offices", capacity: 200, currentOccupancy: 85, status: "AVAILABLE" as const, latitude: 34.0335, longitude: -5.0007 },
    { name: "Training Center", code: "TRAINING", type: "FACILITY", description: "Corporate training and conference center", capacity: 150, currentOccupancy: 150, status: "FULL" as const, latitude: 34.0350, longitude: -5.0025 },
    { name: "Cafeteria", code: "CAFE", type: "FACILITY", description: "Employee cafeteria and dining", capacity: 250, currentOccupancy: 120, status: "AVAILABLE" as const, latitude: 34.0337, longitude: -5.0009 },
    { name: "Security HQ", code: "SEC-HQ", type: "SAFETY", description: "Security operations center", capacity: 50, currentOccupancy: 30, status: "AVAILABLE" as const, latitude: 34.0331, longitude: -5.0002 },
    { name: "Research Lab", code: "RES-LAB", type: "FACILITY", description: "R&D laboratories", capacity: 80, currentOccupancy: 0, status: "CLOSED" as const, latitude: 34.0336, longitude: -5.0008 },
  ];

  const createdPlaces: { id: string; code: string }[] = [];
  for (const p of placeData) {
    const created = await prisma.place.create({ data: p });
    createdPlaces.push({ id: created.id, code: created.code });
    await prisma.placeOccupancy.create({
      data: {
        placeId: created.id,
        currentOccupancy: p.currentOccupancy,
        capacity: p.capacity,
        status: p.status,
      },
    });
  }

  console.log(`Created ${createdPlaces.length} places with occupancy records.`);

  // ─── PHASE 12: Presence Records ────────────────────────────────

  const allCreatedUsers = await prisma.user.findMany({ select: { id: true, email: true } });

  for (let i = 0; i < allCreatedUsers.length; i++) {
    const user = allCreatedUsers[i];
    const uData = Object.values(userByEmail).find(u => u.id === user.id);
    const status = uData && uData.profileSlug.startsWith("intern-")
      ? (i % 3 === 0 ? "ACTIVE" : i % 3 === 1 ? "BUSY" : "OFFLINE")
      : (i % 2 === 0 ? "ACTIVE" : "OFFLINE");

    const now = new Date();
    const offset = Math.floor(Math.random() * 60 * 60 * 1000);
    const lastHeartbeat = status === "OFFLINE" ? new Date(now.getTime() - offset - 10 * 60 * 1000) : new Date(now.getTime() - offset);

    await prisma.presence.create({
      data: {
        userId: user.id,
        status: status as any,
        statusNote: status === "ACTIVE" && i < 5 ? "Available for questions" : null,
        lastSeen: lastHeartbeat,
        lastHeartbeat,
      },
    });
  }

  console.log(`Created ${allCreatedUsers.length} presence records.`);

  // ─── PHASE 13: Visits ──────────────────────────────────────────

  const visitorUsers = await prisma.user.findMany({
    where: { profile: { slug: { startsWith: "visitor-" } } },
    select: { id: true, profile: { select: { slug: true } } },
  });

  const hostUsers = await prisma.user.findMany({
    where: { profile: { slug: { in: ["employee-management", "employee-hr"] } } },
    select: { id: true },
    orderBy: { email: "asc" },
  });

  const visitPlaces = await prisma.place.findMany({ select: { id: true }, orderBy: { code: "asc" } });

  const visitPurposes: Record<string, string> = {
    "visitor-supplier": "Supplier visit",
    "visitor-client": "Client meeting",
    "visitor-delivery": "Delivery coordination",
    "visitor-partner": "Partner meeting",
    "visitor-collaborator": "Collaboration session",
    "visitor-contractor": "Contractor site visit",
  };

  const visitTimes = ["09:30", "10:00", "10:30", "11:00", "14:00"];
  const visitNotes = [
    "Quarterly review meeting",
    "Equipment delivery",
    "Contract renewal discussion",
    "Site inspection tour",
    "Project kickoff coordination",
    "Maintenance work briefing",
  ];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let visitCount = 0;

  if (hostUsers.length > 0) {
    for (let i = 0; i < visitorUsers.length; i++) {
      const visitor = visitorUsers[i];
      const slug = visitor.profile?.slug || "";

      // Idempotent: skip if this visitor already has a visit
      const existingVisit = await prisma.visit.findFirst({ where: { visitorId: visitor.id } });
      if (existingVisit) continue;

      const status = i % 8 === 0 ? "PENDING" : i % 8 === 1 ? "ARRIVED" : "APPROVED";

      await prisma.visit.create({
        data: {
          purpose: visitPurposes[slug] || "General visit",
          status,
          scheduledDate: today,
          scheduledTime: visitTimes[i % visitTimes.length],
          notes: visitNotes[i % visitNotes.length],
          visitorId: visitor.id,
          hostId: hostUsers[i % hostUsers.length].id,
          placeId: visitPlaces.length > 0 ? visitPlaces[i % visitPlaces.length].id : null,
        },
      });
      visitCount++;
    }
  }

  console.log(`Created ${visitCount} visits for ${visitorUsers.length} visitors.`);

  // ─── SUMMARY ───────────────────────────────────────────────────

  const counts = {
    profiles: await prisma.profile.count(),
    users: await prisma.user.count(),
    internships: await prisma.internship.count(),
    tasks: await prisma.task.count(),
    requests: await prisma.request.count(),
    notifications: await prisma.notification.count(),
    locations: await prisma.location.count(),
    qrCodes: await prisma.qrCode.count(),
    presence: await prisma.presence.count(),
    places: await prisma.place.count(),
    placeOccupancies: await prisma.placeOccupancy.count(),
  };

  console.log("\n=== SEED COMPLETE ===");
  console.log(`Profiles: ${counts.profiles}`);
  console.log(`Users: ${counts.users}`);
  console.log(`Internships: ${counts.internships}`);
  console.log(`Tasks: ${counts.tasks}`);
  console.log(`Requests: ${counts.requests}`);
  console.log(`Notifications: ${counts.notifications}`);
  console.log(`Locations: ${counts.locations}`);
  console.log(`QR Codes: ${counts.qrCodes}`);
  console.log(`Presence: ${counts.presence}`);
  console.log(`Places: ${counts.places}`);
  console.log(`Place Occupancies: ${counts.placeOccupancies}`);

  console.log("\n=== ALL ACCOUNTS (password = firstName_lowercase + 123) ===\n");

  const allUsers = await prisma.user.findMany({
    select: { firstName: true, lastName: true, email: true, role: true, department: true, position: true, profile: { select: { name: true, slug: true } } },
    orderBy: [{ email: "asc" }],
  });

  for (const u of allUsers) {
    const nameLower = u.firstName.toLowerCase();
    const profileName = u.profile?.name || "-";
    const profileSlug = u.profile?.slug || "-";
    console.log(`  ${u.email.padEnd(50)} | ${profileSlug.padEnd(25)} | ${profileName.padEnd(25)} | pw: ${nameLower}123`);
  }
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
