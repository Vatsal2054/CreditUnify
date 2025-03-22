"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { BankName, UserRole } from "@prisma/client";
import { db } from "@/lib/db";
import { hash } from "bcryptjs";
import { currentUserServer } from "@/lib/auth";

// // Validation schema for creating a new user
// const createUserSchema = z.object({
//   name: z.string().min(2).optional(),
//   email: z.string().email(),
//   password: z
//     .string()
//     .min(8)
//     .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
//   role: z.enum(["ADMIN", "USER", "BANK"]),
//   bankName: z.nativeEnum(BankName).optional(),
//   aadhaarNumber: z.string().regex(/^\d{12}$/).optional().or(z.literal('')),
//   PAN: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/).optional().or(z.literal('')),
// });

// // Function to create a new user
// export async function createUser(formData: z.infer<typeof createUserSchema>) {
//   try {
//     const result = createUserSchema.safeParse(formData);
    
//     if (!result.success) {
//       return { error: "Invalid input data", details: result.error.flatten() };
//     }
    
//     const { name, email, password, role, bankName, aadhaarNumber, PAN } = result.data;
    
//     // Check if user with email already exists
//     const existingUser = await db.user.findUnique({
//       where: { email },
//     });
    
//     if (existingUser) {
//       return { error: "User with this email already exists" };
//     }
    
//     // Hash the password
//     // const hashedPassword = await hash(password, 10);
//     const hashedPassword = password;
    
//     // Create the user
//     const user = await db.user.create({
//       data: {
//         name,
//         email,
//         password: hashedPassword,
//         role: role as UserRole,
//         bankName: role === "BANK" ? bankName : undefined,
//         aadhaarNumber: aadhaarNumber || undefined,
//         PAN: PAN || undefined,
//       },
//     });
    
//     revalidatePath("/admin/dashboard");
//     return { success: true, userId: user.id };
//   } catch (error) {
//     console.error("Error creating user:", error);
//     return { error: "Failed to create user" };
//   }
// }

// // Function to get all users
// export async function getUsers() {
//   try {
//     const users = await db.user.findMany({
//       orderBy: {
//         id: "desc",
//       },
//     });
    
//     return { users };
//   } catch (error) {
//     console.error("Error fetching users:", error);
//     return { error: "Failed to fetch users" };
//   }
// }

// // Function to delete a user
// export async function deleteUser(userId: string) {
//   try {
//     await db.user.delete({
//       where: {
//         id: userId,
//       },
//     });
    
//     revalidatePath("/admin/dashboard");
//     return { success: true };
//   } catch (error) {
//     console.error("Error deleting user:", error);
//     return { error: "Failed to delete user" };
//   }
// }

// // Function to get bank user activity (last credit score checks)
// export async function getBankActivity(userId: string) {
//   try {
//     const activity = await db.creditScoreBank.findMany({
//       where: {
//         userId,
//       },
//       orderBy: {
//         recordedAt: "desc",
//       },
//       take: 10,
//     });
    
//     return { activity };
//   } catch (error) {
//     console.error("Error fetching bank activity:", error);
//     return { error: "Failed to fetch bank activity" };
//   }
// }

const bankNameValues = [
  'SBI', 'HDFC', 'ICICI', 'AXIS', 'KOTAK', 'PNB', 'BOB', 'CANARA', 'IDBI', 'UCO', 'BOI',
  'IOB', 'CBI', 'SIB', 'FEDERAL', 'KVB', 'LVB', 'DBS', 'CITI', 'HSBC', 'SC', 'RBL', 'YES',
  'INDUSIND', 'BANDHAN', 'AU', 'IDFC', 'EQUITAS', 'ESAF', 'UJJIVAN', 'SMALLFIN', 'PAYTM',
  'FINCARE', 'JANA', 'NORTHEAST', 'GRAMEEN', 'UTKARSH', 'SURYODAY', 'JALGAON', 'AKOLA',
  'KASHI', 'SAMARTH', 'KAIJS', 'KALUPUR', 'OTHER'
] as const;


const userCreateSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email(),
  password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
    { message: "Password must contain at least one uppercase letter, one lowercase letter, and one number" }),
  role: z.enum(['BANK']),
  bankName: z.enum(bankNameValues).optional()
});

export type UserFormData = z.infer<typeof userCreateSchema>;

export type ActionResponse = {
  success: boolean;
  message: string;
  user?: any;
  errors?: {
    path: string;
    message: string;
  }[];
};

export async function createBankUser(formData: UserFormData): Promise<ActionResponse> {
  const currentUser = await currentUserServer();
  try {
    // Check if the user is authorized to create bank users
    
    if (!currentUser || currentUser?.role !== 'ADMIN') {
      return {
        success: false,
        message: 'Unauthorized. Only administrators can create bank users.',
      };
    }
    
    // Validate the input data
    const validatedData = userCreateSchema.parse(formData);
    
    // Check if email already exists
    const existingUser = await db.user.findUnique({
      where: { email: validatedData.email }
    });

    if (existingUser) {
      return {
        success: false,
        message: 'Email already in use. Please use a different email address.',
      };
    }

    // Hash the password
    const hashedPassword = await hash(validatedData.password, 10);

    // Create the user
    const user = await db.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        role: UserRole.BANK,
        bankName: validatedData.bankName as BankName | undefined
      }
    });

    // Don't return the password in the response
    const { password, ...userWithoutPassword } = user;
    
    // Refresh the data cache
    revalidatePath('/admin-dashboard');
    
    return {
      success: true,
      message: 'Bank user created successfully',
      user: userWithoutPassword
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Format Zod errors for better frontend display
      const formattedErrors = error.errors.map(err => ({
        path: err.path.join('.'),
        message: err.message
      }));
      
      return {
        success: false,
        message: 'Validation failed',
        errors: formattedErrors
      };
    }
    
    console.error('Error creating user:', error);
    
    return {
      success: false,
      message: 'Failed to create bank user',
      errors: [{ 
        path: 'root', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      }]
    };
  } 
}