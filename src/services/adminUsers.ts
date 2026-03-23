import { isAdminDummyAuthEnabled, adminBackendConfig } from "@/config/adminBackend";
import { mockAdminUsers } from "@/data/adminUsers";
import { getAdminToken } from "@/lib/adminSession";
import { AdminUserListItem, SubscriptionPlanName } from "@/types/admin";

const ADMIN_USERS_KEY = "admin:users";

const readStoredUsers = (): AdminUserListItem[] => {
  try {
    const raw = localStorage.getItem(ADMIN_USERS_KEY);
    if (!raw) {
      localStorage.setItem(ADMIN_USERS_KEY, JSON.stringify(mockAdminUsers));
      return mockAdminUsers;
    }

    const parsed = JSON.parse(raw) as AdminUserListItem[];
    if (!Array.isArray(parsed)) {
      return mockAdminUsers;
    }

    return parsed;
  } catch {
    return mockAdminUsers;
  }
};

const writeStoredUsers = (users: AdminUserListItem[]) => {
  localStorage.setItem(ADMIN_USERS_KEY, JSON.stringify(users));
};

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
    throw new Error(`Admin users request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
};

export const getAdminUsers = async (): Promise<AdminUserListItem[]> => {
  if (isAdminDummyAuthEnabled()) {
    return readStoredUsers();
  }

  const payload = await requestJson<{ data?: AdminUserListItem[]; users?: AdminUserListItem[] }>("/users");
  return payload.data || payload.users || [];
};

export const deleteAdminUser = async (userId: number): Promise<void> => {
  if (isAdminDummyAuthEnabled()) {
    const users = readStoredUsers().filter((user) => user.id !== userId);
    writeStoredUsers(users);
    return;
  }

  await requestJson(`/users/${userId}`, { method: "DELETE" });
};

export const updateAdminUserPlan = async (userId: number, plan: SubscriptionPlanName): Promise<void> => {
  if (isAdminDummyAuthEnabled()) {
    const users = readStoredUsers().map((user) => (user.id === userId ? { ...user, plan } : user));
    writeStoredUsers(users);
    return;
  }

  await requestJson(`/users/${userId}/plan`, {
    method: "PATCH",
    body: JSON.stringify({ plan }),
  });
};

export const updateAdminUserStatus = async (userId: number, status: string): Promise<void> => {
  if (isAdminDummyAuthEnabled()) {
    const users = readStoredUsers().map((user) => (user.id === userId ? { ...user, status } : user));
    writeStoredUsers(users);
    return;
  }

  await requestJson(`/users/${userId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
};