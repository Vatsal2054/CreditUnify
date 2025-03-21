"use server";

import { currentUserServer } from "@/lib/auth";
import { db } from "@/lib/db";
import { BankName } from "@prisma/client";
import { notFound } from "next/navigation";


export async function updateUserDocuments(data: {
  aadhaarNumber?: string;
  PAN?: string;
  bankName?: string;
}) {
  const user = await currentUserServer();
  if (!user) return notFound();
  
  try {
      await db.user.update({
        where: { id: user.id },
        data: {
          aadhaarNumber:data.aadhaarNumber,
          PAN:data.PAN,
          bankName:data.bankName as BankName
        },
      });
    return { success: true };
  } catch (e) {
    console.error("Error updating user documents:", e);
    return { success: false };
  }
}

export async function getUserDocuments(user_id: string | undefined) {
  if (!user_id) return notFound();
  const user = await currentUserServer();
  if (!user) return notFound();
  
  try {
    const userData = await db.user.findUnique({
      where: { id: user.id },
      select: { 
        aadhaarNumber: true,
        PAN: true,
        bankName: true 
      },
    });
    return userData;
  } catch (e) {
    console.error("Error fetching user documents:", e);
    return null;
  }
}