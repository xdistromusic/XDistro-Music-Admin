import { adminBackendConfig, isAdminDummyAuthEnabled } from "@/config/adminBackend";
import { mockAdminRoyaltyRequests } from "@/data/adminRoyaltyRequests";
import { getAdminToken } from "@/lib/adminSession";
import { AdminRoyaltyRequest, AdminRoyaltyRequestStatus } from "@/types/admin";

const ADMIN_ROYALTY_REQUESTS_KEY = "admin:royalty-requests";

const readStoredRoyaltyRequests = (): AdminRoyaltyRequest[] => {
  try {
    const raw = localStorage.getItem(ADMIN_ROYALTY_REQUESTS_KEY);
    if (!raw) {
      localStorage.setItem(ADMIN_ROYALTY_REQUESTS_KEY, JSON.stringify(mockAdminRoyaltyRequests));
      return mockAdminRoyaltyRequests;
    }

    const parsed = JSON.parse(raw) as AdminRoyaltyRequest[];
    if (!Array.isArray(parsed)) {
      return mockAdminRoyaltyRequests;
    }

    return parsed;
  } catch {
    return mockAdminRoyaltyRequests;
  }
};

const writeStoredRoyaltyRequests = (requests: AdminRoyaltyRequest[]) => {
  localStorage.setItem(ADMIN_ROYALTY_REQUESTS_KEY, JSON.stringify(requests));
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
    throw new Error(`Admin royalty requests request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
};

export const getAdminRoyaltyRequests = async (): Promise<AdminRoyaltyRequest[]> => {
  if (isAdminDummyAuthEnabled()) {
    return readStoredRoyaltyRequests();
  }

  const payload = await requestJson<{ data?: AdminRoyaltyRequest[]; requests?: AdminRoyaltyRequest[] }>(
    "/royalty-requests"
  );

  return payload.data || payload.requests || [];
};

export const updateAdminRoyaltyRequestStatus = async (
  requestId: number,
  status: AdminRoyaltyRequestStatus
): Promise<void> => {
  if (isAdminDummyAuthEnabled()) {
    const updated = readStoredRoyaltyRequests().map((request) =>
      request.id === requestId ? { ...request, status } : request
    );
    writeStoredRoyaltyRequests(updated);
    return;
  }

  await requestJson(`/royalty-requests/${requestId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
};
