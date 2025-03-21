import NextAuth ,{type DefaultSession} from "next-auth"
import authConfig from "./auth.config"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { db } from "./lib/db";
import { getUserById } from "./data/user";
import { getTwoFactorConformationByUserId } from "./data/two-factor-conformation";
import { getAccountByUserId } from "./data/account";
 
export const { handlers: { GET, POST }, auth, signIn, signOut } = NextAuth({
  events:{
    async linkAccount({user}){
      await db.user.update({
        where:{id:user.id},
        data:{emailVerified:new Date()}
      });
    },
  },
  callbacks:{
    // Modify the jwt token / Action to take while generation of token
    async jwt({token}){
      // token.sub has user id (USER table id ) 
      if(!token.sub)
        return token;

      const existingUser = await  getUserById(token.sub);

      if(!existingUser) return token;

      const existingAccount = await getAccountByUserId(existingUser.id);

      token.isOAuth = !!existingAccount;

      token.name = existingUser.name;
      token.email = existingUser.email;
      token.role = existingUser.role;
      token.isTwoFactorEnable = existingUser.isTwoFactorEnable;
      if(token.role==="USER" ){
        token.aadhaarNumber = existingUser.aadhaarNumber ?? "";
        token.PAN = existingUser.PAN ?? "";
      }
      return token;

    },
    //Modify the session / Action to take while generation of session
    async session({token,session}){
      // console.log({Sessiontoken:token,session});
      // id of our user is in token.sub 
      if(token.sub && session.user) 
        session.user.id = token.sub;

      if(token.role && session.user)
        session.user.role = token.role;

      if(session.user){
        session.user.isTwoFactorEnabled=token.isTwoFactorEnable as boolean;
        session.user.name = token.name as string;

        session.user.email= token.email as string;
        session.user.isOAuth = token.isOAuth as boolean;
      }

      if(session.user.role==="USER"){
        session.user.aadhaarNumber = token.aadhaarNumber as string;
        session.user.PAN = token.PAN as string;
      }
      return session;
    },

    // Action to tack when user signin/login
    async signIn({user,account}){
      if (account?.provider === "google") {
        try {
          const existingUser = await db.user.findUnique({
            // @ts-ignore
            where: { email: user?.email },
          })

          if (existingUser) {
            // If the user exists but email is not verified, update the emailVerified field
            if (!existingUser.emailVerified) {
              await db.user.update({
                where: { id: existingUser.id },
                data: { emailVerified: new Date() },
              })
            }
            return true
          } else {
            // If it's a new user, emailVerified will be set automatically by the adapter
            return true
          }
        } catch (error) {
          console.error("Error in Google sign in:", error)
          return false
        }
      }

      try {
        const existingUser = await getUserById(user.id || "")

        // Prevent sign in without email verification
        if (!existingUser || !existingUser.emailVerified) return false

        // 2Factor Authentication check
        if (existingUser.isTwoFactorEnable) {
          const twoFactorConfirmation = await getTwoFactorConformationByUserId(
            existingUser.id
          )
          // console.log("n\n\n\n TFA: ", twoFactorConfirmation)
          if (!twoFactorConfirmation) return false

          // Delete two factor confirmation for next sign in
          await db.twoFactorConfirmation.delete({
            where: {
              id: twoFactorConfirmation.id,
            },
          })
        }
        return true
      } catch (error) {
        console.error("Error in signIn callback:", error)
        return false
      }
    },
  },
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },

  ...authConfig,
  pages:{
    signIn:"/auth/login",

    // IF any Error comes During OAuth Then Redirect to this page.
    error:"/auth/error"
  }
})