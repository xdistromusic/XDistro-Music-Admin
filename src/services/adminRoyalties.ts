import { adminBackendConfig, isAdminDummyAuthEnabled } from "@/config/adminBackend";
import { mockAdminRoyaltyStats, mockAdminRoyaltyUploadHistory } from "@/data/adminRoyalties";
import { getAdminToken } from "@/lib/adminSession";
import { AdminRoyaltyStats, AdminRoyaltyUploadHistoryItem, AdminRoyaltyUploadInput } from "@/types/admin";

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

const parseCsv = (input: string): string[][] => {
  const rows: string[][] = [];
  let currentValue = "";
  let currentRow: string[] = [];
  let inQuotes = false;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    const next = input[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        currentValue += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      currentRow.push(currentValue.trim());
      currentValue = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") {
        index += 1;
      }

      if (currentValue.length > 0 || currentRow.length > 0) {
        currentRow.push(currentValue.trim());
        rows.push(currentRow);
      }

      currentValue = "";
      currentRow = [];
      continue;
    }

    currentValue += char;
  }

  if (currentValue.length > 0 || currentRow.length > 0) {
    currentRow.push(currentValue.trim());
    rows.push(currentRow);
  }

  return rows;
};

const buildUploadFromCsv = async (input: AdminRoyaltyUploadInput): Promise<AdminRoyaltyUploadHistoryItem> => {
  const csvText = await input.file.text();
  const rows = parseCsv(csvText);
  const [headerRow, ...dataRows] = rows;
  const totalAmount = dataRows.reduce((sum, row) => {
    const royaltyIndex = headerRow.findIndex((header) => /royalty total|royalty_amount/i.test(header));
    const amount = royaltyIndex >= 0 ? Number(row[royaltyIndex] ?? 0) : 0;
    return sum + (Number.isFinite(amount) ? amount : 0);
  }, 0);

  return {
    id: `${Date.now()}`,
    fileName: input.file.name,
    period: input.period,
    uploadDate: new Date().toISOString(),
    recordsProcessed: dataRows.length,
    matchedRows: 0,
    unmatchedRows: 0,
    replacedRows: 0,
    totalAmount: Number(totalAmount.toFixed(2)),
    status: "Completed",
    processedBy: "admin@xdistromusic.com",
  };
};

const requestRoyaltyImport = async <T>(mode?: string, init?: RequestInit): Promise<T> => {
  const baseUrl = adminBackendConfig.royaltyImportUrl;
  if (!baseUrl) {
    throw new Error("VITE_ADMIN_ROYALTY_IMPORT_URL is not configured.");
  }

  const url = mode ? `${baseUrl}?mode=${encodeURIComponent(mode)}` : baseUrl;
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(getAdminToken() ? { Authorization: `Bearer ${getAdminToken()}` } : {}),
      ...(init?.headers || {}),
    },
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload?.message || `Royalty import request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
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

  if (adminBackendConfig.royaltyImportUrl) {
    const payload = await requestRoyaltyImport<{ data?: AdminRoyaltyStats }>("stats");
    return payload.data || mockAdminRoyaltyStats;
  }

  const payload = await requestJson<{ data?: AdminRoyaltyStats; stats?: AdminRoyaltyStats }>("/royalties/stats");
  return payload.data || payload.stats || mockAdminRoyaltyStats;
};

export const getAdminRoyaltyUploadHistory = async (): Promise<AdminRoyaltyUploadHistoryItem[]> => {
  if (isAdminDummyAuthEnabled()) {
    return readStoredRoyaltyHistory();
  }

  if (adminBackendConfig.royaltyImportUrl) {
    const payload = await requestRoyaltyImport<{ data?: AdminRoyaltyUploadHistoryItem[] }>("uploads");
    return payload.data || [];
  }

  const payload = await requestJson<{
    data?: AdminRoyaltyUploadHistoryItem[];
    uploads?: AdminRoyaltyUploadHistoryItem[];
  }>("/royalties/uploads");

  return payload.data || payload.uploads || [];
};

export const uploadAdminRoyaltyFile = async (
  input: AdminRoyaltyUploadInput
): Promise<AdminRoyaltyUploadHistoryItem> => {
  if (isAdminDummyAuthEnabled()) {
    const history = readStoredRoyaltyHistory();
    const newUpload = await buildUploadFromCsv(input);

    writeStoredRoyaltyHistory([newUpload, ...history]);

    const stats = readStoredRoyaltyStats();
    writeStoredRoyaltyStats({
      ...stats,
      totalDistributed: stats.totalDistributed + newUpload.totalAmount,
      pendingDistribution: Math.max(0, stats.pendingDistribution - newUpload.totalAmount * 0.1),
    });

    return newUpload;
  }

  if (adminBackendConfig.royaltyImportUrl) {
    const csvText = await input.file.text();
    const payload = await requestRoyaltyImport<{ data?: AdminRoyaltyUploadHistoryItem }>(undefined, {
      method: "POST",
      body: JSON.stringify({
        period: input.period,
        fileName: input.file.name,
        csvText,
      }),
    });

    if (!payload.data) {
      throw new Error("Royalty import did not return upload metadata.");
    }

    return payload.data;
  }

  return requestJson<AdminRoyaltyUploadHistoryItem>("/royalties/upload", {
    method: "POST",
    body: JSON.stringify({ fileName: input.file.name, period: input.period }),
  });
};
