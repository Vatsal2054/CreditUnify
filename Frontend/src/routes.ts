/**
 *  An Array of routes that are accessible to public
 * These routes do not require aythentication
 * @type{string[]}
 *
 */
export const publicRoutes = [
  "/",
  "/auth/new-verification",
  // "/admin-dashboard",
  // "/bank-dashboard"
]

/**
 *
 * An Array of routes that are used for authentication
 * These routes will redirect logged in users to /settings
 * @type{string[]}
 *
 */

export const authRoutes = [
  "/auth/signin",
  "/auth/signup",
  "/auth/error",
  "/auth/reset",
  "/auth/new-password",
]

/**
 *  The prefix for Api authentication routes
 * Routes that start with this
 * @type{string[]}
 *
 */

export const apiAuthPrefix = "/api/auth"

export const privateUSER=[
  "/user-dashboard",
]

export const privateADMIN=[
  "/admin-dashboard",
]

export const privateBANK=[
  "/bank-dashboard",
]
/**
 *  The default redirect path after loggong in
 * @type{string}
 *
 */

export const DEFAULT_LOGIN_REDIRECT_USER = "/user-dashboard"
export const DEFAULT_LOGIN_REDIRECT_BANK = "/bank-dashboard"
export const DEFAULT_LOGIN_REDIRECT_ADMIN = "/admin-dashboard"

export const apiRoutes = [
  "/api/*"
]

export const privateRoutes = [
  "/admin-dashboard",
  "/bank-dashboard",
  "/user-dashboard",
  "/settings"
]
