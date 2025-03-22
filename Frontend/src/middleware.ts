import NextAuth from "next-auth"
import { NextResponse } from "next/server"
import authConfig from "./auth.config"
import {
  apiAuthPrefix,
  apiRoutes,
  authRoutes,
  DEFAULT_LOGIN_REDIRECT_ADMIN,
  DEFAULT_LOGIN_REDIRECT_BANK,
  DEFAULT_LOGIN_REDIRECT_USER,
  privateADMIN,
  privateBANK,
  privateRoutes,
  privateUSER,
  publicRoutes,
} from "./routes"
import { cookies } from 'next/headers';
const { auth } = NextAuth(authConfig)

export default auth((req):any => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth 
  const isApiAuthRoute = nextUrl.pathname.toString().startsWith(apiAuthPrefix)
  const isApiRoute = apiRoutes.includes(nextUrl.pathname)
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname)
  const isAuthRoute = authRoutes.includes(nextUrl.pathname)
  const isPrivateRoute = privateRoutes.includes(nextUrl.pathname)
  const isUSER = privateUSER.includes(nextUrl.pathname)
  const isBANK = privateBANK.includes(nextUrl.pathname)
  const isADMIN = privateADMIN.includes(nextUrl.pathname)

  const routeExists =
    isApiAuthRoute ||
    isPublicRoute ||
    isAuthRoute ||
    isPrivateRoute ||
    isApiRoute ||
    isUSER ||
    isADMIN||
    isBANK

    
    
    if (!routeExists) {
      return NextResponse.redirect(new URL("/404", nextUrl))
    }
    
    if (isApiAuthRoute) {
      return null
    }
    
    if (isApiRoute && isLoggedIn) {
      return NextResponse.next()
    }
    
    const role = cookies().get("role")?.value 
    console.log(nextUrl.pathname,":",isUSER, " ",isADMIN, " ",isBANK," ",req.auth," is login",isLoggedIn,"\nROLE: ",role);
    
    if (isAuthRoute || isPublicRoute) {
      if (isLoggedIn) {
        let redirecturl=DEFAULT_LOGIN_REDIRECT_USER;
        if(role==="USER"){
          redirecturl=DEFAULT_LOGIN_REDIRECT_USER;
        }else if(role==="ADMIN"){
          redirecturl=DEFAULT_LOGIN_REDIRECT_ADMIN;
        }else if(role==="BANK"){
          redirecturl=DEFAULT_LOGIN_REDIRECT_BANK;
        }
        
        return NextResponse.redirect(new URL(redirecturl, nextUrl))
      }
      return null
    }
    if(isLoggedIn){
      console.log(nextUrl.pathname,":",isUSER, " ",isADMIN, " ",isBANK," ",req.auth," ROLE:",role);
      // role===BANK then they can not access routes in isADMIN AND isUSER
      if ((isBANK || isADMIN)&& role==="USER") {
          return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT_USER, nextUrl))
      }else if((isUSER || isADMIN)&& role==="BANK"){
          return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT_BANK, nextUrl))
      }else if((isBANK || isUSER)&& role==="ADMIN"){
          return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT_ADMIN, nextUrl))
      }
    }else{
      return NextResponse.redirect(new URL("/auth/signin", nextUrl))
    }
  
  return null
})

export const config = {
  matcher: ["/((?!.*\\..*|_next|404).*)", "/", "/(api|trpc)(.*)"],
}

