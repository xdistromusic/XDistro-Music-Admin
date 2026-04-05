import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminUserListItem } from "@/types/admin";
import { useUpdateAdminUserDetails } from "@/hooks/useAdminUsers";
import { toast } from "@/lib/toast";
import {
  Mail,
  MapPin,
  Calendar,
  Clock,
  Music,
  DollarSign,
  Pencil,
} from "lucide-react";

interface UserDetailsModalProps {
  user: AdminUserListItem | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate?: (userId: AdminUserListItem["id"], newStatus: string) => void;
}

const UserDetailsModal = ({ user, isOpen, onClose, onStatusUpdate: _onStatusUpdate }: UserDetailsModalProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [displayUser, setDisplayUser] = useState<AdminUserListItem | null>(null);
  const [editData, setEditData] = useState({ firstName: "", lastName: "", email: "", country: "" });

  const updateDetailsMutation = useUpdateAdminUserDetails();

  useEffect(() => {
    if (user) {
      setDisplayUser(user);
      setEditData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        country: user.country,
      });
    }
    setIsEditing(false);
  }, [user]);

  if (!user) return null;
  const activeUser = displayUser ?? user;

  const getPlanColor = (plan: string) => {
    switch (plan.toLowerCase()) {
      case "artist":
        return "bg-blue-100 text-blue-800";
      case "pro":
        return "bg-purple-100 text-purple-800";
      case "label":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleSave = () => {
    if (!editData.firstName.trim() || !editData.lastName.trim() || !editData.email.trim() || !editData.country.trim()) {
      toast.error("All fields are required.");
      return;
    }
    updateDetailsMutation.mutate(
      { userId: user.id, details: editData },
      {
        onSuccess: () => {
          setDisplayUser((prev) => {
            if (!prev) {
              return prev;
            }

            return {
              ...prev,
              firstName: editData.firstName,
              lastName: editData.lastName,
              email: editData.email,
              country: editData.country,
            };
          });
          toast.success("User details updated successfully.");
          setIsEditing(false);
        },
        onError: (error: unknown) => {
          const message = error instanceof Error ? error.message : "Failed to update user details. Please try again.";
          toast.error(message);
        },
      }
    );
  };

  const handleCancel = () => {
    const source = displayUser ?? user;
    setEditData({
      firstName: source.firstName,
      lastName: source.lastName,
      email: source.email,
      country: source.country,
    });
    setIsEditing(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-onerpm-orange font-bold flex items-center gap-3">
            User Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Header */}
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {activeUser.firstName} {activeUser.lastName}
                </h3>
                <p className="text-lg text-gray-600">User ID: {activeUser.id}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Badge className={getPlanColor(activeUser.plan)}>
                  {activeUser.plan} Plan
                </Badge>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Contact Information
                </h4>
                {!isEditing && (
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    <Pencil className="w-4 h-4 mr-1" />
                    Edit Details
                  </Button>
                )}
              </div>

              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-firstName" className="text-sm font-medium text-gray-700 mb-1 block">
                      First Name
                    </Label>
                    <Input
                      id="edit-firstName"
                      value={editData.firstName}
                      onChange={(e) => setEditData((prev) => ({ ...prev, firstName: e.target.value }))}
                      placeholder="First name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-lastName" className="text-sm font-medium text-gray-700 mb-1 block">
                      Last Name
                    </Label>
                    <Input
                      id="edit-lastName"
                      value={editData.lastName}
                      onChange={(e) => setEditData((prev) => ({ ...prev, lastName: e.target.value }))}
                      placeholder="Last name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-email" className="text-sm font-medium text-gray-700 mb-1 block">
                      Email Address
                    </Label>
                    <Input
                      id="edit-email"
                      type="email"
                      value={editData.email}
                      onChange={(e) => setEditData((prev) => ({ ...prev, email: e.target.value }))}
                      placeholder="Email"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-country" className="text-sm font-medium text-gray-700 mb-1 block">
                      Country
                    </Label>
                    <Input
                      id="edit-country"
                      value={editData.country}
                      onChange={(e) => setEditData((prev) => ({ ...prev, country: e.target.value }))}
                      placeholder="Country"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium">{activeUser.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Location</p>
                        <p className="font-medium">{activeUser.country}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card>
            <CardContent className="p-6">
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Account Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Join Date</p>
                      <p className="font-medium">{activeUser.joinDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Last Login</p>
                      <p className="font-medium">{activeUser.lastLogin}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Music className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Total Releases</p>
                      <p className="font-medium">{activeUser.releases}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Total Earnings</p>
                      <p className="font-medium">${activeUser.totalEarnings.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-4 border-t">
            <Button variant="outline" size="sm">
              <Mail className="w-4 h-4 mr-2" />
              Send Email
            </Button>

            <div className="ml-auto flex gap-3">
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={handleCancel} disabled={updateDetailsMutation.isPending}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={updateDetailsMutation.isPending}>
                    {updateDetailsMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </>
              ) : (
                <Button onClick={onClose}>
                  Close
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailsModal;
