// app/api/auth/register/suser/route.ts
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Validation schema matching frontend
const registerSchema = z.object({
  NIC: z.string().min(1).max(10),
  username: z.string().min(3).max(30),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phoneNumber: z.string(),
  school: z.string().min(1),
  password: z.string().min(8),
  role: z.literal('suser')
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = registerSchema.parse(body);
    
    // Check if NIC already exists in either table
    const existingUser = await prisma.$transaction([
      prisma.suser.findUnique({ where: { NIC: validatedData.NIC } }),
      prisma.user.findUnique({ where: { NIC: validatedData.NIC } })
    ]);
    
    if (existingUser[0] || existingUser[1]) {
      return NextResponse.json(
        { error: 'NIC already registered' },
        { status: 400 }
      );
    }

    // Check if username is taken
    const usernameExists = await prisma.$transaction([
      prisma.suser.findFirst({ where: { username: validatedData.username } })
    ]);
    
    if (usernameExists[0]) {
      return NextResponse.json(
        { error: 'Username already taken' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    // Create suser in database
    const newSuser = await prisma.suser.create({
      data: {
        NIC: validatedData.NIC,
        username: validatedData.username,
        FirstName: validatedData.firstName,
        LastName: validatedData.lastName,
        Email: validatedData.email,
        PhoneNumber: validatedData.phoneNumber,
        school: validatedData.school,
        Password: hashedPassword,
        role: validatedData.role,
        Address: "",
        gender: "MALE",      // Default gender
        stream: "MATHS",  
      }
    });

    return NextResponse.json({
      success: true,
      user: {
        NIC: newSuser.NIC,
        username: newSuser.username,
        role: newSuser.role
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}