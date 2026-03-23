import { adminBackendConfig, isAdminDummyAuthEnabled } from "@/config/adminBackend";
import { mockAdminRoyaltyStats, mockAdminRoyaltyUploadHistory } from "@/data/adminRoyalties";
import { getAdminToken } from "@/lib/adminSession";
import { AdminRoyaltyStats, AdminRoyaltyUploadHistoryItem } from "@/types/admin";

const ADMIN_ROYALTY_HISTORY_KEY = "admin:royalty-upload-history";
const ADMIN_ROYALTY_STATS_KEY = "admin:royalty-stats";

const readStoredRoyaltyHistory = (): AdminRoyaltyUploadHistoryItem[] => {
  try {
    const raw = localStorage.getItem(ADMIN_ROYALTY_HISTORY_KEY);
    if (!raw) {
      localStorage.setItem(ADMIN_ROYALTY_HISTORY_KEY, JSON.stringify(mockAdminRoyaltyUploadHistory));
      return mockAdminRoyaltyUploadHistory;
    }

    const parsed = JSON.parse(raw) as AdminRoyaltyUploadHistoryItem[];
    if (!Array.isArray(parsed)) {
      return mockAdminRoyaltyUploadHistory;
    }

    return parsed;
  } catch {
    return mockAdminRoyaltyUploadHistory;
  }
};

const writeStoredRoyaltyHistory = (history: AdminRoyaltyUploadHistoryItem[]) => {
  localStorage.setItem(ADMIN_ROYALTY_HISTORY_KEY, JSON.stringify(history));
};

const readStoredRoyaltyStats = (): AdminRoyaltyStats => {
  try {
    const raw = localStorage.getItem(ADMIN_ROYALTY_STATS_KEY);
    if (!raw) {
      localStorage.setItem(ADMIN_ROYALTY_STATS_KEY, JSON.stringify(mockAdminRoyaltyStats));
      return mockAdminRoyaltyStats;
    }

    const parsed = JSON.parse(raw) as AdminRoyaltyStats;
    if (
      typeof parsed?.totalDistributed !== "number" ||
      typeof parsed?.pendingDistribution !== "number" ||
      typeof parsed?.totalArtists !== "number"
    ) {
      return mockAdminRoyaltyStats;
    }

    return parsed;
  } catch {
    return mockAdminRoyaltyStats;
  }
};

const writeStoredRoyaltyStats = (stats: AdminRoyaltyStats) => {
  localStorage.setItem(ADMIN_ROYALTY_STATS_KEY, JSON.stringify(stats));
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
    throw new Error(`Admin royalties request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
};

export const getAdminRoyaltyStats = async (): Promise<AdminRoyaltyStats> => {
  if (isAdminDummyAuthEnabled()) {
    return readStoredRoyaltyStats();
  }

  const payload = await requestJson<{ data?: AdminRoyaltyStats; stats?: AdminRoyaltyStats }>("/royalties/stats");
  return payload.data || payload.stats || mockAdminRoyaltyStats;
};

export const getAdminRoyaltyUploadHistory = async (): Promise<AdminRoyaltyUploadHistoryItem[]> => {
  if (isAdminDummyAuthEnabled()) {
    return readStoredRoyaltyHistory();
  }

  const payload = await requestJson<{
    data?: AdminRoyaltyUploadHistoryItem[];
    uploads?: AdminRoyaltyUploadHistoryItem[];
  }>("/royalties/uploads");

  return payload.data || payload.uploads || [];
};

export const uploadAdminRoyaltyFile = async (
  fileName: string
): Promise<AdminRoyaltyUploadHistoryItem> => {
  if (isAdminDummyAuthEnabled()) {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const history = readStoredRoyaltyHistory();
    const recordsProcessed = Math.floor(Math.random() * 5000) + 10000;
    const totalAmount = Math.floor(Math.random() * 50000) + 50000;

    const newUpload: AdminRoyaltyUploadHistoryItem = {
      id: history.length + 1,
      fileName,
      uploadDate: new Date().toISOString().split("T")[0],
      recordsProcessed,
      totalAmount,
      status: "Completed",
      processedBy: "admin@xdistromusic.com",
    };

    writeStoredRoyaltyHistory([newUpload, ...history]);

    const stats = readStoredRoyaltyStats();
    writeStoredRoyaltyStats({
      ...stats,
      totalDistributed: stats.totalDistributed + totalAmount,
      pendingDistribution: Math.max(0, stats.pendingDistribution - totalAmount * 0.1),
    });

    return newUpload;
  }

  return requestJson<AdminRoyaltyUploadHistoryItem>("/royalties/upload", {
    method: "POST",
    body: JSON.stringify({ fileName }),
  });
};
