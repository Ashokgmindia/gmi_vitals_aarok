import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, loginSchema, insertEcgDataSchema, insertPatientRecordSchema } from "@shared/schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.SESSION_SECRET || "your-secret-key-change-in-production";
const SALT_ROUNDS = 10;

// Middleware to verify JWT token
interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
}

const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

// Middleware to check if user is admin
const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.userRole !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, SALT_ROUNDS);

      // Create user
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword,
      });

      // Create initial ECG data for the patient
      if (user.role === "patient") {
        await storage.createEcgData({
          userId: user.id,
          recordId: null,
          heartRate: 60 + Math.floor(Math.random() * 20),
          spo2: 95 + Math.floor(Math.random() * 5),
          systolicBP: 110 + Math.floor(Math.random() * 20),
          diastolicBP: 70 + Math.floor(Math.random() * 15),
          temperature: 36.5 + Math.random() * 1.5,
          respiratoryRate: 16 + Math.floor(Math.random() * 8),
          plethWaveform: null,
          spo2Waveform: null,
          respWaveform: null,
          cvpArtWaveform: null,
          ecgOxpWaveform: null,
          etco2Waveform: null,
        });
      }

      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const validatedData = loginSchema.parse(req.body);

      const user = await storage.getUserByEmail(validatedData.email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Check role matches
      if (user.role !== validatedData.role) {
        return res.status(401).json({ message: "Invalid credentials for this login type" });
      }

      // Verify password
      const passwordMatch = await bcrypt.compare(validatedData.password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, role: user.role },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      const { password, ...userWithoutPassword } = user;
      res.json({
        token,
        userId: user.id,
        role: user.role,
        user: userWithoutPassword,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Login failed" });
    }
  });

  // User routes
  app.get("/api/users/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;

      // Users can only access their own data unless they're admin
      if (req.userId !== id && req.userRole !== "admin") {
        return res.status(403).json({ message: "Access denied" });
      }

      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Patient record routes
  app.get("/api/patients/:userId/records", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { userId } = req.params;

      // Patients can only access their own records
      if (req.userId !== userId && req.userRole !== "admin") {
        return res.status(403).json({ message: "Access denied" });
      }

      const records = await storage.getPatientRecordsByUserId(userId);
      res.json(records);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/patients/:userId/records", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { userId } = req.params;

      // Only admins can create records for patients
      if (req.userRole !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const validatedData = insertPatientRecordSchema.parse({
        ...req.body,
        userId,
      });

      const record = await storage.createPatientRecord(validatedData);
      res.status(201).json(record);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // ECG data routes
  app.get("/api/ecg-data/latest/:userId", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { userId } = req.params;

      // Patients can only access their own data
      if (req.userId !== userId && req.userRole !== "admin") {
        return res.status(403).json({ message: "Access denied" });
      }

      const latestData = await storage.getLatestEcgDataByUserId(userId);
      if (!latestData) {
        return res.status(404).json({ message: "No ECG data found" });
      }

      res.json(latestData);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/ecg-data/:userId/:filterPeriod?", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { userId, filterPeriod } = req.params;

      // Patients can only access their own data
      if (req.userId !== userId && req.userRole !== "admin") {
        return res.status(403).json({ message: "Access denied" });
      }

      const data = await storage.getEcgDataByUserId(userId, filterPeriod);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/ecg-data", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const validatedData = insertEcgDataSchema.parse(req.body);

      // Users can only create their own ECG data unless they're admin
      if (req.userId !== validatedData.userId && req.userRole !== "admin") {
        return res.status(403).json({ message: "Access denied" });
      }

      const data = await storage.createEcgData(validatedData);
      res.status(201).json(data);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Admin routes
  app.get("/api/admin/users", authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
      const users = await storage.getAllUsers();
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/ecg-data", authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
      const allData = await storage.getAllEcgData();
      res.json(allData);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/records", authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
      const allRecords = await storage.getAllPatientRecords();
      res.json(allRecords);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
