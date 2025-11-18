import { type User, type InsertUser, type PatientRecord, type InsertPatientRecord, type EcgData, type InsertEcgData } from "@shared/schema";
import { randomUUID } from "crypto";
import bcrypt from "bcrypt";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;

  // Patient record operations
  getPatientRecord(id: string): Promise<PatientRecord | undefined>;
  getPatientRecordsByUserId(userId: string): Promise<PatientRecord[]>;
  createPatientRecord(record: InsertPatientRecord): Promise<PatientRecord>;
  getAllPatientRecords(): Promise<PatientRecord[]>;

  // ECG data operations
  getEcgData(id: string): Promise<EcgData | undefined>;
  getEcgDataByUserId(userId: string, filterPeriod?: string): Promise<EcgData[]>;
  getLatestEcgDataByUserId(userId: string): Promise<EcgData | undefined>;
  createEcgData(data: InsertEcgData): Promise<EcgData>;
  getAllEcgData(): Promise<EcgData[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private patientRecords: Map<string, PatientRecord>;
  private ecgData: Map<string, EcgData>;

  constructor() {
    this.users = new Map();
    this.patientRecords = new Map();
    this.ecgData = new Map();

    // Seed with sample data for testing
    this.seedData();
  }

  private seedData() {
    // Create a sample admin user (password: Admin@123)
    // Using a pre-computed bcrypt hash for Admin@123
    const adminId = randomUUID();
    const admin: User = {
      id: adminId,
      email: "admin@healthmonitor.com",
      phone: "1234567890",
      password: "$2b$10$WUc29RqPvqPaFS6nVedSJuzhnGJ.No/zgL0THtXk0ZIEuUUFEh0PW", // Admin@123
      bloodGroup: "O+",
      customBloodGroup: null,
      gender: "Male",
      role: "admin",
      createdAt: new Date(),
    };
    this.users.set(adminId, admin);
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((user) => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Patient record operations
  async getPatientRecord(id: string): Promise<PatientRecord | undefined> {
    return this.patientRecords.get(id);
  }

  async getPatientRecordsByUserId(userId: string): Promise<PatientRecord[]> {
    return Array.from(this.patientRecords.values())
      .filter((record) => record.userId === userId)
      .sort((a, b) => new Date(b.recordDate).getTime() - new Date(a.recordDate).getTime());
  }

  async createPatientRecord(insertRecord: InsertPatientRecord): Promise<PatientRecord> {
    const id = randomUUID();
    const record: PatientRecord = {
      ...insertRecord,
      id,
      recordDate: insertRecord.recordDate || new Date(),
    };
    this.patientRecords.set(id, record);
    return record;
  }

  async getAllPatientRecords(): Promise<PatientRecord[]> {
    return Array.from(this.patientRecords.values())
      .sort((a, b) => new Date(b.recordDate).getTime() - new Date(a.recordDate).getTime());
  }

  // ECG data operations
  async getEcgData(id: string): Promise<EcgData | undefined> {
    return this.ecgData.get(id);
  }

  async getEcgDataByUserId(userId: string, filterPeriod?: string): Promise<EcgData[]> {
    const allData = Array.from(this.ecgData.values())
      .filter((data) => data.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    if (!filterPeriod) return allData;

    const now = new Date();
    const filtered = allData.filter((data) => {
      const dataDate = new Date(data.timestamp);
      switch (filterPeriod) {
        case "day":
          return dataDate.toDateString() === now.toDateString();
        case "month":
          return (
            dataDate.getMonth() === now.getMonth() &&
            dataDate.getFullYear() === now.getFullYear()
          );
        case "year":
          return dataDate.getFullYear() === now.getFullYear();
        default:
          return true;
      }
    });

    return filtered;
  }

  async getLatestEcgDataByUserId(userId: string): Promise<EcgData | undefined> {
    const allData = Array.from(this.ecgData.values())
      .filter((data) => data.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return allData[0];
  }

  async createEcgData(insertData: InsertEcgData): Promise<EcgData> {
    const id = randomUUID();
    const data: EcgData = {
      ...insertData,
      id,
      timestamp: new Date(),
    };
    this.ecgData.set(id, data);
    return data;
  }

  async getAllEcgData(): Promise<EcgData[]> {
    return Array.from(this.ecgData.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
}

export const storage = new MemStorage();
