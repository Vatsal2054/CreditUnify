/**
 *  An Array of routes that are accessible to public
 * These routes do not require aythentication
 * @type{string[]}
 *
 */
export const publicRoutes = [
  "/",
  "/auth/new-verification",
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

/**
 *  The default redirect path after loggong in
 * @type{string}
 *
 */

export const DEFAULT_LOGIN_REDIRECT_USER = "/dashboard-user"
export const DEFAULT_LOGIN_REDIRECT_BANK = "/dashboard-bank"
export const DEFAULT_LOGIN_REDIRECT_ADMIN = "/dashboard-admin"

export const apiRoutes = [
  "/api/*"
]

export const privateRoutes = [
  "/dashboard",
]
