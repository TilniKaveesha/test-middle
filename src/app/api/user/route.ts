import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { Phone } from "lucide-react";

// Define the Zod schema for user input validation
const UserSchema = z.object({
  NIC: z.string().min(1, "NIC is required").max(10, "Only can have 10 characters"),
  username: z.string().min(3, "Username should have at least 3 characters").max(30, "Username is too long"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password should have at least 8 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phoneNumber: z.string().min(10,"Phone Number us required").max(10,"Only have 10 characters")
});

type UserInput = z.infer<typeof UserSchema>;

export async function POST(req: Request) {
  try {
    const body: UserInput = await req.json();
    console.log("Received Data:", body);

    const parseResult = UserSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { errors: parseResult.error.errors.map(err => err.message) },
        { status: 400 }
      );
    }

    const { NIC, username, email, password, firstName, lastName, phoneNumber } = parseResult.data;

    // Check if NIC exists in 'suser' and 'user' tables
    const existingSuserByNIC = await prisma.suser.findUnique({ where: { NIC } });
    const existingUserByNIC = await prisma.user.findUnique({ where: { NIC } });

    if (existingSuserByNIC || existingUserByNIC) {
      return NextResponse.json({ error: "The NIC provided already exists in the system." }, { status: 409 });
    }

    // Check if email exists in 'suser' and 'user' tables
    const existingSuserByEmail = await prisma.suser.findUnique({ where: { Email: email } });
    const existingUserByEmail = await prisma.user.findUnique({ where: { Email: email } });

    if (existingSuserByEmail || existingUserByEmail) {
      return NextResponse.json({ error: "This email is already registered." }, { status: 409 });
    }

    // Check if phone number already exists
    const existingPhoneNumber = await prisma.suser.findUnique({ where: { PhoneNumber: phoneNumber } });
    if (existingPhoneNumber) {
      return NextResponse.json({ error: "Phone number already exists in the system." }, { status: 409 });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new Suser
    const newSuser = await prisma.suser.create({
      data: {
        NIC,
        username,
        Email: email,
        Password: hashedPassword,
        FirstName: firstName,
        LastName: lastName,
        PhoneNumber: phoneNumber || "", // Default to empty string if not provided
        school: "",          // Default values
        Address: "",
        gender: "MALE",      // Default gender
        stream: "MATHS",     // Default stream
      },
    });

    const { Password, ...restSuser } = newSuser;

    return NextResponse.json(
      { suser: restSuser, message: "Suser created successfully. User creation can be done later." },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error during Suser creation:", error);
    return NextResponse.json(
      { message: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}

