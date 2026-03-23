import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Search, Eye, Check, X, Clock } from "lucide-react";
import { toast } from "@/lib/toast";
import AdminPageLayout from "@/components/admin/AdminPageLayout";
import AdminPageLoader from "@/components/admin/AdminPageLoader";
import ReleaseDetailsModal from "@/components/admin/ReleaseDetailsModal";
import {
  useAdminReleases,
  useUpdateAdminReleaseStatus,
  useUpdateAdminReleaseUpc,
  useUpdateAdminTrackIsrc,
} from "@/hooks/useAdminReleases";
import { AdminRelease, AdminReleaseStatus } from "@/types/admin";

const RELEASE_STATUS_OPTIONS: Array<"all" | AdminReleaseStatus> = [
  "all",
  "Approved",
  "Submitted",
  "Rejected",
  "Denied",
  "Deleted",
];

const ITEMS_PER_PAGE = 1000;

const AdminReleases = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | AdminReleaseStatus>("all");
  const [selectedReleaseId, setSelectedReleaseId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const { data: releases = [], isLoading } = useAdminReleases();
  const updateStatusMutation = useUpdateAdminReleaseStatus();
  const updateUpcMutation = useUpdateAdminReleaseUpc();
  const updateIsrcMutation = useUpdateAdminTrackIsrc();

  const filteredReleases = releases.filter((release) => {
    const query = searchQuery.toLowerCase();

    const matchesSearch =
      release.title.toLowerCase().includes(query) ||
      release.artist.toLowerCase().includes(query) ||
      release.submittedBy.toLowerCase().includes(query);

    const matchesFilter = filterStatus === "all" || release.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.max(1, Math.ceil(filteredReleases.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedReleases = filteredReleases.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus]);

  const selectedRelease =
    releases.find((release) => release.id === selectedReleaseId) || null;

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  const getStatusColor = (status: AdminReleaseStatus) => {
    switch (status) {
      case "Approved":
        return "bg-green-200 text-green-800";
      case "Submitted":
        return "bg-blue-200 text-blue-800";
      case "Rejected":
        return "bg-yellow-200 text-yellow-800";
      case "Denied":
      case "Deleted":
      default:
        return "bg-red-100 text-red-800";
    }
  };

  const getStatusIcon = (status: AdminReleaseStatus) => {
    switch (status) {
      case "Approved":
        return <Check className="w-4 h-4" />;
      case "Submitted":
        return <Clock className="w-4 h-4" />;
      case "Rejected":
      case "Denied":
      case "Deleted":
      default:
        return <X className="w-4 h-4" />;
    }
  };

  const handleStatusUpdate = async (releaseId: number, newStatus: AdminReleaseStatus) => {
    await updateStatusMutation.mutateAsync({ releaseId, status: newStatus });
    toast.success(`Release status updated to ${newStatus}`);
  };

  const handleUpcUpdate = async (releaseId: number, upc: string) => {
    await updateUpcMutation.mutateAsync({ releaseId, upc });
  };

  const handleTrackIsrcUpdate = async (releaseId: number, trackId: number, isrc: string) => {
    await updateIsrcMutation.mutateAsync({ releaseId, trackId, isrc });
    toast.success("ISRC code updated for track");
  };

  const handleViewDetails = (release: AdminRelease) => {
    setSelectedReleaseId(release.id);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedReleaseId(null);
  };

  if (isLoading) {
    return (
      <AdminPageLayout
        title="Releases Management"
        subtitle="Review and manage all releases"
      >
        <AdminPageLoader message="Loading releases..." />
      </AdminPageLayout>
    );
  }

  return (
    <AdminPageLayout
      title="Releases Management"
      subtitle="Review and manage all releases"
    >
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search releases by title, artist, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as "all" | AdminReleaseStatus)}
                aria-label="Filter releases by status"
                title="Filter releases by status"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-onerpm-orange focus:border-transparent"
              >
                {RELEASE_STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status === "all" ? "All Status" : status}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-400px)]">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Release</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted By</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Release Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Genre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tracks</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UPC Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedReleases.map((release) => (
                  <tr key={release.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{release.title}</div>
                        <div className="text-sm text-gray-500">by {release.artist}</div>
                        <div className="text-xs text-gray-400">Submitted: {release.submissionDate}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{release.submittedBy}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{release.releaseDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={getStatusColor(release.status)}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(release.status)}
                          <span>{release.status}</span>
                        </div>
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{release.genre}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{release.tracks}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs text-gray-600 font-mono">
                        {release.upc || <span className="text-red-500 italic">Not assigned</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          title="View Details"
                          onClick={() => handleViewDetails(release)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <select
                          value={release.status}
                          onChange={(e) => void handleStatusUpdate(release.id, e.target.value as AdminReleaseStatus)}
                          aria-label={`Update release status for ${release.title}`}
                          title={`Update release status for ${release.title}`}
                          className="text-xs border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="Submitted">Pending Review</option>
                          <option value="Approved">Approved</option>
                          <option value="Rejected">Rejected</option>
                          <option value="Denied">Denied</option>
                          <option value="Deleted">Deleted</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1}-{Math.min(endIndex, filteredReleases.length)} of {filteredReleases.length} releases
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className="flex items-center space-x-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </Button>

                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    const showPage =
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1);

                    if (!showPage) {
                      if (page === currentPage - 2 || page === currentPage + 2) {
                        return (
                          <span key={page} className="px-2 py-1 text-gray-400">
                            ...
                          </span>
                        );
                      }

                      return null;
                    }

                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => goToPage(page)}
                        className={`w-8 h-8 p-0 ${
                          currentPage === page ? "bg-onerpm-orange hover:bg-onerpm-orange/90 text-white" : ""
                        }`}
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="flex items-center space-x-1"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{filteredReleases.length}</div>
            <div className="text-sm text-gray-600">Total Releases</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {filteredReleases.filter((r) => r.status === "Submitted").length}
            </div>
            <div className="text-sm text-gray-600">Submitted</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {filteredReleases.filter((r) => r.status === "Approved").length}
            </div>
            <div className="text-sm text-gray-600">Approved</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {filteredReleases.filter((r) => r.status === "Rejected").length}
            </div>
            <div className="text-sm text-gray-600">Rejected</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {filteredReleases.filter((r) => r.status === "Denied").length}
            </div>
            <div className="text-sm text-gray-600">Denied</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {filteredReleases.filter((r) => r.status === "Deleted").length}
            </div>
            <div className="text-sm text-gray-600">Deleted</div>
          </CardContent>
        </Card>
      </div>

      <ReleaseDetailsModal
        release={selectedRelease}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onStatusUpdate={(releaseId, newStatus) =>
          void handleStatusUpdate(releaseId, newStatus as AdminReleaseStatus)
        }
        onUpcUpdate={(releaseId, upc) => void handleUpcUpdate(releaseId, upc)}
        onIsrcUpdate={(releaseId, trackId, isrc) =>
          void handleTrackIsrcUpdate(releaseId, trackId, isrc)
        }
      />
    </AdminPageLayout>
  );
};

export default AdminReleases;
