import swaggerJsdoc from "swagger-jsdoc";
import { config } from "../config";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "OCP e-Guide API",
      version: "1.0.0",
      description: "REST API for the OCP e-Guide platform — internship management, employee availability, requests, notifications, QR codes, and more.",
      contact: {
        name: "OCP e-Guide Team",
        email: "dev@ocp.ma",
      },
    },
    servers: [
      {
        url: `http://localhost:${config.port}`,
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT access token",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            firstName: { type: "string" },
            lastName: { type: "string" },
            email: { type: "string", format: "email" },
            role: { type: "string", enum: ["ADMIN", "EMPLOYEE", "INTERN", "VISITOR", "COLLABORATOR", "PARTNER", "SUPPLIER", "SERVICE_PROVIDER"] },
            department: { type: "string" },
            position: { type: "string" },
            phone: { type: "string" },
            avatar: { type: "string" },
            status: { type: "string", enum: ["ONLINE", "BUSY", "OFFLINE"] },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Internship: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            title: { type: "string" },
            description: { type: "string" },
            status: { type: "string", enum: ["PLANNED", "ACTIVE", "COMPLETED", "TERMINATED"] },
            startDate: { type: "string", format: "date-time" },
            endDate: { type: "string", format: "date-time" },
            department: { type: "string" },
            objectives: { type: "string" },
          },
        },
        Task: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            title: { type: "string" },
            description: { type: "string" },
            status: { type: "string", enum: ["TODO", "IN_PROGRESS", "REVIEW", "COMPLETED", "CANCELLED"] },
            priority: { type: "string", enum: ["LOW", "MEDIUM", "HIGH", "URGENT"] },
            dueDate: { type: "string", format: "date-time" },
          },
        },
        Request: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            type: { type: "string", enum: ["DOCUMENT_REQUEST", "ACCESS_REQUEST", "MEETING_REQUEST", "SUPERVISOR_REQUEST", "GENERAL_REQUEST"] },
            title: { type: "string" },
            description: { type: "string" },
            status: { type: "string", enum: ["PENDING", "APPROVED", "REJECTED", "CANCELLED"] },
          },
        },
        Notification: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            title: { type: "string" },
            message: { type: "string" },
            type: { type: "string" },
            read: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Location: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string" },
            description: { type: "string" },
            category: { type: "string", enum: ["OFFICE", "DEPARTMENT", "FACILITY", "MOSQUE", "RECEPTION", "PARKING", "SAFETY", "OTHER"] },
            latitude: { type: "number" },
            longitude: { type: "number" },
            building: { type: "string" },
          },
        },
        ApiResponse: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            data: {},
            message: { type: "string" },
            error: {
              type: "object",
              properties: {
                code: { type: "string" },
                message: { type: "string" },
              },
            },
            meta: {
              type: "object",
              properties: {
                page: { type: "integer" },
                limit: { type: "integer" },
                total: { type: "integer" },
                totalPages: { type: "integer" },
              },
            },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 1 },
          },
        },
        RegisterRequest: {
          type: "object",
          required: ["firstName", "lastName", "email", "password"],
          properties: {
            firstName: { type: "string", minLength: 2 },
            lastName: { type: "string", minLength: 2 },
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 8 },
            role: { type: "string" },
            department: { type: "string" },
            position: { type: "string" },
            phone: { type: "string" },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./src/routes/*.ts", "./src/docs/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
