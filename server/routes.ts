import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, loginSchema, insertEcgDataSchema, insertPatientRecordSchema, type InsertEcgData } from "@shared/schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { GoogleGenerativeAI } from "@google/generative-ai";

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

  // ESP32 Vitals endpoint (public endpoint for device data)
  app.post("/api/vitals", async (req: Request, res: Response) => {
    try {
      const data = req.body;
      
      // Extract device_id and data_type
      const device_id = data.device_id;
      const data_type = data.data_type;

      // Validate required fields
      if (!device_id || !data_type) {
        return res.status(400).json({ message: "Missing required fields: device_id and data_type" });
      }

      // Map device_id to userId (for now, we'll use a default or find/create a user)
      // In production, you'd have a device-to-user mapping table
      // For now, we'll try to find a user or use the first patient user
      const allUsers = await storage.getAllUsers();
      let targetUserId: string | undefined;

      // Try to find a patient user (prefer first patient over admin)
      const patientUser = allUsers.find((u) => u.role === "patient");
      if (patientUser) {
        targetUserId = patientUser.id;
      } else if (allUsers.length > 0) {
        // Fallback to first user if no patient found
        targetUserId = allUsers[0].id;
      } else {
        return res.status(404).json({ message: "No user found to associate device data with" });
      }

      // Get latest ECG data for this user to update it
      const latestData = await storage.getLatestEcgDataByUserId(targetUserId);

      // Prepare data based on data_type
      let ecgDataToStore: InsertEcgData;
      let responseTemperature: number | undefined;
      let responseSpo2: number | undefined;
      let responseHeartRate: number | undefined;

      if (data_type === "temperature") {
        // Temperature data - accept both "temperature" and "temperature_c" field names
        const temperature = data.temperature !== undefined ? data.temperature : data.temperature_c;
        
        if (temperature === undefined) {
          return res.status(400).json({ 
            message: "Missing temperature field for temperature data_type" 
          });
        }

        responseTemperature = parseFloat(temperature);

        ecgDataToStore = {
          userId: targetUserId,
          recordId: latestData?.recordId || null,
          heartRate: latestData?.heartRate || 70,
          spo2: latestData?.spo2 || 98,
          systolicBP: latestData?.systolicBP || 120,
          diastolicBP: latestData?.diastolicBP || 80,
          temperature: responseTemperature,
          respiratoryRate: latestData?.respiratoryRate || 20,
          plethWaveform: latestData?.plethWaveform || null,
          spo2Waveform: latestData?.spo2Waveform || null,
          respWaveform: latestData?.respWaveform || null,
          cvpArtWaveform: latestData?.cvpArtWaveform || null,
          ecgOxpWaveform: latestData?.ecgOxpWaveform || null,
          etco2Waveform: latestData?.etco2Waveform || null,
        };
      } else if (data_type === "vitals") {
        // Vitals data - accept both standard and ESP32 field names
        // Accept: spo2 or max_spo2_percent
        // Accept: heart_rate or max_heart_rate_bpm
        const spo2 = data.spo2 !== undefined ? data.spo2 : 
                     (data.max_spo2_percent !== undefined ? data.max_spo2_percent : undefined);
        const heart_rate = data.heart_rate !== undefined ? data.heart_rate : 
                          (data.max_heart_rate_bpm !== undefined ? data.max_heart_rate_bpm : undefined);
        
        if (spo2 === undefined && heart_rate === undefined) {
          return res.status(400).json({ 
            message: "Missing spo2 or heart_rate field for vitals data_type" 
          });
        }

        responseSpo2 = spo2 !== undefined ? parseFloat(String(spo2)) : undefined;
        responseHeartRate = heart_rate !== undefined ? parseInt(String(heart_rate)) : undefined;

        ecgDataToStore = {
          userId: targetUserId,
          recordId: latestData?.recordId || null,
          heartRate: responseHeartRate !== undefined ? responseHeartRate : (latestData?.heartRate || 70),
          spo2: responseSpo2 !== undefined ? Math.round(responseSpo2) : (latestData?.spo2 || 98),
          systolicBP: latestData?.systolicBP || 120,
          diastolicBP: latestData?.diastolicBP || 80,
          temperature: latestData?.temperature || 37.0,
          respiratoryRate: latestData?.respiratoryRate || 20,
          plethWaveform: latestData?.plethWaveform || null,
          spo2Waveform: latestData?.spo2Waveform || null,
          respWaveform: latestData?.respWaveform || null,
          cvpArtWaveform: latestData?.cvpArtWaveform || null,
          ecgOxpWaveform: latestData?.ecgOxpWaveform || null,
          etco2Waveform: latestData?.etco2Waveform || null,
        };
      } else {
        return res.status(400).json({ 
          message: `Invalid data_type: ${data_type}. Expected 'temperature' or 'vitals'` 
        });
      }

      // Create new ECG data entry
      const createdData = await storage.createEcgData(ecgDataToStore);

      res.status(201).json({
        success: true,
        message: `Successfully stored ${data_type} data`,
        data: {
          id: createdData.id,
          data_type,
          device_id,
          ...(responseTemperature !== undefined && { temperature: responseTemperature }),
          ...(responseSpo2 !== undefined && { spo2: responseSpo2 }),
          ...(responseHeartRate !== undefined && { heart_rate: responseHeartRate }),
        },
      });
    } catch (error: any) {
      console.error("Error processing vitals data:", error);
      res.status(500).json({ message: error.message || "Failed to process vitals data" });
    }
  });

  // Get latest ESP32 vitals data (for dashboard - returns latest regardless of user)
  app.get("/api/vitals/latest", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      // Get all ECG data and find the most recent one
      const allEcgData = await storage.getAllEcgData();
      
      if (allEcgData.length === 0) {
        return res.status(404).json({ message: "No ECG data found" });
      }

      // Sort by timestamp descending and get the latest
      const latestData = allEcgData.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )[0];

      // Check if user has access (patients can only see their own, admins can see all)
      if (req.userRole !== "admin" && req.userId && latestData.userId !== req.userId) {
        // For patients, try to find their own latest data instead
        const userLatestData = await storage.getLatestEcgDataByUserId(req.userId);
        if (!userLatestData) {
          return res.status(404).json({ message: "No ECG data found" });
        }
        return res.json(userLatestData);
      }

      res.json(latestData);
    } catch (error: any) {
      console.error("Error fetching latest vitals data:", error);
      res.status(500).json({ message: error.message || "Failed to fetch latest vitals data" });
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

  // AI Analysis endpoint
  app.post("/api/ai-analysis", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Check if user has access (patients can only access their own, admins can access any)
      const targetUserId = req.body.userId || userId;
      if (targetUserId !== userId && req.userRole !== "admin") {
        return res.status(403).json({ message: "Access denied" });
      }

      // Fetch latest sensor data
      const latestData = await storage.getLatestEcgDataByUserId(targetUserId);
      if (!latestData) {
        return res.status(404).json({ message: "No sensor data found. Please ensure vital signs are being monitored." });
      }

      // Get user info for context
      const user = await storage.getUser(targetUserId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get Gemini API key from environment variable
      const geminiApiKey = process.env.GEMINI_API_KEY;
      
      if (!geminiApiKey || geminiApiKey.trim() === "") {
        return res.status(500).json({ 
          message: "AI Analysis service is not configured. Please set GEMINI_API_KEY environment variable." 
        });
      }

      // Prepare sensor data for analysis
      const sensorData = {
        timestamp: latestData.timestamp,
        vitalSigns: {
          heartRate: latestData.heartRate ? `${latestData.heartRate} BPM` : "Not available",
          spo2: latestData.spo2 ? `${latestData.spo2}%` : "Not available",
          bloodPressure: latestData.systolicBP && latestData.diastolicBP 
            ? `${latestData.systolicBP}/${latestData.diastolicBP} mmHg` 
            : "Not available",
          temperature: latestData.temperature ? `${latestData.temperature.toFixed(1)}°C` : "Not available",
          respiratoryRate: latestData.respiratoryRate ? `${latestData.respiratoryRate} breaths/min` : "Not available",
        },
        patientInfo: {
          email: user.email || "Patient",
          gender: user.gender || "Not specified",
          bloodGroup: user.customBloodGroup || user.bloodGroup || "Not specified",
        }
      };

      // Create medical analysis prompt - STRICT: Only use provided data, no hallucinations
      const prompt = `You are an expert medical analyst reviewing real-time vital signs data from a patient monitoring system. 

CRITICAL INSTRUCTIONS:
- ONLY analyze the data provided below. Do NOT invent, assume, or hallucinate any information.
- If a parameter shows "Not available" or is missing, explicitly state "Data not available" and leave that section blank or note it as unavailable.
- Do NOT make assumptions about patient age, medical history, or any other information not explicitly provided.
- Base all assessments strictly on the provided vital signs values and standard medical reference ranges.
- If a value is within normal range, state it. If outside normal range, note it but do not speculate on causes.

PATIENT INFORMATION:
- Email: ${sensorData.patientInfo.email}
- Gender: ${sensorData.patientInfo.gender}
- Blood Group: ${sensorData.patientInfo.bloodGroup}

VITAL SIGNS DATA (recorded at ${new Date(sensorData.timestamp).toLocaleString()}):
- Heart Rate: ${sensorData.vitalSigns.heartRate}
- SpO2 (Oxygen Saturation): ${sensorData.vitalSigns.spo2}
- Blood Pressure: ${sensorData.vitalSigns.bloodPressure}
- Body Temperature: ${sensorData.vitalSigns.temperature}
- Respiratory Rate: ${sensorData.vitalSigns.respiratoryRate}

Please provide a detailed medical analysis report in the following structured format. For each parameter, if the value shows "Not available", write "Data not available" and skip detailed analysis.

## HEALTH REPORT ANALYSIS

### EXECUTIVE SUMMARY
[Provide a brief 2-3 sentence overview ONLY based on the available vital signs data provided above. If data is incomplete, note that the analysis is limited to available data.]

### VITAL SIGNS ANALYSIS

**Heart Rate:**
- Current Value: ${sensorData.vitalSigns.heartRate}
- Assessment: [Only if data is available: Compare against normal range (60-100 BPM for adults). State Normal/Elevated/Low, or "Data not available"]
- Interpretation: [Only if data is available: Brief clinical interpretation based solely on the provided value and standard ranges]
- Clinical Significance: [Only if data is available: What this reading indicates based on standard medical knowledge]

**Oxygen Saturation (SpO2):**
- Current Value: ${sensorData.vitalSigns.spo2}
- Assessment: [Only if data is available: Compare against normal range (≥95% is normal). State Normal/Low/Excellent, or "Data not available"]
- Interpretation: [Only if data is available: Brief clinical interpretation based solely on the provided value]
- Clinical Significance: [Only if data is available: What this reading indicates]

**Blood Pressure:**
- Current Value: ${sensorData.vitalSigns.bloodPressure}
- Assessment: [Only if data is available: Compare systolic (normal: 90-120 mmHg) and diastolic (normal: 60-80 mmHg). State Normal/High/Low, or "Data not available"]
- Interpretation: [Only if data is available: Brief clinical interpretation based solely on the provided values]
- Clinical Significance: [Only if data is available: What this reading indicates]

**Body Temperature:**
- Current Value: ${sensorData.vitalSigns.temperature}
- Assessment: [Only if data is available: Compare against normal range (36.1-37.2°C or 97-99°F). State Normal/Fever/Hypothermia, or "Data not available"]
- Interpretation: [Only if data is available: Brief clinical interpretation based solely on the provided value]
- Clinical Significance: [Only if data is available: What this reading indicates]

**Respiratory Rate:**
- Current Value: ${sensorData.vitalSigns.respiratoryRate}
- Assessment: [Only if data is available: Compare against normal range (12-20 breaths/min for adults). State Normal/Elevated/Low, or "Data not available"]
- Interpretation: [Only if data is available: Brief clinical interpretation based solely on the provided value]
- Clinical Significance: [Only if data is available: What this reading indicates]

### OVERALL HEALTH ASSESSMENT
[Provide assessment ONLY based on the available vital signs data provided above. Do not speculate on conditions, diagnoses, or causes not directly related to the provided values. If data is incomplete, explicitly state the limitations.]

### RECOMMENDATIONS
[Based ONLY on the available vital signs data, provide specific, actionable recommendations. Do not recommend tests or procedures not suggested by the available data.]

### CLINICAL NOTES
[Additional clinical observations based ONLY on the provided vital signs. If no significant observations, state "No significant observations based on available data."]

### IMPORTANT DISCLAIMERS
This report is generated by an AI system based on limited real-time sensor data. This analysis should NOT replace professional medical consultation, diagnosis, or treatment. All medical decisions should be made in consultation with qualified healthcare professionals. The analysis is based solely on the vital signs data provided and does not include physical examination, medical history, or other clinical findings.`;

      // Initialize Gemini AI
      const genAI = new GoogleGenerativeAI(geminiApiKey);
      
      // Use gemini-2.5-pro model
      console.log("Using model: gemini-2.5-pro");
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
      
      // Generate analysis
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const healthReport = response.text();

      // Return the health report
      res.json({
        success: true,
        report: healthReport,
        sensorData: {
          timestamp: latestData.timestamp,
          vitalSigns: sensorData.vitalSigns,
        },
        generatedAt: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Error generating AI analysis:", error);
      console.error("Full error object:", JSON.stringify(error, null, 2));
      
      // Provide better error messages for common issues
      let errorMessage = "Failed to generate AI analysis";
      const errorStr = error.message?.toString().toLowerCase() || "";
      
      if (errorStr.includes("api key") || errorStr.includes("401") || errorStr.includes("403")) {
        errorMessage = "Invalid or missing Gemini API key. Please check your GEMINI_API_KEY environment variable.";
      } else if (errorStr.includes("503") || errorStr.includes("overloaded") || errorStr.includes("service unavailable")) {
        errorMessage = "The Gemini AI service is currently overloaded. Please try again in a few moments.";
      } else if (errorStr.includes("model") || errorStr.includes("404") || errorStr.includes("not found")) {
        errorMessage = `Model error: The model "gemini-2.5-pro" may not be available or accessible. Error: ${error.message || "Unknown error"}`;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      res.status(500).json({ 
        message: errorMessage,
        details: process.env.NODE_ENV === "development" ? {
          error: error.message,
          status: error.status,
          statusText: error.statusText,
          stack: error.stack
        } : undefined
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
