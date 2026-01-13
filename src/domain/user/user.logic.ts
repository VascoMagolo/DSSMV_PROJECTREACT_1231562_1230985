import { CustomUser } from './user.types'

type DbUser = {
  id: string
  email: string
  password: string
  name?: string
  preferred_language?: string
}

export function validateLogin(
  dbUser: DbUser | null,
  passwordInput: string
): { user: CustomUser | null; error: string | null } {
  if (!dbUser) {
    return { user: null, error: 'User not found.' }
  }

  if (dbUser.password !== passwordInput) {
    return { user: null, error: 'Incorrect password.' }
  }

  return {
    user: {
      id: dbUser.id,
      email: dbUser.email,
      username: dbUser.name,
      preferred_language: dbUser.preferred_language,
    },
    error: null,
  } 
}
export function canShowAccountTab(params: { user: CustomUser | null; isGuest: boolean }): boolean {
  const { user, isGuest } = params;
  if (isGuest) return false;
  return !!user;
}
