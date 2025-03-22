"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { BankName, UserRole } from "@prisma/client";
import { db } from "@/lib/db";

// Validation schema for creating a new user
const createUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  role: z.enum(["ADMIN", "USER", "BANK"]),
  bankName: z.nativeEnum(BankName).optional(),
  aadhaarNumber: z.string().regex(/^\d{12}$/).optional().or(z.literal('')),
  PAN: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/).optional().or(z.literal('')),
});

// Function to create a new user
export async function createUser(formData: z.infer<typeof createUserSchema>) {
  try {
    const result = createUserSchema.safeParse(formData);
    
    if (!result.success) {
      return { error: "Invalid input data", details: result.error.flatten() };
    }
    
    const { name, email, password, role, bankName, aadhaarNumber, PAN } = result.data;
    
    // Check if user with email already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });
    
    if (existingUser) {
      return { error: "User with this email already exists" };
    }
    
    // Hash the password
    // const hashedPassword = await hash(password, 10);
    const hashedPassword = password;
    
    // Create the user
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role as UserRole,
        bankName: role === "BANK" ? bankName : undefined,
        aadhaarNumber: aadhaarNumber || undefined,
        PAN: PAN || undefined,
      },
    });
    
    revalidatePath("/admin/dashboard");
    return { success: true, userId: user.id };
  } catch (error) {
    console.error("Error creating user:", error);
    return { error: "Failed to create user" };
  }
}

// Function to get all users
export async function getUsers() {
  try {
    const users = await db.user.findMany({
      orderBy: {
        id: "desc",
      },
    });
    
    return { users };
  } catch (error) {
    console.error("Error fetching users:", error);
    return { error: "Failed to fetch users" };
  }
}

// Function to delete a user
export async function deleteUser(userId: string) {
  try {
    await db.user.delete({
      where: {
        id: userId,
      },
    });
    
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { error: "Failed to delete user" };
  }
}

// Function to get bank user activity (last credit score checks)
export async function getBankActivity(userId: string) {
  try {
    const activity = await db.creditScoreBank.findMany({
      where: {
        userId,
      },
      orderBy: {
        recordedAt: "desc",
      },
      take: 10,
    });
    
    return { activity };
  } catch (error) {
    console.error("Error fetching bank activity:", error);
    return { error: "Failed to fetch bank activity" };
  }
}