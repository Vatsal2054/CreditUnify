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
  privateRoutes,
  publicRoutes,
} from "./routes"

const { auth } = NextAuth(authConfig)

export default auth((req): any => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth 
  const isApiAuthRoute = nextUrl.pathname.toString().startsWith(apiAuthPrefix)
  const isApiRoute = apiRoutes.includes(nextUrl.pathname)
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname)
  const isAuthRoute = authRoutes.includes(nextUrl.pathname)
  const isPrivateRoute = privateRoutes.includes(nextUrl.pathname)

  const routeExists =
    isApiAuthRoute ||
    isPublicRoute ||
    isAuthRoute ||
    isPrivateRoute ||
    isApiRoute ||
    nextUrl.pathname === DEFAULT_LOGIN_REDIRECT_ADMIN || 
    nextUrl.pathname === DEFAULT_LOGIN_REDIRECT_BANK ||
    nextUrl.pathname === DEFAULT_LOGIN_REDIRECT_USER

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
  return null
})

export const config = {
  matcher: ["/((?!.*\\..*|_next|404).*)", "/", "/(api|trpc)(.*)"],
}
