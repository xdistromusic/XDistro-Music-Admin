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

  return {
    ...release,
    primaryArtistProfiles,
    additionalPrimaryArtistProfiles,
    trackList,
    tracks: Number(release?.tracks ?? trackList.length ?? 0),
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
    const isStale = parsed.some((r) => r.copyrightYear === undefined);
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
  // DEBUG: log raw track data to confirm what the deployed API returns for artist profile links.
  // Remove this log once primary/featured artist links are confirmed working.
  const firstTrack = (rawReleases as any[])[0]?.track_list?.[0] ?? (rawReleases as any[])[0]?.trackList?.[0];
  if (firstTrack) {
    console.log("[admin debug] first track raw data:", JSON.stringify({
      primaryArtistProfiles: firstTrack.primaryArtistProfiles ?? firstTrack.primary_artist_profiles,
      featuredArtistProfiles: firstTrack.featuredArtistProfiles ?? firstTrack.featured_artist_profiles,
      featuredArtists: firstTrack.featuredArtists ?? firstTrack.featured_artists,
    }, null, 2));
  }
  return normalizeReleases(rawReleases);
};

export const updateAdminReleaseStatus = async (
  releaseId: AdminRelease["id"],
  status: AdminReleaseStatus
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
    body: JSON.stringify({ status }),
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
