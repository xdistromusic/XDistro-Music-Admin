import { AdminSession, AdminUser } from "@/types/admin";

const ADMIN_SESSION_KEYS = {
  token: "admin:token",
  session: "admin:session",
} as const;

const safeJsonParse = <T>(value: string | null): T | null => {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};

export const getAdminToken = (): string | null => localStorage.getItem(ADMIN_SESSION_KEYS.token);

export const getStoredAdminSession = (): AdminSession | null => {
  const session = safeJsonParse<AdminSession>(localStorage.getItem(ADMIN_SESSION_KEYS.session));

  if (!session) {
    return null;
  }

  if (Date.now() >= session.expiresAt) {
    clearAdminSession();
    return null;
  }

  return session;
};

export const getStoredAdminUser = (): AdminUser | null => getStoredAdminSession()?.user ?? null;

export const persistAdminSession = (session: AdminSession) => {
  localStorage.setItem(ADMIN_SESSION_KEYS.token, session.token);
  localStorage.setItem(ADMIN_SESSION_KEYS.session, JSON.stringify(session));
};

export const clearAdminSession = () => {
  localStorage.removeItem(ADMIN_SESSION_KEYS.token);
  localStorage.removeItem(ADMIN_SESSION_KEYS.session);
};