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

const { auth } = NextAuth(authConfig)

export default auth((req): any => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth 
  const role = req.auth?.user?.role
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



  if (isAuthRoute) {
    if (isLoggedIn) {
      let redirecturl="";
      if(req.auth?.user.role==="USER"){
        redirecturl=DEFAULT_LOGIN_REDIRECT_USER;
      }else if(req.auth?.user.role==="ADMIN"){
        redirecturl=DEFAULT_LOGIN_REDIRECT_ADMIN;
      }else if(req.auth?.user.role==="BANK"){
        redirecturl=DEFAULT_LOGIN_REDIRECT_BANK;
      }
  
      return NextResponse.redirect(new URL(redirecturl, nextUrl))
    }
    return null
  }

   // Protected routes logic - users can only access routes designated for their role
   if (!isPublicRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/auth/signin", nextUrl))
    }
    
    // Role-based access control with redirect to appropriate dashboard
    if (isUSER && role !== "USER") {
      let redirecturl="";
      if(role==="ADMIN"){
        redirecturl=DEFAULT_LOGIN_REDIRECT_ADMIN;
      }else if(role==="BANK"){
        redirecturl=DEFAULT_LOGIN_REDIRECT_BANK;
      }
      return NextResponse.redirect(new URL(redirecturl, nextUrl))
    }
    
    if (isADMIN && role !== "ADMIN") {
      let redirecturl="";
      if(role==="USER"){
        redirecturl=DEFAULT_LOGIN_REDIRECT_USER;
      }else if(role==="BANK"){
        redirecturl=DEFAULT_LOGIN_REDIRECT_BANK;
      }
      return NextResponse.redirect(new URL(redirecturl, nextUrl))
    }
    
    if (isBANK && role !== "BANK") {
      let redirecturl="";
      if(role==="USER"){
        redirecturl=DEFAULT_LOGIN_REDIRECT_USER;
      }else if(role==="ADMIN"){
        redirecturl=DEFAULT_LOGIN_REDIRECT_ADMIN;
      }
      return NextResponse.redirect(new URL(redirecturl, nextUrl))
    }
  }
  return null
})

export const config = {
  matcher: ["/((?!.*\\..*|_next|404).*)", "/", "/(api|trpc)(.*)"],
}
