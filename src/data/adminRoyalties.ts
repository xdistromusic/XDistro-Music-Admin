import { AdminRoyaltyStats, AdminRoyaltyUploadHistoryItem } from "@/types/admin";

export const mockAdminRoyaltyStats: AdminRoyaltyStats = {
  totalDistributed: 231407.87,
  pendingDistribution: 12543.45,
  totalArtists: 1247,
};

export const mockAdminRoyaltyUploadHistory: AdminRoyaltyUploadHistoryItem[] = [
  {
    id: 1,
    fileName: "royalties_february_2024.csv",
    uploadDate: "2024-03-01",
    recordsProcessed: 15420,
    totalAmount: 89432.56,
    status: "Completed",
    processedBy: "support@xdistromusic.com",
  },
  {
    id: 2,
    fileName: "royalties_january_2024.csv",
    uploadDate: "2024-02-01",
    recordsProcessed: 14876,
    totalAmount: 76543.21,
    status: "Completed",
    processedBy: "support@xdistromusic.com",
  },
  {
    id: 3,
    fileName: "royalties_december_2023.csv",
    uploadDate: "2024-01-01",
    recordsProcessed: 13245,
    totalAmount: 65432.1,
    status: "Completed",
    processedBy: "support@xdistromusic.com",
  },
];
