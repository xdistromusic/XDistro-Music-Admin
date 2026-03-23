import { adminBackendConfig, isAdminDummyAuthEnabled } from "@/config/adminBackend";
import { mockAdminReleases } from "@/data/adminReleases";
import { getAdminToken } from "@/lib/adminSession";
import { AdminRelease, AdminReleaseStatus } from "@/types/admin";

const ADMIN_RELEASES_KEY = "admin:releases";

const readStoredReleases = (): AdminRelease[] => {
  try {
    const raw = localStorage.getItem(ADMIN_RELEASES_KEY);
    if (!raw) {
      localStorage.setItem(ADMIN_RELEASES_KEY, JSON.stringify(mockAdminReleases));
      return mockAdminReleases;
    }

    const parsed = JSON.parse(raw) as AdminRelease[];
    if (!Array.isArray(parsed)) {
      return mockAdminReleases;
    }

    return parsed;
  } catch {
    return mockAdminReleases;
  }
};

const writeStoredReleases = (releases: AdminRelease[]) => {
  localStorage.setItem(ADMIN_RELEASES_KEY, JSON.stringify(releases));
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
    throw new Error(`Admin releases request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
};

export const getAdminReleases = async (): Promise<AdminRelease[]> => {
  if (isAdminDummyAuthEnabled()) {
    return readStoredReleases();
  }

  const payload = await requestJson<{ data?: AdminRelease[]; releases?: AdminRelease[] }>("/releases");
  return payload.data || payload.releases || [];
};

export const updateAdminReleaseStatus = async (
  releaseId: number,
  status: AdminReleaseStatus
): Promise<void> => {
  if (isAdminDummyAuthEnabled()) {
    const updated = readStoredReleases().map((release) =>
      release.id === releaseId ? { ...release, status } : release
    );
    writeStoredReleases(updated);
    return;
  }

  await requestJson(`/releases/${releaseId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
};

export const updateAdminReleaseUpc = async (releaseId: number, upc: string): Promise<void> => {
  if (isAdminDummyAuthEnabled()) {
    const updated = readStoredReleases().map((release) =>
      release.id === releaseId ? { ...release, upc } : release
    );
    writeStoredReleases(updated);
    return;
  }

  await requestJson(`/releases/${releaseId}/upc`, {
    method: "PATCH",
    body: JSON.stringify({ upc }),
  });
};

export const updateAdminTrackIsrc = async (
  releaseId: number,
  trackId: number,
  isrc: string
): Promise<void> => {
  if (isAdminDummyAuthEnabled()) {
    const updated = readStoredReleases().map((release) => {
      if (release.id !== releaseId) {
        return release;
      }

      return {
        ...release,
        trackList: release.trackList?.map((track) =>
          track.id === trackId ? { ...track, isrc } : track
        ),
      };
    });

    writeStoredReleases(updated);
    return;
  }

  await requestJson(`/releases/${releaseId}/tracks/${trackId}/isrc`, {
    method: "PATCH",
    body: JSON.stringify({ isrc }),
  });
};