import { adminBackendConfig, isAdminDummyAuthEnabled } from "@/config/adminBackend";
import {
  clearAdminSession,
  getAdminToken,
  getStoredAdminSession,
  getStoredAdminUser,
  persistAdminSession,
} from "@/lib/adminSession";
import { AdminPermission, AdminSession, AdminUser } from "@/types/admin";

const ADMIN_PERMISSIONS: AdminPermission[] = [
  "dashboard",
  "users",
  "releases",
  "artists",
  "royalties",
  "royalty_requests",
  "report_requests",
  "takedown_requests",
  "settings",
];

const DEFAULT_SESSION_MS = 2 * 60 * 60 * 1000;
const REMEMBERED_SESSION_MS = 8 * 60 * 60 * 1000;

export interface AdminLoginInput {
  email: string;
  password: string;
  rememberMe?: boolean;
}

const buildAdminNameFromEmail = (email: string): string => {
  return email
    .split("@")[0]
    .replace(/[^a-zA-Z]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
    .trim();
};

const createDummyAdminUser = (email: string): AdminUser => ({
  id: "admin-dev-1",
  email,
  name: buildAdminNameFromEmail(email) || "XDistro Admin",
  role: "admin",
  permissions: ADMIN_PERMISSIONS,
});

const createDummyAdminSession = ({ email, rememberMe }: AdminLoginInput): AdminSession => ({
  token: "admin-dev-token",
  expiresAt: Date.now() + (rememberMe ? REMEMBERED_SESSION_MS : DEFAULT_SESSION_MS),
  user: createDummyAdminUser(email),
});

const requestJson = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`${adminBackendConfig.apiBaseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(getAdminToken() ? { Authorization: `Bearer ${getAdminToken()}` } : {}),
      ...(init?.headers || {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Admin request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
};

const normalizeRemoteSession = (payload: unknown): AdminSession => {
  const candidate = payload as {
    token?: string;
    expiresAt?: number;
    expires_at?: number;
    user?: AdminUser;
    data?: {
      token?: string;
      expiresAt?: number;
      expires_at?: number;
      user?: AdminUser;
    };
  };

  const source = candidate.data || candidate;
  const token = source.token;
  const user = source.user;
  const expiresAt = source.expiresAt || source.expires_at || Date.now() + REMEMBERED_SESSION_MS;

  if (!token || !user) {
    throw new Error("Invalid admin authentication response");
  }

  return {
    token,
    expiresAt,
    user,
  };
};

export const loginAdmin = async (input: AdminLoginInput): Promise<AdminSession> => {
  if (isAdminDummyAuthEnabled()) {
    const session = createDummyAdminSession(input);
    persistAdminSession(session);
    return session;
  }

  const payload = await requestJson<unknown>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });

  const session = normalizeRemoteSession(payload);
  persistAdminSession(session);
  return session;
};

export const getCurrentAdminUser = async (): Promise<AdminUser | null> => {
  const storedUser = getStoredAdminUser();
  if (!storedUser) {
    return null;
  }

  if (isAdminDummyAuthEnabled()) {
    return storedUser;
  }

  try {
    const payload = await requestJson<unknown>("/me");
    const candidate = payload as { user?: AdminUser; data?: { user?: AdminUser } };
    const remoteUser = candidate.data?.user || candidate.user;

    if (!remoteUser) {
      return storedUser;
    }

    const storedSession = getStoredAdminSession();
    if (storedSession) {
      persistAdminSession({
        ...storedSession,
        user: remoteUser,
      });
    }

    return remoteUser;
  } catch {
    return storedUser;
  }
};

export const logoutAdmin = async () => {
  if (!isAdminDummyAuthEnabled()) {
    try {
      await requestJson("/logout", { method: "POST" });
    } catch {
      // Best effort logout; always clear local session.
    }
  }

  clearAdminSession();
};