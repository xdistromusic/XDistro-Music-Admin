import { SubscriptionPlanName, AdminEntityId, AdminUserListItem, AdminUsersPage } from "@/types/admin";
import { isAdminDataDummyEnabled, requestAdminJson } from "@/services/adminClient";
import { mockAdminUsers } from "@/data/adminUsers";

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

export const getAdminUsersPage = async (
  params: { page: number; pageSize: number; search?: string; plan?: "all" | SubscriptionPlanName }
): Promise<AdminUsersPage> => {
  if (isAdminDataDummyEnabled()) {
    const allUsers = readStoredUsers();
    const page = Math.max(1, Number(params.page) || 1);
    const pageSize = Math.min(200, Math.max(10, Number(params.pageSize) || 50));
    const searchTerm = String(params.search ?? "").trim().toLowerCase();
    const planFilter = params.plan ?? "all";
    const filteredUsers = allUsers.filter((user) => {
      const matchesSearch =
        !searchTerm ||
        user.firstName.toLowerCase().includes(searchTerm) ||
        user.lastName.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm);
      const matchesPlan = planFilter === "all" || user.plan === planFilter;
      return matchesSearch && matchesPlan;
    });
    const from = (page - 1) * pageSize;
    const items = filteredUsers.slice(from, from + pageSize);
    const total = filteredUsers.length;
    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  }

  const searchParams = new URLSearchParams({
    page: String(params.page),
    pageSize: String(params.pageSize),
  });
  if (params.search && params.search.trim()) {
    searchParams.set("search", params.search.trim());
  }
  if (params.plan && params.plan !== "all") {
    searchParams.set("plan", params.plan);
  }
  const payload = await requestAdminJson<{
    data?: AdminUserListItem[];
    users?: AdminUserListItem[];
    total?: number;
    page?: number;
    pageSize?: number;
    totalPages?: number;
  }>(`/users?${searchParams.toString()}`);

  const items = payload.data || payload.users || [];
  const total = Number(payload.total ?? items.length);
  const page = Number(payload.page ?? params.page);
  const pageSize = Number(payload.pageSize ?? params.pageSize);
  const totalPages = Number(payload.totalPages ?? Math.max(1, Math.ceil(total / pageSize)));

  return {
    items,
    total,
    page,
    pageSize,
    totalPages,
  };
};

export const getAdminUsers = async (): Promise<AdminUserListItem[]> => {
  if (isAdminDataDummyEnabled()) {
    return readStoredUsers();
  }

  const pageSize = 200;
  let page = 1;
  let totalPages = 1;
  const allUsers: AdminUserListItem[] = [];

  do {
    const response = await getAdminUsersPage({ page, pageSize });
    allUsers.push(...response.items);
    totalPages = response.totalPages;
    page += 1;
  } while (page <= totalPages);

  return allUsers;
};

export const deleteAdminUser = async (userId: AdminEntityId): Promise<void> => {
  if (isAdminDataDummyEnabled()) {
    const users = readStoredUsers().filter((user) => user.id !== userId);
    writeStoredUsers(users);
    return;
  }

  await requestAdminJson(`/users/${userId}`, { method: "DELETE" });
};

export const updateAdminUserPlan = async (userId: AdminEntityId, plan: SubscriptionPlanName): Promise<void> => {
  if (isAdminDataDummyEnabled()) {
    const users = readStoredUsers().map((user) => (user.id === userId ? { ...user, plan } : user));
    writeStoredUsers(users);
    return;
  }

  await requestAdminJson(`/users/${userId}/plan`, {
    method: "PATCH",
    body: JSON.stringify({ plan }),
  });
};

export const updateAdminUserStatus = async (userId: AdminEntityId, status: string): Promise<void> => {
  if (isAdminDataDummyEnabled()) {
    const users = readStoredUsers().map((user) => (user.id === userId ? { ...user, status } : user));
    writeStoredUsers(users);
    return;
  }

  await requestAdminJson(`/users/${userId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
};
export type AdminUserDetailsUpdate = Pick<AdminUserListItem, 'firstName' | 'lastName' | 'email' | 'country'>;
export const updateAdminUserDetails = async (userId: AdminEntityId, details: AdminUserDetailsUpdate): Promise<void> => {
  if (isAdminDataDummyEnabled()) {
    const users = readStoredUsers().map((user) => (user.id === userId ? { ...user, ...details } : user));
    writeStoredUsers(users);
    return;
  }
  await requestAdminJson(`/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify({
      first_name: details.firstName,
      last_name: details.lastName,
      email: details.email,
      country: details.country,
    }),
  });
};
