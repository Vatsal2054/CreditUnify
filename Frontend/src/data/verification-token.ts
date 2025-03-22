import { db } from "@/lib/db"

export const getVerifationTokenByEmail= async(email:string)=>{
  try{
    const verifationToken = await db.verificationToken.findFirst({
      where:{
        email
      }
    });

    return verifationToken;
  }catch(e){
    return null;
  }
}

export const getVerifationTokenByToken= async(token:string)=>{
  try{
    const verifationToken = await db.verificationToken.findFirst({
      where:{
        token
      }
    });

    return verifationToken;
  }catch(e){
    return null;
  }
}