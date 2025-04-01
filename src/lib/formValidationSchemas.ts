import { z } from "zod";
import { Gender, Day, Stream, ExamStatus } from "@prisma/client";

// Helper for date validation
const isValidDate = (val: any) => !isNaN(new Date(val).getTime());

// ==================== ADMIN ====================
export const adminSchema = z.object({
  id: z.string().min(1, "ID is required"),
  username: z.string().min(3, "Username must be at least 3 characters").max(50),
});

export type AdminSchema = z.infer<typeof adminSchema>;

// ==================== SUSUSER ====================
export const suserSchema = z.object({
  NIC: z.string().min(1, "NIC is required"),
  username: z.string().min(3, "Username must be at least 3 characters").max(50),
  FirstName: z.string().min(1, "First name is required").max(100),
  LastName: z.string().min(1, "Last name is required").max(100),
  Email: z.string().email("Invalid email").max(100),
  Password: z.string().min(8, "Password must be at least 8 characters"),
  school: z.string().min(1, "School is required").max(100),
  PhoneNumber: z.string().min(1, "Phone number is required").max(20),
  Address: z.string().max(200).optional(),
  gender: z.nativeEnum(Gender),
  img: z.string().max(255).optional(),
  stream: z.nativeEnum(Stream),
});

export type SuserSchema = z.infer<typeof suserSchema>;

// ==================== USER ====================
export const userSchema = z.object({
  NIC: z.string().min(1, "NIC is required"),
  
  FirstName: z.string().min(1, "First name is required").max(100),
  LastName: z.string().min(1, "Last name is required").max(100),
  Email: z.string().email("Invalid email").max(100),
  Password: z.string().min(8, "Password must be at least 8 characters"),
  PhoneNumber: z.string().min(1, "Phone number is required").max(20),
  Address: z.string().max(200),
  gender: z.nativeEnum(Gender),
  suserID: z.string().min(1, "Super user ID is required"),
  stream: z.nativeEnum(Stream),
});

export type UserSchema = z.infer<typeof userSchema>;

// ==================== SUBJECT ====================
export const subjectSchema = z.object({
  id: z.number().int().positive().optional(),
  name: z.string().min(1, "Name is required").max(100),
  stream: z.nativeEnum(Stream).optional(),
});

export type SubjectSchema = z.infer<typeof subjectSchema>;

// ==================== EXAM ====================
export const examSchema = z.object({
  id: z.number().int().positive().optional(),
  name: z.string().min(1, "Name is required").max(100),
  date: z.date().or(z.string().refine(isValidDate, "Invalid date")),
  startTime: z.date().or(z.string().refine(isValidDate, "Invalid start time")),
  endTime: z.date().or(z.string().refine(isValidDate, "Invalid end time")),
  Day: z.nativeEnum(Day),
  subjectId: z.number().int().positive("Subject ID is required"),
  adminId: z.string().min(1, "Admin ID is required"),
});

export type ExamSchema = z.infer<typeof examSchema>;

// ==================== RESULT ====================
export const resultSchema = z.object({
  id: z.number().int().positive().optional(),
  score: z.number().min(0, "Score must be positive"),
  status: z.nativeEnum(ExamStatus),
  examId: z.number().int().positive("Exam ID is required"),
  userId: z.string().min(1).optional(),
  suserId: z.string().min(1).optional(),
}).refine(data => data.userId || data.suserId, {
  message: "Either userId or suserId must be provided",
  path: ["userId", "suserId"]
});

export type ResultSchema = z.infer<typeof resultSchema>;

// ==================== EVENT ====================
export const eventSchema = z.object({
  id: z.number().int().positive().optional(),
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().max(500).optional(),
  startTime: z.date().or(z.string().refine(isValidDate, "Invalid start time")),
  examid: z.number().int().positive().optional(),
});

export type EventSchema = z.infer<typeof eventSchema>;

// ==================== ANNOUNCEMENT ====================
export const announcementSchema = z.object({
  id: z.number().int().positive().optional(),
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().max(500).optional(),
  examid: z.number().int().positive().optional(),
});

export type AnnouncementSchema = z.infer<typeof announcementSchema>;

// ==================== REFRESH TOKEN ====================