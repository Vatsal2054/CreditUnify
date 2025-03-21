//server cmp
import {auth} from "@/auth"

type User = {
  name: string
  email: string
  image: string | null
  id: string
  isTwoFactorEnable: boolean
  isOAuth: boolean
  role: "ADMIN" | "USER" | "BANK"
}

/**
 * Retrieves the current user from the session.
 *
 * @return {User | undefined} The user object if available, otherwise undefined.
 */
export const currentUserServer = async (): Promise<User | undefined> => {
  const session = await auth()
  //@ts-ignore
  return session?.user
}

export const currentUserRole = async() => {
  const session = await auth();
  
  return session?.user.role;
}