import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "@/lib/toast";
import { 
  Music, 
  User, 
  Calendar, 
  Globe, 
  Clock, 
  ExternalLink,
  Play,
  Download,
  Check,
  X,
  AlertCircle,
  AlertTriangle,
  Save,
  Edit,
  Hash,
  Users,
  Loader2,
  Zap
} from "lucide-react";

interface Track {
  id: string | number;
  title: string;
  duration: string;
  explicitContent?: boolean;
  isrc: string;
  tiktokPreviewMinutes?: number;
  tiktokPreviewSeconds?: number;
  primaryArtists: string[];
  primaryArtistProfiles?: { name: string; profileUrl: string }[];
  additionalPrimaryArtists: string[];
  additionalPrimaryArtistProfiles?: { name: string; profileUrl: string }[];
  featuredArtists: string[];
  featuredArtistProfiles?: { name: string; profileUrl: string }[];
  songwriters: string[];
  producers: string[];
  performers: string[];
  audioFile?: string; // URL to the audio file
}

interface Release {
  id: string | number;
  title: string;
  artist: string;
  additionalPrimaryArtist?: string;
  submittedBy: string;
  releaseDate: string;
  previousDate: string;
  submissionDate: string;
  status: string;
  genre: string;
  tracks: number;
  upc: string;
  coverArt?: string;
  label?: string;
  copyright?: string;
  copyrightYear?: string;
  language?: string;
  trackList?: Track[];
  distributionPlatforms?: string[];
  primaryArtistProfiles?: { name: string; profileUrl: string }[];
  additionalPrimaryArtistProfiles?: { name: string; profileUrl: string }[];
  fastlane?: boolean;
  fastlane_purchased_at?: string;
}

interface ReleaseDetailsModalProps {
  release: Release | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate?: (releaseId: string | number, newStatus: string) => void;
  onUpcUpdate?: (releaseId: string | number, upc: string) => void;
  onIsrcUpdate?: (releaseId: string | number, trackId: string | number, isrc: string) => void;
  onTikTokPreviewUpdate?: (releaseId: string | number, trackId: string | number, minutes: number, seconds: number) => void;
}

