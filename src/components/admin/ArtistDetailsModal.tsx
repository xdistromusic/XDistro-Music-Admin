import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/lib/toast";
import { AdminArtist } from "@/types/admin";
import { User, Mail, Globe, MapPin, Building, Music, ExternalLink, CreditCard as Edit, Save, X, Calendar, ChartBar as BarChart3 } from "lucide-react";

interface ArtistDetailsModalProps {
  artist: AdminArtist | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate?: (artistId: AdminArtist["id"], newStatus: string) => void;
  onSaveArtist?: (artist: AdminArtist) => Promise<void> | void;
}

const ArtistDetailsModal = ({ artist, isOpen, onClose, onSaveArtist }: ArtistDetailsModalProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedArtist, setEditedArtist] = useState<AdminArtist | null>(null);

  if (!artist) return null;

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

  const handleEdit = () => {
    setEditedArtist({ ...artist });
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!editedArtist) return;

    setIsSaving(true);
    Promise.resolve(onSaveArtist?.(editedArtist))
      .then(() => {
        toast.success(`Artist "${editedArtist.artistName}" has been updated successfully`);
        setIsEditing(false);
        setEditedArtist(null);
      })
      .catch(() => {
        toast.error("Failed to update artist. Please try again.");
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedArtist(null);
  };

  const handleInputChange = (field: keyof AdminArtist, value: string) => {
    if (editedArtist) {
      setEditedArtist({ ...editedArtist, [field]: value });
    }
  };

  const displayArtist = isEditing ? editedArtist : artist;
  if (!displayArtist) return null;

  const genres = [
    "African",
    "African Dancehall",
    "African Reggae",
    "Afro House",
    "Afro Soul",
    "Afro-Beat",
    "Afro-Folk",
    "Afro-Fusion",
    "Afro-Pop",
    "Alte",
    "Alternative",
    "Alternative Rock",
    "Amapiano",
    "Baladas y Boleros",
    "Blues",
    "Brazilian",
    "Children's",
    "Chinese",
    "Christian",
    "Comedy",
    "Contemporary Latin",
    "Country",
    "Easy Listening",
    "Educational",
    "Egyptian Pop",
    "Electronic",
    "Enka",
    "Experimental",
    "Fitness & Workout",
    "Folk",
    "French Pop",
    "German Pop",
    "Hip-Hop/Rap",
    "Holiday",
    "Inspirational",
    "Instrumental",
    "J-Pop",
    "Jazz",
    "K-Pop",
    "Kayokyoku",
    "Latin",
    "Latin Jazz",
    "Levant",
    "Levant Pop",
    "Maghreb Pop",
    "Maghreb Rai",
    "Metal",
    "New Age",
    "Original Filipino Music",
    "Pop",
    "Pop Latino",
    "Punk",
    "R&B",
    "Raices",
    "Reggae",
    "Regional Mexicano",
    "Rock",
    "Soul",
    "Spoken Word",
    "Trot",
    "Vocal/Nostalgia",
    "World"
  ];

  const countries = [
    "Afghanistan", "Albania", "Algeria", "American Samoa", "Andorra", "Angola", "Antigua and Barbuda",
    "Argentina", "Armenia", "Aruba", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain",
    "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bermuda", "Bhutan", "Bolivia",
    "Bosnia", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cape Verde",
    "Cambodia", "Cameroon", "Canada", "Cayman Islands", "Central African Republic", "Chad", "Chile",
    "China", "Colombia", "Comoros", "Democratic Republic of the Congo", "Republic of the Congo",
    "Costa Rica", "Cote d'Ivoire", "Croatia", "Cuba", "Curacao", "Cyprus", "Czech Republic",
    "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador",
    "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Faroe Islands", "Fiji",
    "Finland", "France", "French Guiana", "French Polynesia", "Gabon", "The Gambia", "Gaza Strip",
    "Georgia", "Germany", "Ghana", "Greece", "Greenland", "Grenada", "Guadeloupe", "Guam", "Guatemala",
    "Guernsey", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hong Kong", "Hungary",
    "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Isle of Man", "Israel", "Italy",
    "Jamaica", "Japan", "Jersey", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "North Korea",
    "South Korea", "Kosovo", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho",
    "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Macau", "Madagascar", "Malawi",
    "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Martinique", "Mauritania",
    "Mauritius", "Mayotte", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro",
    "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Caledonia",
    "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Macedonia", "Northern Mariana Islands",
    "Norway", "Oman", "Pakistan", "Palau", "Panama", "Papua New Guinea", "Paraguay", "Peru",
    "Philippines", "Poland", "Portugal", "Puerto Rico", "Qatar", "Reunion", "Romania", "Russia",
    "Rwanda", "Saint Barthelemy", "Saint Helena, Ascension and Tristan da Cunha",
    "Saint Kitts and Nevis", "Saint Lucia", "Saint Martin", "Saint Pierre and Miquelon",
    "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia",
    "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Sint Maarten", "Slovakia",
    "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Sudan", "Spain", "Sri Lanka",
    "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania",
    "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey",
    "Turkmenistan", "Turks and Caicos Islands", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates",
    "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City",
    "Venezuela", "Vietnam", "U.S. Virgin Islands", "Wallis and Futuna", "West Bank",
    "Yemen", "Zambia", "Zimbabwe"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Artist Header */}
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 space-y-4">
              <div>
                {isEditing ? (
                  <div className="space-y-2">
                    <Label htmlFor="artistName">Artist Name</Label>
                    <Input
                      id="artistName"
                      value={displayArtist.artistName}
                      onChange={(e) => handleInputChange('artistName', e.target.value)}
                      className="text-2xl font-bold"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-bold text-gray-900">{displayArtist.artistName}</h3>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                {isEditing ? (
                  <div className="space-y-2">
                    <Label htmlFor="primaryGenre">Genre</Label>
                    <select
                      id="primaryGenre"
                      value={displayArtist.primaryGenre}
                      onChange={(e) => handleInputChange('primaryGenre', e.target.value)}
                      aria-label="Select primary genre"
                      title="Primary genre"
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-onerpm-orange focus:border-transparent"
                    >
                      {genres.map(genre => (
                        <option key={genre} value={genre}>{genre}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <Badge className={getGenreColor(displayArtist.primaryGenre)}>
                    {displayArtist.primaryGenre}
                  </Badge>
                )}               
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Added:</span>
                  <span className="font-medium">{displayArtist.addedDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Added by:</span>
                  <span className="font-medium">{displayArtist.addedBy}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Music className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Releases:</span>
                  <span className="font-medium">{displayArtist.releases}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Artist Bio */}
          <Card>
            <CardContent className="p-6">
              <h4 className="text-lg font-semibold mb-4">Artist Bio</h4>
              {isEditing ? (
                <div className="space-y-2">
                  <Label htmlFor="artistBio">Biography</Label>
                  <textarea
                    id="artistBio"
                    value={displayArtist.artistBio}
                    onChange={(e) => handleInputChange('artistBio', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-onerpm-orange focus:border-transparent"
                    placeholder="Tell your story... (This will be used for promotional materials and streaming platforms)"
                  />
                </div>
              ) : (
                <p className="text-gray-700 leading-relaxed">{displayArtist.artistBio}</p>
              )}
            </CardContent>
          </Card>

          {/* Artist Information */}
          <Card>
            <CardContent className="p-6">
              <h4 className="text-lg font-semibold mb-4">Artist Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Country/Region</Label>
                    {isEditing ? (
                      <select
                        value={displayArtist.country}
                        onChange={(e) => handleInputChange('country', e.target.value)}
                        aria-label="Select country"
                        title="Country"
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-onerpm-orange focus:border-transparent"
                      >
                        {countries.map(country => (
                          <option key={country} value={country}>{country}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="flex items-center gap-2 mt-1">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">{displayArtist.country}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-600">Record Label</Label>
                    {isEditing ? (
                      <Input
                        value={displayArtist.recordLabel}
                        onChange={(e) => handleInputChange('recordLabel', e.target.value)}
                        placeholder="Independent or label name"
                        className="mt-1"
                      />
                    ) : (
                      <div className="flex items-center gap-2 mt-1">
                        <Building className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">{displayArtist.recordLabel}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Spotify Artist URL</Label>
                    {isEditing ? (
                      <Input
                        value={displayArtist.spotifyUrl}
                        onChange={(e) => handleInputChange('spotifyUrl', e.target.value)}
                        placeholder="https://open.spotify.com/artist/..."
                        className="mt-1"
                      />
                    ) : (
                      <div className="flex items-center gap-2 mt-1">
                        <Globe className="w-4 h-4 text-gray-500" />
                        <a 
                          href={displayArtist.spotifyUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          View on Spotify
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-4 border-t">
            {isEditing ? (
              <>
                <Button onClick={handleSave} disabled={isSaving} className="bg-onerpm-orange hover:bg-onerpm-orange/90">
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEdit}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Artist
                </Button>
              </>
            )}

            <div className="ml-auto">
              <Button onClick={onClose} variant="outline">
                Close
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ArtistDetailsModal;