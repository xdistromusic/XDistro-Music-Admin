import { adminBackendConfig, isAdminDummyAuthEnabled } from "@/config/adminBackend";
import { mockAdminTakedownRequests } from "@/data/adminTakedownRequests";
import { getAdminToken } from "@/lib/adminSession";
import { AdminTakedownRequest, AdminTakedownRequestStatus } from "@/types/admin";

const ADMIN_TAKEDOWN_REQUESTS_KEY = "admin:takedown-requests";

const readStoredTakedownRequests = (): AdminTakedownRequest[] => {
  try {
    const raw = localStorage.getItem(ADMIN_TAKEDOWN_REQUESTS_KEY);
    if (!raw) {
      localStorage.setItem(ADMIN_TAKEDOWN_REQUESTS_KEY, JSON.stringify(mockAdminTakedownRequests));
      return mockAdminTakedownRequests;
    }

    const parsed = JSON.parse(raw) as AdminTakedownRequest[];
    if (!Array.isArray(parsed)) {
      return mockAdminTakedownRequests;
    }

    return parsed;
  } catch {
    return mockAdminTakedownRequests;
  }
};

const writeStoredTakedownRequests = (requests: AdminTakedownRequest[]) => {
  localStorage.setItem(ADMIN_TAKEDOWN_REQUESTS_KEY, JSON.stringify(requests));
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
    throw new Error(`Admin takedown requests request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
};

export const getAdminTakedownRequests = async (): Promise<AdminTakedownRequest[]> => {
  if (isAdminDummyAuthEnabled()) {
    return readStoredTakedownRequests();
  }

  const payload = await requestJson<{ data?: AdminTakedownRequest[]; requests?: AdminTakedownRequest[] }>(
    "/takedown-requests"
  );

  return payload.data || payload.requests || [];
};

export const updateAdminTakedownRequestStatus = async (
  requestId: number,
  status: AdminTakedownRequestStatus
): Promise<void> => {
  if (isAdminDummyAuthEnabled()) {
    const updated = readStoredTakedownRequests().map((request) =>
      request.id === requestId ? { ...request, status } : request
    );

    writeStoredTakedownRequests(updated);
    return;
  }

  await requestJson(`/takedown-requests/${requestId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
};
