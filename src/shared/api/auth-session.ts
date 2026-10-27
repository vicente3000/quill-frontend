import { AuthResponseSchema, type AuthResponseInput, type UserProfile } from './validators'

export const AUTH_STORAGE_KEY = 'quill_auth'
export const UNAUTHORIZED_EVENT = 'quill:unauthorized'

export interface AuthSession {
  token: string
  user: UserProfile
}

let activeSession: AuthSession | null = null

function removeLegacyStoredSession() {
  const hadStoredSession = sessionStorage.getItem(AUTH_STORAGE_KEY) !== null
  sessionStorage.removeItem(AUTH_STORAGE_KEY)
  return hadStoredSession
}

export function getAuthSession() {
  removeLegacyStoredSession()
  return activeSession
}

export function getAuthToken() {
  return getAuthSession()?.token ?? null
}

export function setAuthSession(input: AuthResponseInput) {
  removeLegacyStoredSession()
  const response = AuthResponseSchema.parse(input)
  activeSession = {
    token: response.accessToken,
    user: response.user,
  }
  return activeSession
}

export function updateAuthUser(updates: Partial<UserProfile>) {
  removeLegacyStoredSession()
  if (!activeSession) return null

  activeSession = {
    ...activeSession,
    user: { ...activeSession.user, ...updates },
  }
  return activeSession
}

export function clearAuthSession() {
  const hadActiveSession = activeSession !== null
  const hadStoredSession = removeLegacyStoredSession()
  activeSession = null

  if (hadActiveSession || hadStoredSession) {
    window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
  }
}
