import { getVerifationTokenByEmail } from "@/data/verification-token";
import { v4 as uuidv4 } from 'uuid';
import { db } from "@/lib/db";
import { getpasswordResetTokenByEmail } from "@/data/password-reset-token";
// To Generate random OTP Better then Math.random
import crypto from "crypto";
import { getTwoFactorTokenByEmail } from "@/data/two-factor-token";

export const generateTwoFactorToken = async(email:string) => {
  // 100000 and 100_000 same thing this is a little trick to read numbers better
  const token = crypto.randomInt(100_000,1_000_000) + "";


  //TODO:: Later change to 15 min token expires
  const expires = new Date(new Date().getTime() + 3600*1000);

  const existingToken = await getTwoFactorTokenByEmail(email);

  if(existingToken)
    await db.twoFactorConfirmation.delete({
      where:{id:existingToken.id}});

  const twoFactorToken = await db.twoFactorToken.create({
    data:{
      email,
      token,
      expires,
    }
  });

  return twoFactorToken;

}

// Token for reset-password
export const generatePasswordResetToken = async (email:string)=>{
  const token = uuidv4();

  //expires in 1 hr
  const expires = new Date(new Date().getTime() + 3600*1000);

  const existingToken = await getpasswordResetTokenByEmail(email);

  if(existingToken){
    await db.passwordResetToken.delete({
      where:{
        id:existingToken.id
      }
    });
  }

  const passwordResetToken = await db.passwordResetToken.create({
    data:{
      token,
      email,
      expires,
    }
  });

  return passwordResetToken;
}


// Token for email verification
export const generateVerificationToken = async(email:string) => {

  const token = uuidv4();

  //expire the token in 1hr
  const expires = new Date(new Date().getTime() + 3600*1000);

  const existingToken = await getVerifationTokenByEmail(email);

  if(existingToken) {
    await db.verificationToken.delete({
      where:{
        id:existingToken.id,
      }
    })
  }

  const verficationToken = await db.verificationToken.create({
    data:{
      email,
      token,
      expires
    }
  });

  return verficationToken;
}