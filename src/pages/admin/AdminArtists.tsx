import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Eye, Trash2, Music, MapPin, Building } from "lucide-react";
import { toast } from "@/lib/toast";
import AdminPageLayout from "@/components/admin/AdminPageLayout";
import AdminPageLoader from "@/components/admin/AdminPageLoader";
import ActionConfirmationModal from "@/components/admin/ActionConfirmationModal";
import ArtistDetailsModal from "@/components/admin/ArtistDetailsModal";
import { AdminArtist } from "@/types/admin";
import {
  useAdminArtists,
  useDeleteAdminArtist,
  useUpdateAdminArtist,
  useUpdateAdminArtistStatus,
} from "@/hooks/useAdminArtists";

const AdminArtists = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterGenre, setFilterGenre] = useState("all");
  const [filterCountry, setFilterCountry] = useState("all");
  const [selectedArtistId, setSelectedArtistId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [artistToDelete, setArtistToDelete] = useState<AdminArtist | null>(null);

  const { data: artists = [], isLoading } = useAdminArtists();
  const deleteArtistMutation = useDeleteAdminArtist();
  const updateArtistMutation = useUpdateAdminArtist();
  const updateArtistStatusMutation = useUpdateAdminArtistStatus();

  const filteredArtists = artists.filter(artist => {
    const matchesSearch = 
      artist.artistName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      artist.addedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      artist.recordLabel.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesGenre = filterGenre === "all" || artist.primaryGenre.toLowerCase() === filterGenre;
    const matchesCountry = filterCountry === "all" || artist.country === filterCountry;
    
    return matchesSearch && matchesGenre && matchesCountry;
  });

  const getGenreColor = (genre: string) => {
    switch (genre.toLowerCase()) {
      case 'pop':
        return 'bg-pink-100 text-pink-800';
      case 'rock':
        return 'bg-red-100 text-red-800';
      case 'electronic':
        return 'bg-blue-100 text-blue-800';
      case 'hip-hop':
        return 'bg-purple-100 text-purple-800';
      case 'folk':
        return 'bg-green-100 text-green-800';
      case 'r&b':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewArtist = (artist: AdminArtist) => {
    setSelectedArtistId(artist.id);
    setIsModalOpen(true);
  };

  const handleDeleteArtist = (artist: AdminArtist) => {
    setArtistToDelete(artist);
  };

  const confirmDeleteArtist = async () => {
    if (!artistToDelete) {
      return;
    }

    await deleteArtistMutation.mutateAsync(artistToDelete.id);
    toast.success(`Artist "${artistToDelete.artistName}" has been deleted`);
    setArtistToDelete(null);
  };

  const handleStatusChange = async (artistId: number, newStatus: string) => {
    await updateArtistStatusMutation.mutateAsync({ artistId, status: newStatus });
    
    const artist = artists.find(a => a.id === artistId);
    if (artist) {
      toast.success(`${artist.artistName}'s status updated to ${newStatus}`);
    }
  };

  const handleSaveArtist = async (artist: AdminArtist) => {
    await updateArtistMutation.mutateAsync(artist);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedArtistId(null);
  };

  // Get unique genres and countries for filters
  const uniqueGenres = [...new Set(artists.map(a => a.primaryGenre))].sort();
  const uniqueCountries = [...new Set(artists.map(a => a.country))].sort();
  const selectedArtist = artists.find((artist) => artist.id === selectedArtistId) || null;

  if (isLoading) {
    return (
      <AdminPageLayout title="Artists Management" subtitle="Manage all artists added by users to their accounts">
        <AdminPageLoader message="Loading artists..." />
      </AdminPageLayout>
    );
  }

  return (
    <AdminPageLayout title="Artists Management" subtitle="Manage all artists added by users to their accounts">
        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search artists by name, email, or label..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={filterGenre}
                  onChange={(e) => setFilterGenre(e.target.value)}
                  aria-label="Filter artists by genre"
                  title="Filter artists by genre"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-onerpm-orange focus:border-transparent"
                >
                  <option value="all">All Genres</option>
                  {uniqueGenres.map(genre => (
                    <option key={genre} value={genre.toLowerCase()}>{genre}</option>
                  ))}
                </select>
                <select
                  value={filterCountry}
                  onChange={(e) => setFilterCountry(e.target.value)}
                  aria-label="Filter artists by country"
                  title="Filter artists by country"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-onerpm-orange focus:border-transparent"
                >
                  <option value="all">All Countries</option>
                  {uniqueCountries.map((country) => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Artists Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-400px)]">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Artist
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Genre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Label
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Performance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredArtists.map((artist) => (
                    <tr key={artist.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                              {artist.artistName}
                            </div>
                            <div className="text-sm text-gray-500">Added by: {artist.addedBy}</div>
                            <div className="text-xs text-gray-400">Added: {artist.addedDate}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getGenreColor(artist.primaryGenre)}>
                          {artist.primaryGenre}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                          <span className="text-sm text-gray-900">{artist.country}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Building className="w-4 h-4 mr-2 text-gray-400" />
                          <span className="text-sm text-gray-900">{artist.recordLabel}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center">
                            <Music className="w-4 h-4 mr-1 text-gray-400" />
                            {artist.releases} releases
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewArtist(artist)}
                            title="View Details"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => void handleDeleteArtist(artist)}
                            title="Delete Artist"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{filteredArtists.length}</div>
              <div className="text-sm text-gray-600">Total Artists</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {filteredArtists.reduce((sum, a) => sum + a.releases, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Releases</div>
            </CardContent>
          </Card>
        </div>

      {/* Artist Details Modal */}
      <ArtistDetailsModal
        artist={selectedArtist}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onStatusUpdate={(artistId, newStatus) => void handleStatusChange(artistId, newStatus)}
        onSaveArtist={(artist) => handleSaveArtist(artist)}
      />

      <ActionConfirmationModal
        open={!!artistToDelete}
        onOpenChange={(open) => {
          if (!open) {
            setArtistToDelete(null);
          }
        }}
        title="Delete Artist"
        description={
          artistToDelete
            ? `Are you sure you want to delete artist "${artistToDelete.artistName}"? This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        onConfirm={confirmDeleteArtist}
        isConfirming={deleteArtistMutation.isPending}
      />
    </AdminPageLayout>
  );
};

export default AdminArtists;