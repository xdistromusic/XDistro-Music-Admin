export type AdminRole =
  | "super_admin"
  | "admin"
  | "manager"
  | "support_agent"
  | "content_reviewer";

export type AdminPermission =
  | "dashboard"
  | "users"
  | "releases"
  | "artists"
  | "royalties"
  | "royalty_requests"
  | "takedown_requests"
  | "support_requests"
  | "settings";

/** Permissions granted to each role by default. */
export const ROLE_DEFAULT_PERMISSIONS: Record<AdminRole, AdminPermission[]> = {
  super_admin: ["dashboard", "users", "releases", "artists", "royalties", "royalty_requests", "takedown_requests", "support_requests", "settings"],
  admin:        ["dashboard", "users", "releases", "artists", "royalties", "royalty_requests", "takedown_requests", "support_requests", "settings"],
  manager:      ["dashboard", "users", "releases", "artists", "royalties", "royalty_requests", "takedown_requests", "support_requests"],
  support_agent:      ["dashboard", "users", "support_requests"],
  content_reviewer:   ["dashboard", "releases", "takedown_requests"],
};

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

/** A staff member record stored in the admin_staff table. */
export interface StaffMember {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  permissions: AdminPermission[];
  status: "active" | "inactive";
  createdAt: string;
  lastLogin: string | null;
}

export type CreateStaffInput = Pick<StaffMember, "email" | "name" | "role" | "permissions">;
export type UpdateStaffInput = Partial<Pick<StaffMember, "name" | "role" | "permissions" | "status">>;


export type AdminEntityId = string | number;

export type SubscriptionPlanName = "Non Subscriber" | "Artist" | "Pro" | "Label";

export interface AdminUserListItem {
  id: AdminEntityId;
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
  id: AdminEntityId;
  title: string;
  duration: string;
  explicitContent?: boolean;
  isrc: string;
  tiktokPreviewMinutes?: number;
  tiktokPreviewSeconds?: number;
  primaryArtists: string[];
  primaryArtistProfiles?: Array<{ name: string; profileUrl: string }>;
  additionalPrimaryArtists: string[];
  additionalPrimaryArtistProfiles?: Array<{ name: string; profileUrl: string }>;
  featuredArtists: string[];
  featuredArtistProfiles?: Array<{ name: string; profileUrl: string }>;
  songwriters: string[];
  producers: string[];
  performers: string[];
  audioFile?: string;
}

export interface AdminRelease {
  id: AdminEntityId;
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
  copyrightYear?: string;
  language?: string;
  primaryArtistProfiles?: Array<{ name: string; profileUrl: string }>;
  additionalPrimaryArtistProfiles?: Array<{ name: string; profileUrl: string }>;
  trackList?: AdminReleaseTrack[];
}

export interface AdminArtist {
  id: AdminEntityId;
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
  id: AdminEntityId;
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
  id: AdminEntityId;
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
  id: AdminEntityId;
  artistName: string;
  artistEmail: string;
  releaseTitle: string;
  releaseId: string;
  requestDate: string;
  status: AdminTakedownRequestStatus;
}

export type AdminSupportTicketStatus = "Open" | "In Progress" | "Resolved" | "Closed";

export interface AdminSupportMessage {
  id: AdminEntityId;
  senderType: "User" | "Admin" | "System";
  senderName: string;
  senderEmail: string;
  message: string;
  emailSent: boolean;
  createdDate: string;
  createdAt?: string;
}

export interface AdminSupportTicket {
  id: AdminEntityId;
  ticketNumber: string;
  contactName: string;
  contactEmail: string;
  category: string;
  subject: string;
  status: AdminSupportTicketStatus;
  createdDate: string;
  lastUpdatedDate: string;
  lastMessageDate?: string;
  lastAdminReplyDate?: string;
  messageCount: number;
  preview: string;
  messages?: AdminSupportMessage[];
}

export type AdminRoyaltyUploadStatus = "Completed" | "Processing" | "Failed";

export interface AdminRoyaltyUploadHistoryItem {
  id: number | string;
  fileName: string;
  period?: string;
  uploadDate: string;
  recordsProcessed: number;
  matchedRows?: number;
  unmatchedRows?: number;
  replacedRows?: number;
  totalAmount: number;
  status: AdminRoyaltyUploadStatus;
  processedBy: string;
}

export interface AdminRoyaltyUploadInput {
  period: string;
  file: File;
}

export interface AdminRoyaltyStats {
  totalDistributed: number;
  pendingDistribution: number;
  totalArtists: number;
}

export interface AdminRoyaltyNormalizationSummary {
  normalizedAt: string;
  batchesScanned: number;
  batchesUpdated: number;
  unmatchedRowsDeleted: number;
  allocationFailedRowsDeleted: number;
  matchedRowsRetained: number;
  replacedRowsRetained: number;
  totalMatchedAmount: number;
  periodsTouched: string[];
}

export interface AdminSubscriptionAuditActiveSubscription {
  id: string;
  providerRef: string | null;
  planId: string | null;
  priceId: string | null;
  paidDate: string | null;
  startDate: string | null;
  endDate: string | null;
  createdAt: string | null;
}

export interface AdminSubscriptionAuditDuplicateUser {
  userId: string;
  email: string;
  name: string;
  activeCount: number;
  activeSubscriptions: AdminSubscriptionAuditActiveSubscription[];
}

export interface AdminSubscriptionAuditCleanupRow {
  id: string;
  userId: string;
  email: string;
  name: string;
  providerRef: string | null;
  paidDate: string | null;
  startDate: string | null;
  endDate: string | null;
  terminatedAt: string | null;
  updatedAt: string | null;
}

export interface AdminSubscriptionAuditReport {
  generatedAt: string;
  currentDuplicateActiveCount: number;
  currentDuplicateActiveUsers: AdminSubscriptionAuditDuplicateUser[];
  likelyDuplicateCleanupCount: number;
  likelyDuplicateCleanupRows: AdminSubscriptionAuditCleanupRow[];
}