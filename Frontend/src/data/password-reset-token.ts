import { db } from "@/lib/db";

export const getpasswordResetTokenByToken = async (token:string) =>{
  try{
    const passwordResetToken = await db.passwordResetToken.findUnique({
      where: {token}
    });

    return passwordResetToken;
  }catch(e){
    return null;
  }
}

export const getpasswordResetTokenByEmail = async (email:string) =>{
  try{
    const passwordResetToken = await db.passwordResetToken.findFirst({
      where: {email}
    });

    return passwordResetToken;
  }catch(e){
    return null;
  }
}