const ReleaseDetailsModal = ({ 
  release, 
  isOpen, 
  onClose, 
  onStatusUpdate,
  onUpcUpdate,
  onIsrcUpdate,
  onTikTokPreviewUpdate
}: ReleaseDetailsModalProps) => {
  const [editingUpc, setEditingUpc] = useState(false);
  const [editingIsrc, setEditingIsrc] = useState<string | number | null>(null);
  const [editingTikTokPreview, setEditingTikTokPreview] = useState<string | number | null>(null);
  const [upcValue, setUpcValue] = useState("");
  const [isrcValues, setIsrcValues] = useState<Record<string, string>>({});
  const [tiktokPreviewValues, setTiktokPreviewValues] = useState<Record<string, { minutes: number; seconds: number }>>({});
  const [isDownloading, setIsDownloading] = useState(false);

  const normalizeExternalUrl = (url?: string) => {
    const trimmed = String(url ?? "").trim();
    if (!trimmed) return "";
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  };

  if (!release) return null;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-200 text-green-800';
      case 'submitted':
        return 'bg-blue-200 text-blue-800';
      case 'rejected':
        return 'bg-yellow-200 text-yellow-800';
      case 'denied':
        return 'bg-red-100 text-red-800';
      case 'deleted':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };

  // Use the actual track list from the release data, or create a default single track
  const trackList = release.trackList || [
    {
      id: 1,
      title: release.title,
      duration: "3:45",
      explicitContent: false,
      isrc: "",
      primaryArtists: [release.artist],
      additionalPrimaryArtists: [],
      featuredArtists: [],
      songwriters: [release.artist],
      producers: [release.artist],
      performers: [release.artist],
      tiktokPreviewMinutes: 0,
      tiktokPreviewSeconds: 30,
      audioFile: `https://example.com/audio/${release.id}/${release.title.replace(/\s+/g, '_').toLowerCase()}.mp3`
    }
  ];

  // Add mock audio file URLs to existing tracks if they don't have them
  const tracksWithAudioFiles = trackList.map(track => ({
    ...track,
    audioFile: track.audioFile || `https://example.com/audio/${release.id}/${track.title.replace(/\s+/g, '_').toLowerCase()}.mp3`
  }));

  const selectedPlatforms = release.distributionPlatforms ?? [];
  const releasePrimaryArtistProfileUrl = normalizeExternalUrl(
    release.primaryArtistProfiles?.find((profile) => profile.name === release.artist)?.profileUrl
      ?? release.primaryArtistProfiles?.[0]?.profileUrl
  );

  const generateUpc = () => {
    // Generate UPC code
    const upc = Math.floor(Math.random() * 900000000000) + 100000000000;
    return upc.toString();
  };

  const generateIsrc = () => {
    // Generate a random ISRC code (format: CCXXXYYNNNNN)
    const countryCode = "US";
    const registrantCode = "RC1";
    const year = new Date().getFullYear().toString().slice(-2);
    const designation = Math.floor(Math.random() * 90000) + 10000;
    return `${countryCode}${registrantCode}${year}${designation}`;
  };

  const handleUpcSave = () => {
    if (upcValue.length === 12 && /^\d+$/.test(upcValue)) {
      onUpcUpdate?.(release.id, upcValue);
      setEditingUpc(false);
      toast.success("UPC code updated successfully");
    }
    if (upcValue.length === 13 && /^\d+$/.test(upcValue)) {
      onUpcUpdate?.(release.id, upcValue);
      setEditingUpc(false);
      toast.success("UPC code updated successfully");
    }
    if (upcValue.length === 11 && /^\d+$/.test(upcValue)) {
      onUpcUpdate?.(release.id, upcValue);
      setEditingUpc(true);
      toast.error("UPC code must be maximum of 13 digits");
    }    
  };
  
  const handleIsrcSave = (trackId: string | number) => {
    const isrcValue = isrcValues[String(trackId)];
    if (isrcValue && isrcValue.length === 12) {
      onIsrcUpdate?.(release.id, trackId, isrcValue);
      setEditingIsrc(null);
      toast.success("ISRC code updated successfully");
    } else {
      toast.error("ISRC code must be exactly 12 characters");
    }
  };

  const handleUpcEdit = () => {
    setUpcValue(release.upc || "");
    setEditingUpc(true);
  };

  const handleIsrcEdit = (trackId: string | number, currentIsrc: string) => {
    setIsrcValues({ ...isrcValues, [String(trackId)]: currentIsrc });
    setEditingIsrc(trackId);
  };

  const handleTikTokPreviewSave = (trackId: string | number) => {
    const previewValue = tiktokPreviewValues[String(trackId)];
    if (previewValue && previewValue.seconds >= 0 && previewValue.seconds < 60 && previewValue.minutes >= 0) {
      onTikTokPreviewUpdate?.(release.id, trackId, previewValue.minutes, previewValue.seconds);
      setEditingTikTokPreview(null);
      toast.success("TikTok preview time updated successfully");
    } else {
      toast.error("Please enter valid time values (seconds must be 0-59)");
    }
  };

  const handleTikTokPreviewEdit = (trackId: string | number, currentMinutes: number = 0, currentSeconds: number = 30) => {
    setTiktokPreviewValues({ 
      ...tiktokPreviewValues, 
      [String(trackId)]: { minutes: currentMinutes, seconds: currentSeconds } 
    });
    setEditingTikTokPreview(trackId);
  };

  const formatPreviewTime = (minutes: number, seconds: number) => {
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleGenerateUpc = () => {
    const newUpc = generateUpc();
    setUpcValue(newUpc);
  };

  const handleGenerateIsrc = (trackId: string | number) => {
    const newIsrc = generateIsrc();
    setIsrcValues({ ...isrcValues, [String(trackId)]: newIsrc });
  };

  const getTotalDuration = () => {
    if (!tracksWithAudioFiles || tracksWithAudioFiles.length === 0) return "0:00";
    
    let totalSeconds = 0;
    tracksWithAudioFiles.forEach(track => {
      const [minutes, seconds] = track.duration.split(':').map(Number);
      totalSeconds += minutes * 60 + seconds;
    });
    
    const totalMinutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${totalMinutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getUnassignedIsrcCount = () => {
    return tracksWithAudioFiles.filter(track => !track.isrc || track.isrc === "").length;
  };

  const downloadFile = async (url: string, filename: string) => {
    try {
      // In a real application, you would fetch the actual file
      // For demo purposes, we'll create a mock download
      const response = await fetch(url).catch(() => {
        // If the URL doesn't exist, create a mock blob
        return new Response(new Blob(['Mock file content'], { type: 'application/octet-stream' }));
      });
      
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download failed:', error);
      throw error;
    }
  };

  const handleDownloadAllFiles = async () => {
    setIsDownloading(true);
    
    try {
      const downloadPromises = [];
      
      // Download cover art if available
      if (release.coverArt) {
        const coverArtFilename = `${release.artist.replace(/\s+/g, '_')}_${release.title.replace(/\s+/g, '_')}_cover.jpg`;
        downloadPromises.push(
          downloadFile(release.coverArt, coverArtFilename)
        );
      }
      
      // Download all audio tracks
      tracksWithAudioFiles.forEach((track, index) => {
        const audioFilename = `${String(index + 1).padStart(2, '0')}_${track.title.replace(/\s+/g, '_')}.mp3`;
        downloadPromises.push(
          downloadFile(track.audioFile!, audioFilename)
        );
      });
      
      // Execute all downloads
      await Promise.all(downloadPromises);
      
      const totalFiles = downloadPromises.length;
      toast.success(`Successfully downloaded ${totalFiles} files (${tracksWithAudioFiles.length} audio tracks${release.coverArt ? ' + cover art' : ''})`);
      
    } catch (error) {
      console.error('Download error:', error);
      toast.error("Some files failed to download. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const downloadSingleTrack = async (track: Track, index: number) => {
    try {
      const filename = `${String(index + 1).padStart(2, '0')}_${track.title.replace(/\s+/g, '_')}.mp3`;
      await downloadFile(track.audioFile!, filename);
      toast.success(`Downloaded: ${track.title}`);
    } catch (error) {
      toast.error(`Failed to download: ${track.title}`);
    }
  };

  const downloadCoverArt = async () => {
    if (!release.coverArt) {
      toast.error("No cover art available");
      return;
    }
    
    try {
      const filename = `${release.artist.replace(/\s+/g, '_')}_${release.title.replace(/\s+/g, '_')}_cover.jpg`;
      await downloadFile(release.coverArt, filename);
      toast.success("Cover art downloaded successfully");
    } catch (error) {
      toast.error("Failed to download cover art");
    }
  };
 
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-onerpm-orange font-bold flex items-center gap-3">
            Release Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Release Header */}
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              <div className="w-48 h-48 bg-gray-200 rounded-lg flex items-center justify-center relative group">
                {release.coverArt ? (
                  <>
                    <img 
                      src={release.coverArt} 
                      alt={`${release.title} cover art`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={downloadCoverArt}
                        className="text-white hover:bg-white/20"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center text-gray-500">
                    <Music className="w-12 h-12 mx-auto mb-2" />
                    <p className="text-sm">No Cover Art</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{release.title}</h3>
                <p className="text-lg text-gray-600">
                  by {releasePrimaryArtistProfileUrl ? (
                    <a
                      href={releasePrimaryArtistProfileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {release.artist}
                    </a>
                  ) : (
                    release.artist
                  )}
                  {release.additionalPrimaryArtistProfiles && release.additionalPrimaryArtistProfiles.length > 0 && (
                    <span>
                      {release.additionalPrimaryArtistProfiles.map((profile, i) => (
                        <span key={i}>
                          {" & "}
                          {profile.profileUrl ? (
                            <a
                              href={profile.profileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {profile.name}
                            </a>
                          ) : (
                            profile.name
                          )}
                        </span>
                      ))}
                    </span>
                  )}
                </p>
                {release.tracks > 1 && (
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="border-blue-300 text-blue-700">
                      <Users className="w-3 h-3 mr-1" />
                      {release.tracks} Tracks • {getTotalDuration()} Total
                    </Badge>
                    {release.fastlane && (
                      <Badge className="bg-yellow-100 text-yellow-800 border border-yellow-300 flex items-center gap-1">
                        <Zap className="w-3 h-3" /> FastLane
                      </Badge>
                    )}
                  </div>
                )}
                {release.tracks <= 1 && release.fastlane && (
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className="bg-yellow-100 text-yellow-800 border border-yellow-300 flex items-center gap-1">
                      <Zap className="w-3 h-3" /> FastLane
                    </Badge>
                  </div>
                )}
              </div>
 
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Release Date:</span>
                    <span className="font-medium">{release.releaseDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Previouse Date:</span>
                    <span className="font-medium">{release.previousDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Submitted:</span>
                    <span className="font-medium">{release.submissionDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Submitted by:</span>
                    <span className="font-medium">{release.submittedBy}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Genre:</span>
                    <span className="font-medium">{release.genre}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Music className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Tracks:</span>
                    <span className="font-medium">{release.tracks}</span>
                  </div>
                  
                  {/* UPC Code Assignment */}
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">UPC:</span>
                    {editingUpc ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={upcValue}
                          onChange={(e) => setUpcValue(e.target.value)}
                          placeholder="123456789012"
                          className="w-32 h-8 text-sm font-mono"
                          maxLength={13}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleGenerateUpc}
                          className="h-8 px-2 text-xs"
                        >
                          Generate
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleUpcSave}
                          className="h-8 px-2"
                        >
                          <Save className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingUpc(false)}
                          className="h-8 px-2"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">
                          {release.upc || (
                            <span className="text-red-500 italic font-sans">Not assigned</span>
                          )}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleUpcEdit}
                          className="h-6 px-2"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Badge className={getStatusColor(release.status)}>
                  {release.status}
                </Badge>
                {getUnassignedIsrcCount() > 0 && (
                  <Badge variant="outline" className="border-yellow-300 text-yellow-700">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {getUnassignedIsrcCount()} ISRC codes missing
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Track List */}
          <Card>
            <CardContent className="p-6">
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Play className="w-5 h-5" />
                Track List ({tracksWithAudioFiles.length} {tracksWithAudioFiles.length === 1 ? 'Track' : 'Tracks'})
              </h4>
              <div className="space-y-4">
                {tracksWithAudioFiles.map((track, index) => (
                  <div key={track.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h5 className="font-medium text-gray-900 text-lg">
                            {index + 1}. {track.title}
                          </h5>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => downloadSingleTrack(track, index)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            title="Download Track"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-gray-600">Duration: {track.duration}</p>
                        
              <div className="flex items-center gap-2 mt-2">
                {track.explicitContent && (
                  <Badge variant="outline" className="border-red-300 text-red-700">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Explicit
                  </Badge>
                )}
              </div>
                        
                        {/* ISRC Code Assignment */}
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-sm text-gray-600">ISRC:</span>
                          {editingIsrc === track.id ? (
                            <div className="flex items-center gap-2">
                              <Input
                                value={isrcValues[track.id] || ""}
                                onChange={(e) => setIsrcValues({ 
                                  ...isrcValues, 
                                  [track.id]: e.target.value.toUpperCase() 
                                })}
                                placeholder="USRC17607839"
                                className="w-32 h-6 text-xs font-mono"
                                maxLength={12}
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleGenerateIsrc(track.id)}
                                className="h-6 px-2 text-xs"
                              >
                                Generate
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleIsrcSave(track.id)}
                                className="h-6 px-2"
                              >
                                <Save className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingIsrc(null)}
                                className="h-6 px-2"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono">
                                {track.isrc || (
                                  <span className="text-red-500 italic font-sans">Not assigned</span>
                                )}
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleIsrcEdit(track.id, track.isrc)}
                                className="h-5 px-1"
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                        
                        {/* TikTok Preview Start Time */}
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-sm text-gray-600">TikTok Preview:</span>
                          {editingTikTokPreview === track.id ? (
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                <Input
                                  type="number"
                                  min="0"
                                  max="59"
                                  value={tiktokPreviewValues[track.id]?.minutes || 0}
                                  onChange={(e) => setTiktokPreviewValues({ 
                                    ...tiktokPreviewValues, 
                                    [track.id]: { 
                                      ...tiktokPreviewValues[track.id], 
                                      minutes: Math.max(0, parseInt(e.target.value) || 0) 
                                    } 
                                  })}
                                  className="w-16 h-6 text-xs text-center"
                                  placeholder="0"
                                />
                                <span className="text-xs text-gray-500">m</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Input
                                  type="number"
                                  min="0"
                                  max="59"
                                  value={tiktokPreviewValues[track.id]?.seconds || 30}
                                  onChange={(e) => setTiktokPreviewValues({ 
                                    ...tiktokPreviewValues, 
                                    [track.id]: { 
                                      ...tiktokPreviewValues[track.id], 
                                      seconds: Math.max(0, Math.min(59, parseInt(e.target.value) || 0)) 
                                    } 
                                  })}
                                  className="w-16 h-6 text-xs text-center"
                                  placeholder="30"
                                />
                                <span className="text-xs text-gray-500">s</span>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => handleTikTokPreviewSave(track.id)}
                                className="h-6 px-2"
                              >
                                <Save className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingTikTokPreview(null)}
                                className="h-6 px-2"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono">
                                {formatPreviewTime(
                                  track.tiktokPreviewMinutes || 0, 
                                  track.tiktokPreviewSeconds || 30
                                )}
                              </span>
                              <span className="text-xs text-gray-500">
                                (Preview starts at {formatPreviewTime(
                                  track.tiktokPreviewMinutes || 0, 
                                  track.tiktokPreviewSeconds || 30
                                )})
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleTikTokPreviewEdit(
                                  track.id, 
                                  track.tiktokPreviewMinutes || 0, 
                                  track.tiktokPreviewSeconds || 30
                                )}
                                className="h-5 px-1"
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-gray-700 mb-1">Primary Artists:</p>
                        <div className="space-y-1">
                          {track.primaryArtists.map((artist, i) => (
                            (() => {
                              const primaryProfileUrl = normalizeExternalUrl(
                                track.primaryArtistProfiles?.find((profile) =>
                                  profile.name.trim().toLowerCase() === artist.trim().toLowerCase()
                                )?.profileUrl ||
                                  release.primaryArtistProfiles?.find((profile) =>
                                    profile.name.trim().toLowerCase() === artist.trim().toLowerCase()
                                  )?.profileUrl ||
                                  (track.primaryArtists.length === 1 ? release.primaryArtistProfiles?.[0]?.profileUrl : "")
                              );

                              return (
                                <div key={i} className="flex items-center gap-2">
                                  <span>{artist}</span>
                                  {primaryProfileUrl ? (
                                    <a
                                      href={primaryProfileUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center text-onerpm-orange hover:text-onerpm-orange/80"
                                      aria-label={`Open ${artist} profile`}
                                    >
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  ) : null}
                                </div>
                              );
                            })()
                          ))}
                        </div>
 
                        {(track.featuredArtists?.length || track.featuredArtistProfiles?.length) ? (
                          <>
                            <p className="font-medium text-gray-700 mb-1 mt-3">Featured Artists:</p>
                            <div className="space-y-1">
                              {(track.featuredArtistProfiles && track.featuredArtistProfiles.length > 0
                                ? track.featuredArtistProfiles
                                : (track.featuredArtists || []).map((name) => ({ name, profileUrl: "" }))
                              ).map((artistProfile, i) => {
                                const artist = artistProfile.name;
                                const profileUrl = normalizeExternalUrl(
                                  artistProfile.profileUrl ||
                                  track.featuredArtistProfiles?.find((profile) =>
                                    profile.name.trim().toLowerCase() === artist.trim().toLowerCase()
                                  )?.profileUrl ||
                                  ""
                                );
                                return (
                                  <div key={i} className="flex items-center gap-2">
                                    <span>{artist}</span>
                                    {profileUrl ? (
                                      <a
                                        href={profileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center text-onerpm-orange hover:text-onerpm-orange/80"
                                        aria-label={`Open ${artist} profile`}
                                      >
                                        <ExternalLink className="w-3 h-3" />
                                      </a>
                                    ) : null}
                                  </div>
                                );
                              })}
                            </div>
                          </>
                        ) : null}
                      </div>

                      <div>
                        <p className="font-medium text-gray-700 mb-1">Songwriter Credits:</p>
                        <p className="text-gray-600 mb-3">{track.songwriters?.join(", ") || "Not specified"}</p>

                        <p className="font-medium text-gray-700 mb-1">Production Credits:</p>
                        <p className="text-gray-600 mb-3">{track.producers?.join(", ") || "Not specified"}</p>

                        <p className="font-medium text-gray-700 mb-1">Performer Credits:</p>
                        <p className="text-gray-600">{track.performers?.join(", ") || "Not specified"}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Distribution Platforms */}
          <Card>
            <CardContent className="p-6">
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Selected Distribution Platforms
              </h4>
              {selectedPlatforms.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {selectedPlatforms.map((platform, index) => (
                    <div key={`${platform}-${index}`} className="flex items-center gap-2 p-2 border rounded-lg">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-sm">{platform}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2 p-3 border border-amber-200 rounded-lg bg-amber-50">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <p className="text-sm text-amber-700">
                    Distribution stores not configured. This release may need distribution setup.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium text-gray-700 mb-1">Label:</p>
                  <p className="text-gray-600 mb-3">{release.label || "Independent"}</p>

                  <p className="font-medium text-gray-700 mb-1">Copyright Holder:</p>
                  <p className="text-gray-600 mb-3">{release.copyright || release.artist}</p>

                  <p className="font-medium text-gray-700 mb-1">Copyright Year:</p>
                  <p className="text-gray-600 mb-3">{release.copyrightYear || "—"}</p>
                </div>

                <div>
                  <p className="font-medium text-gray-700 mb-1">Language:</p>
                  <p className="text-gray-600 mb-3">{release.language || "English"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-4 border-t">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDownloadAllFiles}
              disabled={isDownloading}
              className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-300"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Download All Files ({tracksWithAudioFiles.length} tracks{release.coverArt ? ' + cover' : ''})
                </>
              )}
            </Button>

            <div className="ml-auto">
              <Button onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReleaseDetailsModal;