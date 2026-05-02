import { isAdminDataDummyEnabled, requestAdminJson } from "@/services/adminClient";
import { mockAdminReleases } from "@/data/adminReleases";
import { AdminRelease, AdminReleaseStatus } from "@/types/admin";

const ADMIN_RELEASES_KEY = "admin:releases";

type ArtistProfile = {
  name?: string;
  artistName?: string;
  profileUrl?: string;
  profile_url?: string;
  spotifyUrl?: string;
  spotify_url?: string;
  url?: string;
  link?: string;
};

const asArray = <T>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : []);

const normalizeArtistProfile = (profile: ArtistProfile | string): { name: string; profileUrl: string } => {
  if (typeof profile === "string") {
    return { name: profile, profileUrl: "" };
  }

  return {
    name: String(profile?.name ?? profile?.artistName ?? "").trim(),
    profileUrl: String(
      profile?.profileUrl ??
      profile?.profile_url ??
      profile?.spotifyUrl ??
      profile?.spotify_url ??
      profile?.url ??
      profile?.link ??
      ""
    ).trim(),
  };
};

const normalizeArtistProfiles = (profiles: unknown): Array<{ name: string; profileUrl: string }> =>
  asArray<ArtistProfile | string>(profiles)
    .map(normalizeArtistProfile)
    .filter((profile) => profile.name.length > 0);

const uniqueArtistProfiles = (
  profiles: Array<{ name: string; profileUrl: string }>
): Array<{ name: string; profileUrl: string }> =>
  profiles.filter(
    (profile, index, all) =>
      all.findIndex((item) => item.name.toLowerCase() === profile.name.toLowerCase()) === index
  );

const normalizeArtistNames = (value: unknown): string[] =>
  asArray<string | ArtistProfile>(value)
    .map((entry) => (typeof entry === "string" ? entry : String(entry?.name ?? entry?.artistName ?? "")))
    .map((name) => name.trim())
    .filter((name) => name.length > 0);

const mergeArtistNames = (...groups: string[][]): string[] =>
  groups
    .flat()
    .map((name) => name.trim())
    .filter((name, index, all) => name.length > 0 && all.findIndex((item) => item.toLowerCase() === name.toLowerCase()) === index);

const normalizeDistributionPlatforms = (release: any): string[] => {
  const splitCsv = (value: string): string[] =>
    value
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

  const normalizeValue = (value: unknown): string[] => {
    if (Array.isArray(value)) {
      return value.flatMap(normalizeValue);
    }

    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed) return [];
      return trimmed.includes(",") ? splitCsv(trimmed) : [trimmed];
    }

    if (typeof value === "number") {
      return [String(value)];
    }

    if (!value || typeof value !== "object") {
      return [];
    }

    const record = value as Record<string, unknown>;

    const preferredLabel = String(
      record.name ??
        record.storeName ??
        record.store_name ??
        record.title ??
        record.platform ??
        record.platformName ??
        record.platform_name ??
        record.display_name ??
        ""
    ).trim();
    if (preferredLabel) return [preferredLabel];

    const nestedCandidates: unknown[] = [
      record.store,
      record.stores,
      record.store_info,
      record.storeInfo,
      record.platform_info,
      record.platformInfo,
      record.channel,
      record.distribution,
    ];
    for (const nested of nestedCandidates) {
      const normalizedNested = normalizeValue(nested);
      if (normalizedNested.length > 0) return normalizedNested;
    }

    const idFallback = String(
      record.id ??
        record.store_id ??
        record.storeId ??
        record.platform_id ??
        record.platformId ??
        record.code ??
        ""
    ).trim();
    if (idFallback) return [idFallback];

    return [];
  };

  const candidates: unknown[] = [
    release?.distributionPlatforms,
    release?.distribution_platforms,
    release?.selectedStores,
    release?.selected_stores,
    release?.stores,
    release?.store_ids,
    release?.storeIds,
    release?.platforms,
    release?.dsp_links,
    release?.release_stores,
    release?.releaseStores,
    release?.distribution,
    release?.distribution?.stores,
    release?.distribution?.selected_stores,
    release?.distribution?.selectedStores,
    release?.distribution?.store_ids,
    release?.distribution?.storeIds,
    release?.distribution?.platforms,
    release?.distribution?.dsp_links,
  ];
  const recursiveCandidates = (value: unknown, depth = 0): unknown[] => {
    if (depth > 5 || value == null) return [];
    if (Array.isArray(value)) {
      return value.flatMap((item) => recursiveCandidates(item, depth + 1));
    }
    if (typeof value !== "object") return [];

    const record = value as Record<string, unknown>;
    const collected: unknown[] = [];
    Object.entries(record).forEach(([key, nested]) => {
      if (/(store|platform|distribution|dsp)/i.test(key)) {
        collected.push(nested);
      }
      collected.push(...recursiveCandidates(nested, depth + 1));
    });
    return collected;
  };

  return mergeArtistNames(...candidates.concat(recursiveCandidates(release)).map(normalizeValue));
};

const buildProfilesFromParallelFields = (namesValue: unknown, urlsValue: unknown) => {
  const names = normalizeArtistNames(namesValue);
  const urls = asArray<unknown>(urlsValue).map((value) => String(value ?? "").trim());

  return names.map((name, index) => ({
    name,
    profileUrl: urls[index] ?? "",
  }));
};

const fallbackPrimaryProfile = (track: any, release: any): { name: string; profileUrl: string }[] => {
  const inferredName = String(
    track?.primaryArtistName ??
      track?.primary_artist_name ??
      release?.artist ??
      ""
  ).trim();
  const inferredUrl = String(
    track?.primaryArtistProfileUrl ??
      track?.primary_artist_profile_url ??
      track?.primaryArtistSpotifyUrl ??
      track?.primary_artist_spotify_url ??
      release?.primaryArtistProfileUrl ??
      release?.primary_artist_profile_url ??
      release?.primaryArtistSpotifyUrl ??
      release?.primary_artist_spotify_url ??
      ""
  ).trim();

  return inferredName ? [{ name: inferredName, profileUrl: inferredUrl }] : [];
};

const normalizeTrack = (track: any, release: any) => {
  const primaryArtistProfiles = uniqueArtistProfiles(
    normalizeArtistProfiles(track?.primaryArtistProfiles ?? track?.primary_artist_profiles)
      .concat(normalizeArtistProfiles(track?.primaryArtists ?? track?.primary_artists))
      .concat(normalizeArtistProfiles(release?.primaryArtistProfiles ?? release?.primary_artist_profiles))
      .concat(
        buildProfilesFromParallelFields(
          track?.primaryArtists ?? track?.primary_artists,
          track?.primaryArtistUrls ?? track?.primary_artist_urls
        )
      )
      .concat(fallbackPrimaryProfile(track, release))
  );

  const additionalPrimaryArtistProfiles = uniqueArtistProfiles(
    normalizeArtistProfiles(track?.additionalPrimaryArtistProfiles ?? track?.additional_primary_artist_profiles)
      .concat(normalizeArtistProfiles(track?.additionalPrimaryArtists ?? track?.additional_primary_artists))
      .concat(
        buildProfilesFromParallelFields(
          track?.additionalPrimaryArtists ?? track?.additional_primary_artists,
          track?.additionalPrimaryArtistUrls ?? track?.additional_primary_artist_urls
        )
      )
      .concat(
        normalizeArtistProfiles(release?.additionalPrimaryArtistProfiles ?? release?.additional_primary_artist_profiles)
      )
  );

  const featuredArtistProfiles = uniqueArtistProfiles(
    normalizeArtistProfiles(track?.featuredArtistProfiles ?? track?.featured_artist_profiles)
      .concat(normalizeArtistProfiles(track?.featuredArtists ?? track?.featured_artists))
      .concat(
        buildProfilesFromParallelFields(
          track?.featuredArtists ?? track?.featured_artists,
          track?.featuredArtistUrls ?? track?.featured_artist_urls
        )
      )
      .concat(normalizeArtistProfiles(track?.contributors ?? track?.track_contributors))
  );

  const primaryArtists = mergeArtistNames(
    normalizeArtistNames(track?.primaryArtists ?? track?.primary_artists),
    primaryArtistProfiles.map((profile) => profile.name),
    normalizeArtistNames([release?.artist])
  );

  const additionalPrimaryArtists = mergeArtistNames(
    normalizeArtistNames(track?.additionalPrimaryArtists ?? track?.additional_primary_artists),
    additionalPrimaryArtistProfiles.map((profile) => profile.name)
  );

  const featuredArtists = mergeArtistNames(
    normalizeArtistNames(track?.featuredArtists ?? track?.featured_artists),
    featuredArtistProfiles.map((profile) => profile.name)
  );

  return {
    ...track,
    primaryArtists,
    primaryArtistProfiles,
    additionalPrimaryArtists,
    additionalPrimaryArtistProfiles,
    featuredArtists,
    featuredArtistProfiles,
    tiktokPreviewMinutes: Number(track?.tiktokPreviewMinutes ?? track?.tiktok_preview_minutes ?? 0),
    tiktokPreviewSeconds: Number(track?.tiktokPreviewSeconds ?? track?.tiktok_preview_seconds ?? 30),
  };
};

const normalizeRelease = (release: any): AdminRelease => {
  const primaryArtistProfiles = uniqueArtistProfiles(
    normalizeArtistProfiles(release?.primaryArtistProfiles ?? release?.primary_artist_profiles)
      .concat(
        normalizeArtistProfiles([
          {
            name: release?.artist,
            profileUrl:
              release?.primaryArtistProfileUrl ??
              release?.primary_artist_profile_url ??
              release?.primaryArtistSpotifyUrl ??
              release?.primary_artist_spotify_url ??
              release?.spotifyUrl ??
              release?.spotify_url ??
              "",
          },
        ])
      )
      .concat(
        buildProfilesFromParallelFields(
          release?.primaryArtists ?? release?.primary_artists,
          release?.primaryArtistUrls ?? release?.primary_artist_urls
        )
      )
  );

  const additionalPrimaryArtistProfiles = uniqueArtistProfiles(
    normalizeArtistProfiles(release?.additionalPrimaryArtistProfiles ?? release?.additional_primary_artist_profiles)
      .concat(normalizeArtistProfiles(release?.additionalPrimaryArtists ?? release?.additional_primary_artists))
      .concat(
        buildProfilesFromParallelFields(
          release?.additionalPrimaryArtists ?? release?.additional_primary_artists,
          release?.additionalPrimaryArtistUrls ?? release?.additional_primary_artist_urls
        )
      )
  );

  const trackListRaw = asArray<any>(release?.trackList ?? release?.track_list);
  const trackList = trackListRaw.map((track) => normalizeTrack(track, release));

  const distributionPlatforms = normalizeDistributionPlatforms(release);

  return {
    ...release,
    primaryArtistProfiles,
    additionalPrimaryArtistProfiles,
    trackList,
    tracks: Number(release?.tracks ?? trackList.length ?? 0),
    fastlane: Boolean(release?.fastlane ?? release?.fastlane_enabled ?? false),
    fastlane_purchased_at: release?.fastlane_purchased_at ?? release?.fastlanePurchasedAt ?? undefined,
    distributionPlatforms,
  } as AdminRelease;
};

