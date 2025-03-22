"use server";

// /actions/auth/settings.ts
import { getUserById } from "@/data/user";
import { currentUserServer } from "@/lib/auth";
import { db } from "@/lib/db";
import { SettingsSchema } from "@/lib/index";
import { getUserByEmail } from "@/data/user";
import { compare, hash } from "bcryptjs";
import { z } from "zod";
import { BankName } from "@prisma/client";

/**
 * Server action to update user personal information (name and email)
 */
export const updatePersonalInfo = async ({
  name,
  email,
}: {
  name?: string;
  email?: string;
}) => {
  try {
    const user = await currentUserServer();

    if (!user) {
      return { error: "Unauthorized" };
    }

    // Don't allow OAuth users to change their email
    if (user.isOAuth && email && email !== user.email) {
      return { error: "Email cannot be changed for OAuth accounts" };
    }

    // Check if email is already in use by another account
    if (email && email !== user.email) {
      const existingUser = await getUserByEmail(email);
      
      if (existingUser && existingUser.id !== user.id) {
        return { error: "Email already in use" };
      }
    }

    // Update user information
    await db.user.update({
      where: { id: user.id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
      },
    });

    return { success: "Personal information updated successfully" };
  } catch (error) {
    console.error("Error updating personal information:", error);
    return { error: "Failed to update personal information" };
  }
};

/**
 * Server action to update user password
 */
export const updatePassword = async ({
  currentPassword,
  newPassword,
}: {
  currentPassword: string;
  newPassword: string;
}) => {
  try {
    const user = await currentUserServer();

    if (!user) {
      return { error: "Unauthorized" };
    }

    if (user.isOAuth) {
      return { error: "Password cannot be changed for OAuth accounts" };
    }

    const dbUser = await getUserById(user.id);

    if (!dbUser || !dbUser.password) {
      return { error: "User not found or password not set" };
    }

    // Verify current password
    const passwordMatch = await compare(currentPassword, dbUser.password);

    if (!passwordMatch) {
      return { error: "Current password is incorrect" };
    }

    // Hash and store new password
    const hashedPassword = await hash(newPassword, 10);
    
    await db.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return { success: "Password updated successfully" };
  } catch (error) {
    console.error("Error updating password:", error);
    return { error: "Failed to update password" };
  }
};

/**
 * Server action to update two-factor authentication status
 */
export const updateTwoFactor = async ({ enabled }: { enabled: boolean }) => {
  try {
    const user = await currentUserServer();

    if (!user) {
      return { error: "Unauthorized" };
    }

    if (user.isOAuth) {
      return { error: "Two-factor authentication cannot be modified for OAuth accounts" };
    }

    // Update user's two-factor preference
    await db.user.update({
      where: { id: user.id },
      data: { isTwoFactorEnable: enabled },
    });

    // If disabling 2FA, remove any existing confirmation
    if (!enabled) {
      await db.twoFactorConfirmation.deleteMany({
        where: { userId: user.id },
      });
    }

    return { success: `Two-factor authentication ${enabled ? "enabled" : "disabled"} successfully` };
  } catch (error) {
    console.error("Error updating two-factor authentication:", error);
    return { error: "Failed to update two-factor authentication" };
  }
};

/**
 * Server action to get user documents (Aadhaar, PAN, Bank details)
 */
export const getUserDocuments = async (userId: string) => {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        aadhaarNumber: true,
        PAN: true,
        bankName: true,
        role: true,
      },
    });

    if (!user) {
      return null;
    }

    return user;
  } catch (error) {
    console.error("Error fetching user documents:", error);
    return null;
  }
};

/**
 * Server action to update user documents (Aadhaar, PAN, Bank details)
 */
export const updateUserDocuments = async ({
  aadhaarNumber,
  PAN,
  bankName,
}: {
  aadhaarNumber?: string;
  PAN?: string;
  bankName?: string;
}) => {
  try {
    const user = await currentUserServer();

    if (!user) {
      return { error: "Unauthorized" };
    }

    // Validate based on user role
    if (user.role === "USER") {
      // Validate Aadhaar number format
      if (aadhaarNumber && !/^\d{12}$/.test(aadhaarNumber)) {
        return { error: "Aadhaar number must be 12 digits" };
      }

      // Validate PAN format
      if (PAN && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(PAN)) {
        return { error: "PAN must be in the format ABCDE1234F" };
      }

      // Update user documents for regular users
      await db.user.update({
        where: { id: user.id },
        data: {
          ...(aadhaarNumber && { aadhaarNumber }),
          ...(PAN && { PAN }),
        },
      });
    } else if (user.role === "BANK") {
      // Validate bank name
      if (bankName) {
        // Check if the bankName is a valid enum value
        try {
          // This will throw an error if bankName is not a valid enum value
          const validBankName = bankName as BankName;
          
          await db.user.update({
            where: { id: user.id },
            data: {
              bankName: validBankName,
            },
          });
        } catch (e) {
          return { error: "Invalid bank name provided" };
        }
      } else {
        return { error: "Bank name is required" };
      }
    } else {
      return { error: "Document management not available for this role" };
    }

    return { success: "Documents updated successfully" };
  } catch (error) {
    console.error("Error updating user documents:", error);
    return { error: "Failed to update documents" };
  }
};