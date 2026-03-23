export type AdminRole = "admin";

export type AdminPermission =
  | "dashboard"
  | "users"
  | "releases"
  | "artists"
  | "royalties"
  | "royalty_requests"
  | "report_requests"
  | "takedown_requests"
  | "settings";

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  permissions: AdminPermission[];
}

export interface AdminSession {
  token: string;
  expiresAt: number;
  user: AdminUser;
}

export type SubscriptionPlanName = "Non Subscriber" | "Artist" | "Pro" | "Label";

export interface AdminUserListItem {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  plan: SubscriptionPlanName;
  joinDate: string;
  lastLogin: string;
  releases: number;
  totalEarnings: number;
  status?: string;
}

export type AdminReleaseStatus = "Submitted" | "Approved" | "Rejected" | "Denied" | "Deleted";

export interface AdminReleaseTrack {
  id: number;
  title: string;
  duration: string;
  explicitContent?: boolean;
  isrc: string;
  tiktokPreviewMinutes?: number;
  tiktokPreviewSeconds?: number;
  primaryArtists: string[];
  additionalPrimaryArtists: string[];
  featuredArtists: string[];
  songwriters: string[];
  producers: string[];
  performers: string[];
  audioFile?: string;
}

export interface AdminRelease {
  id: number;
  title: string;
  artist: string;
  submittedBy: string;
  releaseDate: string;
  previousDate: string;
  submissionDate: string;
  status: AdminReleaseStatus;
  genre: string;
  tracks: number;
  upc: string;
  coverArt?: string;
  label?: string;
  copyright?: string;
  language?: string;
  trackList?: AdminReleaseTrack[];
}

export interface AdminArtist {
  id: number;
  artistName: string;
  primaryGenre: string;
  artistBio: string;
  spotifyUrl: string;
  country: string;
  recordLabel: string;
  addedBy: string;
  addedDate: string;
  releases: number;
  status?: string;
}

export type AdminRoyaltyRequestStatus = "Pending" | "Approved" | "Processed" | "Rejected";

export type AdminRoyaltyPaymentMethodType = "bank" | "paypal";

export interface AdminRoyaltyPaymentMethod {
  type: AdminRoyaltyPaymentMethodType;
  details?: string;
  accountNumber?: string;
  routingNumber?: string;
  bankName?: string;
  accountHolder?: string;
  swiftCode?: string;
  iban?: string;
  paypalEmail?: string;
  accountType?: string;
}

export interface AdminRoyaltyRequest {
  id: number;
  artistName: string;
  artistEmail: string;
  amount: number;
  requestDate: string;
  status: AdminRoyaltyRequestStatus;
  paymentMethod: AdminRoyaltyPaymentMethod;
  accountBalance: number;
  minimumThreshold: number;
  previousPayments?: Array<{
    date: string;
    amount: number;
    status: string;
  }>;
}

export type AdminReportRequestStatus = "Pending" | "Processing" | "Ready" | "Downloaded";

export interface AdminReportRequest {
  id: number;
  artistName: string;
  artistEmail: string;
  reportPeriod: string;
  requestDate: string;
  status: AdminReportRequestStatus;
  reportType: string;
  totalEarnings: number;
  trackCount: number;
  downloadCount: number;
  uploadedFile: string | null;
  uploadDate: string | null;
  notes: string;
}

export type AdminTakedownRequestStatus = "Pending" | "Completed";

export interface AdminTakedownRequest {
  id: number;
  artistName: string;
  artistEmail: string;
  releaseTitle: string;
  releaseId: string;
  requestDate: string;
  status: AdminTakedownRequestStatus;
}

export type AdminRoyaltyUploadStatus = "Completed" | "Processing" | "Failed";

export interface AdminRoyaltyUploadHistoryItem {
  id: number;
  fileName: string;
  uploadDate: string;
  recordsProcessed: number;
  totalAmount: number;
  status: AdminRoyaltyUploadStatus;
  processedBy: string;
}

export interface AdminRoyaltyStats {
  totalDistributed: number;
  pendingDistribution: number;
  totalArtists: number;
}