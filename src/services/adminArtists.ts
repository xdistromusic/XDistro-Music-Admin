import { adminBackendConfig, isAdminDummyAuthEnabled } from "@/config/adminBackend";
import { mockAdminArtists } from "@/data/adminArtists";
import { getAdminToken } from "@/lib/adminSession";
import { AdminArtist } from "@/types/admin";

const ADMIN_ARTISTS_KEY = "admin:artists";

const readStoredArtists = (): AdminArtist[] => {
  try {
    const raw = localStorage.getItem(ADMIN_ARTISTS_KEY);
    if (!raw) {
      localStorage.setItem(ADMIN_ARTISTS_KEY, JSON.stringify(mockAdminArtists));
      return mockAdminArtists;
    }

    const parsed = JSON.parse(raw) as AdminArtist[];
    if (!Array.isArray(parsed)) {
      return mockAdminArtists;
    }

    return parsed;
  } catch {
    return mockAdminArtists;
  }
};

const writeStoredArtists = (artists: AdminArtist[]) => {
  localStorage.setItem(ADMIN_ARTISTS_KEY, JSON.stringify(artists));
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
    throw new Error(`Admin artists request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
};

export const getAdminArtists = async (): Promise<AdminArtist[]> => {
  if (isAdminDummyAuthEnabled()) {
    return readStoredArtists();
  }

  const payload = await requestJson<{ data?: AdminArtist[]; artists?: AdminArtist[] }>("/artists");
  return payload.data || payload.artists || [];
};

export const deleteAdminArtist = async (artistId: number): Promise<void> => {
  if (isAdminDummyAuthEnabled()) {
    const updated = readStoredArtists().filter((artist) => artist.id !== artistId);
    writeStoredArtists(updated);
    return;
  }

  await requestJson(`/artists/${artistId}`, { method: "DELETE" });
};

export const updateAdminArtist = async (updatedArtist: AdminArtist): Promise<void> => {
  if (isAdminDummyAuthEnabled()) {
    const updated = readStoredArtists().map((artist) =>
      artist.id === updatedArtist.id ? { ...artist, ...updatedArtist } : artist
    );
    writeStoredArtists(updated);
    return;
  }

  await requestJson(`/artists/${updatedArtist.id}`, {
    method: "PATCH",
    body: JSON.stringify(updatedArtist),
  });
};

export const updateAdminArtistStatus = async (artistId: number, status: string): Promise<void> => {
  if (isAdminDummyAuthEnabled()) {
    const updated = readStoredArtists().map((artist) =>
      artist.id === artistId ? { ...artist, status } : artist
    );
    writeStoredArtists(updated);
    return;
  }

  await requestJson(`/artists/${artistId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
};