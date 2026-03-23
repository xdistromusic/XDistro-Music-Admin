import { adminBackendConfig, isAdminDummyAuthEnabled } from "@/config/adminBackend";
import { mockAdminReportRequests } from "@/data/adminReportRequests";
import { getAdminToken } from "@/lib/adminSession";
import { AdminReportRequest, AdminReportRequestStatus } from "@/types/admin";

const ADMIN_REPORT_REQUESTS_KEY = "admin:report-requests";

const readStoredReportRequests = (): AdminReportRequest[] => {
  try {
    const raw = localStorage.getItem(ADMIN_REPORT_REQUESTS_KEY);
    if (!raw) {
      localStorage.setItem(ADMIN_REPORT_REQUESTS_KEY, JSON.stringify(mockAdminReportRequests));
      return mockAdminReportRequests;
    }

    const parsed = JSON.parse(raw) as AdminReportRequest[];
    if (!Array.isArray(parsed)) {
      return mockAdminReportRequests;
    }

    return parsed;
  } catch {
    return mockAdminReportRequests;
  }
};

const writeStoredReportRequests = (requests: AdminReportRequest[]) => {
  localStorage.setItem(ADMIN_REPORT_REQUESTS_KEY, JSON.stringify(requests));
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
    throw new Error(`Admin report requests request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
};

export const getAdminReportRequests = async (): Promise<AdminReportRequest[]> => {
  if (isAdminDummyAuthEnabled()) {
    return readStoredReportRequests();
  }

  const payload = await requestJson<{ data?: AdminReportRequest[]; requests?: AdminReportRequest[] }>(
    "/report-requests"
  );

  return payload.data || payload.requests || [];
};

export const updateAdminReportRequestStatus = async (
  requestId: number,
  status: AdminReportRequestStatus
): Promise<void> => {
  if (isAdminDummyAuthEnabled()) {
    const updated = readStoredReportRequests().map((request) =>
      request.id === requestId ? { ...request, status } : request
    );
    writeStoredReportRequests(updated);
    return;
  }

  await requestJson(`/report-requests/${requestId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
};

export const uploadAdminReportRequestFile = async (
  requestId: number,
  fileName: string
): Promise<void> => {
  if (isAdminDummyAuthEnabled()) {
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const updated = readStoredReportRequests().map((request) =>
      request.id === requestId
        ? {
            ...request,
            status: "Ready" as const,
            uploadedFile: fileName,
            uploadDate: new Date().toLocaleString(),
          }
        : request
    );

    writeStoredReportRequests(updated);
    return;
  }

  await requestJson(`/report-requests/${requestId}/upload`, {
    method: "POST",
    body: JSON.stringify({ fileName }),
  });
};
