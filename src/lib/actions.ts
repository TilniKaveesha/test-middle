"use server";

import { revalidatePath } from "next/cache";
import {
  ExamSchema,
  subjectSchema,
  SuserSchema,
  UserSchema,
} from "./formValidationSchemas";
import prisma from "./prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { Gender, Stream, Day } from "@prisma/client";
import { Role } from "@/types/auth";
import bcrypt from "bcryptjs";

type ActionState = {
  success: boolean;
  error?: string;
  message?: string;
};

// Helper function for authorization
const checkAuth = async (allowedRoles: Role[]): Promise<{ authorized: boolean; session?: any }> => {
  const session = await getServerSession(authOptions);
  const authorized =!! session?.user?.role && allowedRoles.includes(session.user.role as Role);
  return { authorized, session };
};

// Helper function for database operations with error handling
const dbOperation = async <T>(operation: () => Promise<T>): Promise<ActionState> => {
  try {
    await operation();
    return { success: true };
  } catch (error) {
    console.error(error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Database operation failed"
    };
  }
};

// Subject Actions
export const createSubject = async (
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> => {
  const { authorized } = await checkAuth(["suser", "admin"]);
  if (!authorized) return { success: false, error: "Unauthorized" };

  const name = formData.get("name") as string;
  const stream = formData.get("stream") as Stream | null;

  return dbOperation(() => 
    prisma.subject.create({
      data: { name, stream },
    })
  );
};

export const updateSubject = async (
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> => {
  const { authorized } = await checkAuth(["suser", "admin"]);
  if (!authorized) return { success: false, error: "Unauthorized" };

  const id = parseInt(formData.get("id") as string);
  const name = formData.get("name") as string;
  const stream = formData.get("stream") as Stream | null;

  return dbOperation(() =>
    prisma.subject.update({
      where: { id },
      data: { name, stream },
    })
  );
};

export const deleteSubject = async (
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> => {
  const { authorized } = await checkAuth(["admin"]);
  if (!authorized) return { success: false, error: "Unauthorized" };

  const id = parseInt(formData.get("id") as string);
  return dbOperation(() => 
    prisma.subject.delete({ where: { id } })
  );
};

// Suser (Teacher) Actions
export const createSuser = async (
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> => {
  const { authorized } = await checkAuth(["admin"]);
  if (!authorized) return { success: false, error: "Unauthorized" };

  const data = Object.fromEntries(formData.entries()) as unknown as SuserSchema;
  const hashedPassword = await bcrypt.hash(data.Password, 10);

  return dbOperation(() =>
    prisma.suser.create({
      data: {
        NIC: data.NIC,
        username: data.username,
        FirstName: data.FirstName,
        LastName: data.LastName,
        Email: data.Email,
        school: data.school,
        PhoneNumber: data.PhoneNumber,
        Address: data.Address,
        img: data.img,
        gender: data.gender,
        stream: data.stream,
        Password: hashedPassword,
      },
    })
  );
};

export const updateSuser = async (
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> => {
  const { authorized } = await checkAuth(["admin"]);
  if (!authorized) return { success: false, error: "Unauthorized" };

  const id = formData.get("id") as string;
  const data = Object.fromEntries(formData.entries()) as unknown as SuserSchema;

  return dbOperation(() =>
    prisma.suser.update({
      where: { NIC: id },
      data: {
        username: data.username,
        FirstName: data.FirstName,
        LastName: data.LastName,
        Email: data.Email,
        PhoneNumber: data.PhoneNumber,
        Address: data.Address,
        img: data.img,
        stream: data.stream,
        gender: data.gender,
      },
    })
  );
};

export const deleteSuser = async (
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> => {
  const { authorized } = await checkAuth(["admin"]);
  if (!authorized) return { success: false, error: "Unauthorized" };

  const id = formData.get("id") as string;
  return dbOperation(() => 
    prisma.suser.delete({ where: { NIC: id } })
  );
};

// Student (User) Actions
export const createStudent = async (
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> => {
  const { authorized } = await checkAuth(["admin", "suser"]);
  if (!authorized) return { success: false, error: "Unauthorized" };

  const data = Object.fromEntries(formData.entries()) as unknown as UserSchema;
  const hashedPassword = await bcrypt.hash(data.Password, 10);

  return dbOperation(() =>
    prisma.user.create({
      data: {
        NIC: data.NIC,
        FirstName: data.FirstName,
        LastName: data.LastName,
        Email: data.Email,
        Password: hashedPassword,
        PhoneNumber: data.PhoneNumber,
        Address: data.Address,
        gender: data.gender,
        suserID: data.suserID,
        stream: data.stream,
      },
    })
  );
};

export const updateStudent = async (
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> => {
  const { authorized } = await checkAuth(["admin", "suser"]);
  if (!authorized) return { success: false, error: "Unauthorized" };

  const id = formData.get("id") as string;
  const data = Object.fromEntries(formData.entries()) as unknown as UserSchema;

  return dbOperation(() =>
    prisma.user.update({
      where: { NIC: id },
      data: {
        FirstName: data.FirstName,
        LastName: data.LastName,
        Email: data.Email,
        PhoneNumber: data.PhoneNumber,
        Address: data.Address,
        gender: data.gender,
        suserID: data.suserID,
        stream: data.stream,
      },
    })
  );
};

export const deleteStudent = async (
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> => {
  const { authorized } = await checkAuth(["admin"]);
  if (!authorized) return { success: false, error: "Unauthorized" };

  const id = formData.get("id") as string;
  return dbOperation(() => 
    prisma.user.delete({ where: { NIC: id } })
  );
};

// Exam Actions
export const createExam = async (
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> => {
  const { authorized, session } = await checkAuth(["suser", "admin"]);
  if (!authorized) return { success: false, error: "Unauthorized" };

  const data = Object.fromEntries(formData.entries()) as unknown as ExamSchema;

  return dbOperation(() =>
    prisma.exam.create({
      data: {
        name: data.name,
        date: new Date(data.date),
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        Day: data.Day,
        subjectId: data.subjectId,
        adminId: session?.user?.id || 'default-admin-id',
      },
    })
  );
};

export const updateExam = async (
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> => {
  const { authorized } = await checkAuth(["suser", "admin"]);
  if (!authorized) return { success: false, error: "Unauthorized" };

  const data = Object.fromEntries(formData.entries()) as unknown as ExamSchema;

  return dbOperation(() =>
    prisma.exam.update({
      where: { id: data.id },
      data: {
        name: data.name,
        date: new Date(data.date),
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        Day: data.Day,
        subjectId: data.subjectId,
        adminId: data.adminId,
      },
    })
  );
};

export const deleteExam = async (
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> => {
  const { authorized } = await checkAuth(["admin"]);
  if (!authorized) return { success: false, error: "Unauthorized" };

  const id = parseInt(formData.get("id") as string);
  return dbOperation(() => 
    prisma.exam.delete({ where: { id } })
  );
};