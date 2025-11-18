import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table - supports both patients and super admins
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  password: text("password").notNull(),
  bloodGroup: text("blood_group").notNull(),
  customBloodGroup: text("custom_blood_group"),
  gender: text("gender").notNull(),
  role: text("role").notNull().default("patient"), // "patient" or "admin"
  createdAt: timestamp("created_at").defaultNow(),
});

// Patient health records
export const patientRecords = pgTable("patient_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  recordDate: timestamp("record_date").notNull().defaultNow(),
  notes: text("notes"),
  diagnosis: text("diagnosis"),
});

// ECG and vital signs data
export const ecgData = pgTable("ecg_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  recordId: varchar("record_id").references(() => patientRecords.id),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  
  // Vital signs
  heartRate: integer("heart_rate").notNull(), // BPM
  spo2: integer("spo2").notNull(), // %
  systolicBP: integer("systolic_bp").notNull(),
  diastolicBP: integer("diastolic_bp").notNull(),
  temperature: real("temperature").notNull(), // °C
  respiratoryRate: integer("respiratory_rate"), // breaths/min
  
  // ECG waveform parameters (stored as JSON strings for simplicity)
  plethWaveform: text("pleth_waveform"), // JSON array
  spo2Waveform: text("spo2_waveform"),
  respWaveform: text("resp_waveform"),
  cvpArtWaveform: text("cvp_art_waveform"),
  ecgOxpWaveform: text("ecg_oxp_waveform"),
  etco2Waveform: text("etco2_waveform"),
});

// Zod schemas for validation
const baseInsertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
}).extend({
  email: z.string().email("Invalid email format"),
  phone: z.string().regex(/^\d{10}$/, "Phone number must be 10 digits"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  bloodGroup: z.string().min(1, "Blood group is required"),
  customBloodGroup: z.string().optional(),
  gender: z.string().min(1, "Gender is required"),
  role: z.enum(["patient", "admin"]).default("patient"),
});

// For server-side validation (excludes confirmPassword)
export const insertUserSchema = baseInsertUserSchema;

// For client-side registration form (includes confirmPassword)
export const registerFormSchema = baseInsertUserSchema.extend({
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const insertPatientRecordSchema = createInsertSchema(patientRecords).omit({
  id: true,
});

export const insertEcgDataSchema = createInsertSchema(ecgData).omit({
  id: true,
  timestamp: true,
});

// TypeScript types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type RegisterFormData = z.infer<typeof registerFormSchema>;
export type User = typeof users.$inferSelect;
export type InsertPatientRecord = z.infer<typeof insertPatientRecordSchema>;
export type PatientRecord = typeof patientRecords.$inferSelect;
export type InsertEcgData = z.infer<typeof insertEcgDataSchema>;
export type EcgData = typeof ecgData.$inferSelect;

// Login schema
export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
  role: z.enum(["patient", "admin"]).default("patient"),
});

export type LoginData = z.infer<typeof loginSchema>;