const normalizeReleases = (releases: unknown): AdminRelease[] => asArray<any>(releases).map(normalizeRelease);

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

    // Re-seed if stored data is missing fields added in newer mock versions
    const isStale = parsed.some((r) => r.copyrightYear === undefined || r.fastlane === undefined || r.distributionPlatforms === undefined);
    if (isStale) {
      localStorage.setItem(ADMIN_RELEASES_KEY, JSON.stringify(mockAdminReleases));
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

export const getAdminReleases = async (): Promise<AdminRelease[]> => {
  if (isAdminDataDummyEnabled()) {
    return readStoredReleases();
  }

  const payload = await requestAdminJson<{ data?: AdminRelease[]; releases?: AdminRelease[] }>("/releases");
  const rawReleases = payload.data || payload.releases || [];
  return normalizeReleases(rawReleases);
};

export const getAdminReleaseById = async (releaseId: AdminRelease["id"]): Promise<AdminRelease> => {
  if (isAdminDataDummyEnabled()) {
    const release = readStoredReleases().find((item) => item.id === releaseId);
    if (!release) {
      throw new Error("Release not found");
    }
    return release;
  }

  const payload = await requestAdminJson<{ data?: AdminRelease; release?: AdminRelease }>(`/releases/${releaseId}`);
  const rawRelease = payload.data ?? payload.release;
  if (!rawRelease) {
    throw new Error("Release not found");
  }

  const normalized = normalizeRelease(rawRelease);
  if (normalized.distributionPlatforms && normalized.distributionPlatforms.length > 0) {
    return normalized;
  }

  const tryPaths = [`/releases/${releaseId}/distribution`, `/releases/${releaseId}/stores`];
  for (const path of tryPaths) {
    try {
      const extraPayload = await requestAdminJson<any>(path);
      const extraData = extraPayload?.data ?? extraPayload;
      const extraPlatforms = normalizeDistributionPlatforms(extraData);
      if (extraPlatforms.length > 0) {
        return {
          ...normalized,
          distributionPlatforms: extraPlatforms,
        };
      }
    } catch {
      // Ignore missing endpoint and try the next fallback.
    }
  }

  return normalized;
};

export const updateAdminReleaseStatus = async (
  releaseId: AdminRelease["id"],
  status: AdminReleaseStatus,
  reason?: string
): Promise<void> => {
  if (isAdminDataDummyEnabled()) {
    const updated = readStoredReleases().map((release) =>
      release.id === releaseId ? { ...release, status } : release
    );
    writeStoredReleases(updated);
    return;
  }

  await requestAdminJson(`/releases/${releaseId}/status`, {
    method: "PATCH",
    body: JSON.stringify({
      status,
      ...(reason ? { reason } : {}),
    }),
  });
};

export const updateAdminReleaseUpc = async (releaseId: AdminRelease["id"], upc: string): Promise<void> => {
  if (isAdminDataDummyEnabled()) {
    const updated = readStoredReleases().map((release) =>
      release.id === releaseId ? { ...release, upc } : release
    );
    writeStoredReleases(updated);
    return;
  }

  await requestAdminJson(`/releases/${releaseId}/upc`, {
    method: "PATCH",
    body: JSON.stringify({ upc }),
  });
};

export const updateAdminTrackIsrc = async (
  releaseId: AdminRelease["id"],
  trackId: AdminRelease["trackList"][number]["id"],
  isrc: string
): Promise<void> => {
  if (isAdminDataDummyEnabled()) {
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

  await requestAdminJson(`/releases/${releaseId}/tracks/${trackId}/isrc`, {
    method: "PATCH",
    body: JSON.stringify({ isrc }),
  });
};
export const updateAdminTrackTikTokPreview = async (
  releaseId: AdminRelease["id"],
  trackId: AdminRelease["trackList"][number]["id"],
  minutes: number,
  seconds: number
): Promise<void> => {
  if (isAdminDataDummyEnabled()) {
    const updated = readStoredReleases().map((release) => {
      if (release.id !== releaseId) {
        return release;
      }

      return {
        ...release,
        trackList: release.trackList?.map((track) =>
          track.id === trackId
            ? {
                ...track,
                tiktokPreviewMinutes: Math.max(0, Math.floor(minutes)),
                tiktokPreviewSeconds: Math.max(0, Math.min(59, Math.floor(seconds))),
              }
            : track
        ),
      };
    });

    writeStoredReleases(updated);
    return;
  }

  await requestAdminJson(`/releases/${releaseId}/tracks/${trackId}/preview`, {
    method: "PATCH",
    body: JSON.stringify({ minutes, seconds }),
  });
};
