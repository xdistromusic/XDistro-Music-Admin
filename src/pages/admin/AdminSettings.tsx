import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Settings, Save, RefreshCw, Shield, Mail, DollarSign, Globe, Database, Bell, Users, FileText, Lock, Eye, EyeOff, CircleAlert as AlertCircle, Check, X, Upload, Download, UserPlus, Pencil, Trash2, Crown, User as UserIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import AdminNavbar from "@/components/admin/AdminNavbar";
import AdminFooter from "@/components/admin/AdminFooter";
import StaffMemberFormModal from "@/components/admin/StaffMemberFormModal";
import ActionConfirmationModal from "@/components/admin/ActionConfirmationModal";
import { useAuth } from "@/hooks/useAuth";
import { useAdminStaff, useCreateStaff, useUpdateStaff, useDeleteStaff } from "@/hooks/useAdminStaff";
import { StaffMember, CreateStaffInput } from "@/types/admin";

type StaffMemberFormData = CreateStaffInput;

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState("user");
  const [isLoading, setIsLoading] = useState(false);
  const [showApiKeys, setShowApiKeys] = useState(false);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedStaffMember, setSelectedStaffMember] = useState<StaffMember | null>(null);
  const [staffMemberToRemove, setStaffMemberToRemove] = useState<StaffMember | null>(null);
  const { user } = useAuth();

  // Staff management via backend
  const { data: staffMembers = [], isLoading: isLoadingStaff } = useAdminStaff();
  const createStaff = useCreateStaff();
  const updateStaff = useUpdateStaff();
  const deleteStaff = useDeleteStaff();

  // User profile form state
  const [userProfile, setUserProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editProfileDraft, setEditProfileDraft] = useState({ name: user?.name || '' });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);



  // Mock settings data
  const [settings, setSettings] = useState({
    general: {
      maintenanceMode: false,
      registrationEnabled: true,
      emailVerificationRequired: true
    },
    payments: {
      paypalEnabled: true,
      bankTransferEnabled: true,
      stripeEnabled: false
    },
    distribution: {
      autoDistribution: true,
      distributionDelay: 24,
      qualityCheckRequired: true,
      metadataValidation: true,
      coverArtRequired: true,
      maxFileSize: 100,
      supportedFormats: ["MP3", "WAV", "FLAC"],
      defaultRoyaltyRate: 85
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      adminAlerts: true,
      paymentNotifications: true,
    },
    security: {
      twoFactorRequired: false,
      passwordRequireSpecial: true,
      encryptionEnabled: true
    },
    integrations: {
      spotifyApiKey: "sk_live_••••••••••••••••",
      appleMusicApiKey: "am_live_••••••••••••••••",
      youtubeApiKey: "yt_live_••••••••••••••••",
      amazonMusicApiKey: "amz_live_••••••••••••••••",
      webhookUrl: "https://api.xdistromusic.com/webhooks",
      analyticsEnabled: true,
      backupEnabled: true,
      cdnEnabled: true
    }
  });

  const handleSettingChange = (key: string, value: unknown) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    toast.success("Setting updated successfully");
  };

  const handleAddStaffMember = () => {
    setModalMode('add');
    setSelectedStaffMember(null);
    setIsStaffModalOpen(true);
  };

  const handleEditStaffMember = (member: StaffMember) => {
    setModalMode('edit');
    setSelectedStaffMember(member);
    setIsStaffModalOpen(true);
  };

  const handleRemoveStaffMember = (member: StaffMember) => {
    setStaffMemberToRemove(member);
  };

  const confirmRemoveStaffMember = () => {
    if (!staffMemberToRemove) {
      return;
    }

    deleteStaff.mutate(staffMemberToRemove.id, {
      onSuccess: () => {
        toast.success(`${staffMemberToRemove.name} has been removed from staff`);
        setStaffMemberToRemove(null);
      },
      onError: (error) => {
        toast.error(error instanceof Error ? error.message : "Failed to remove staff member");
        setStaffMemberToRemove(null);
      },
    });
  };

  const handleSaveStaffMember = (formData: StaffMemberFormData) => {
    if (modalMode === 'add') {
      createStaff.mutate(formData, {
        onSuccess: () => toast.success("Staff member added successfully"),
        onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to add staff member"),
      });
    } else if (selectedStaffMember) {
      updateStaff.mutate({ id: selectedStaffMember.id, updates: formData }, {
        onSuccess: () => toast.success("Staff member updated successfully"),
        onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to update staff member"),
      });
    }
  };

  const handleCloseModal = () => {
    setIsStaffModalOpen(false);
    setSelectedStaffMember(null);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-purple-100 text-purple-800';
      case 'admin':       return 'bg-blue-100 text-blue-800';
      case 'manager':     return 'bg-green-100 text-green-800';
      case 'support_agent': return 'bg-orange-100 text-orange-800';
      case 'content_reviewer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatRole = (role: string) =>
    role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  const getStatusColor = (status: string) => {
    return status === 'active'
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';
  };

  const formatPermissions = (permissions: string[]) => {
    return permissions.map(permission => (
      <Badge key={permission} variant="outline" className="text-xs">
        {permission}
      </Badge>
    ));
  };
  
  const handleSaveSettings = async (category: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success(`${category.charAt(0).toUpperCase() + category.slice(1)} settings saved successfully`);
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async (service: string) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success(`${service} connection test successful`);
    } catch (error) {
      toast.error(`${service} connection test failed`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!editProfileDraft.name.trim()) {
      toast.error("Name is required");
      return;
    }

    setIsUpdatingProfile(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setUserProfile(prev => ({ ...prev, name: editProfileDraft.name }));
      setIsEditingProfile(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleCancelEditProfile = () => {
    setEditProfileDraft({ name: userProfile.name });
    setIsEditingProfile(false);
  };

  const handleChangePassword = async () => {
    if (!userProfile.currentPassword) {
      toast.error("Current password is required");
      return;
    }

    if (!userProfile.newPassword) {
      toast.error("New password is required");
      return;
    }

    if (userProfile.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long");
      return;
    }

    if (userProfile.newPassword !== userProfile.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (userProfile.currentPassword === userProfile.newPassword) {
      toast.error("New password must be different from current password");
      return;
    }

    setIsChangingPassword(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Clear password fields
      setUserProfile(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      
      toast.success("Password changed successfully");
    } catch (error) {
      toast.error("Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const tabs = [
    { id: "user", label: "User Profile", icon: UserIcon },
    { id: "integrations", label: "Integrations", icon: Database },
    { id: "staff-access", label: "Staff Access", icon: Users }
  ];

  const renderIntegrationsSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center justify-between">
            API Keys & Integrations
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowApiKeys(!showApiKeys)}
            >
              {showApiKeys ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showApiKeys ? "Hide" : "Show"} Keys
            </Button>
          </h3>
          <div className="space-y-4">
            {[
              { name: "Spotify", key: "spotifyApiKey", status: "connected" },
              { name: "Apple Music", key: "appleMusicApiKey", status: "connected" },
              { name: "YouTube Music", key: "youtubeApiKey", status: "connected" },
              { name: "Amazon Music", key: "amazonMusicApiKey", status: "disconnected" }
            ].map((integration: { name: string; key: "spotifyApiKey" | "appleMusicApiKey" | "youtubeApiKey" | "amazonMusicApiKey"; status: string }) => (
              <div key={integration.name} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Globe className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">{integration.name}</h4>
                    <div className="flex items-center space-x-2">
                      <Input
                        type={showApiKeys ? "text" : "password"}
                        value={settings.integrations[integration.key]}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          integrations: { ...prev.integrations, [integration.key]: e.target.value }
                        }))}
                        className="text-xs font-mono w-64"
                        placeholder="Enter API key..."
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={integration.status === 'connected' ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                    {integration.status === 'connected' ? <Check className="w-3 h-3 mr-1" /> : <X className="w-3 h-3 mr-1" />}
                    {integration.status}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTestConnection(integration.name)}
                    disabled={isLoading}
                  >
                    {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Test"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">System Integrations</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Analytics Tracking</h4>
                <p className="text-sm text-gray-600">Enable user behavior analytics</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.integrations.analyticsEnabled}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    integrations: { ...prev.integrations, analyticsEnabled: e.target.checked }
                  }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-onerpm-orange/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-onerpm-orange"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Automated Backups</h4>
                <p className="text-sm text-gray-600">Daily automated system backups</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.integrations.backupEnabled}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    integrations: { ...prev.integrations, backupEnabled: e.target.checked }
                  }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-onerpm-orange/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-onerpm-orange"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">CDN Acceleration</h4>
                <p className="text-sm text-gray-600">Content delivery network for faster loading</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.integrations.cdnEnabled}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    integrations: { ...prev.integrations, cdnEnabled: e.target.checked }
                  }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-onerpm-orange/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-onerpm-orange"></div>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderStaffAccessSettings = () => (
    <div className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold">Staff Members</h3>
                  <Button 
                    onClick={handleAddStaffMember}
                    className="bg-onerpm-orange hover:bg-onerpm-orange/90"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Staff Member
                  </Button>
                </div>

                {isLoadingStaff ? (
                  <div className="flex items-center justify-center py-12 text-gray-500">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Loading staff members...
                  </div>
                ) : (
                <div className="overflow-x-auto">
                  <table className="w-auto">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Staff Member
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Permissions
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Login
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {staffMembers.map((member) => (
                        <tr key={member.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-onerpm-orange/10 rounded-full flex items-center justify-center mr-3">
                                <Crown className="w-5 h-5 text-onerpm-orange" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{member.name}</div>
                                <div className="text-sm text-gray-500 flex items-center">
                                  <Mail className="w-3 h-3 mr-1" />
                                  {member.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className={getRoleColor(member.role)}>
                              {formatRole(member.role)}
                            </Badge>
                            <div className="text-xs text-gray-500 mt-1">
                              Since {member.createdAt}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                              {formatPermissions(member.permissions)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className={getStatusColor(member.status)}>
                              {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {member.lastLogin ?? "Never"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleEditStaffMember(member)}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                title="Edit Staff Member"
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              {member.role !== 'super_admin' && (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleRemoveStaffMember(member)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  title="Remove Staff Member"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                )}
              </CardContent>
            </Card>

      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Role Permissions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Super Admin</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-600 mr-2" />
                  Full system access
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-600 mr-2" />
                  Manage staff members
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-600 mr-2" />
                  System settings
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-600 mr-2" />
                  All user operations
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Manager</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-600 mr-2" />
                  User management
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-600 mr-2" />
                  Release management
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-600 mr-2" />
                  Royalty management
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-600 mr-2" />
                  Generate reports
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Support Agent</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-600 mr-2" />
                  View user accounts
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-600 mr-2" />
                  Generate user reports
                </li>
                <li className="flex items-center">
                  <X className="w-4 h-4 text-red-600 mr-2" />
                  Modify user data
                </li>
                <li className="flex items-center">
                  <X className="w-4 h-4 text-red-600 mr-2" />
                  Access financial data
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Content Reviewer</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-600 mr-2" />
                  Review releases
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-600 mr-2" />
                  Handle takedown requests
                </li>
                <li className="flex items-center">
                  <X className="w-4 h-4 text-red-600 mr-2" />
                  Access user data
                </li>
                <li className="flex items-center">
                  <X className="w-4 h-4 text-red-600 mr-2" />
                  Financial operations
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Access Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{staffMembers.length}</div>
              <div className="text-sm text-gray-600">Total Staff</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {staffMembers.filter((s) => s.status === 'active').length}
              </div>
              <div className="text-sm text-gray-600">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {staffMembers.filter((s) => s.status === 'inactive').length}
              </div>
              <div className="text-sm text-gray-600">Inactive</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {staffMembers.filter((s) => s.role === 'super_admin').length}
              </div>
              <div className="text-sm text-gray-600">Super Admins</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "user":
        return (
          <div className="space-y-6">
            {/* Profile Information */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <UserIcon className="w-5 h-5" />
                    Profile Information
                  </h3>
                  {!isEditingProfile && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditProfileDraft({ name: userProfile.name });
                        setIsEditingProfile(true);
                      }}
                    >
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  )}
                </div>

                {isEditingProfile ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-name">Full Name</Label>
                        <Input
                          id="edit-name"
                          type="text"
                          value={editProfileDraft.name}
                          onChange={(e) => setEditProfileDraft(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Enter your full name"
                          autoFocus
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email Address</Label>
                        <div className="flex items-center h-10 px-3 rounded-md border border-input bg-muted text-sm text-muted-foreground select-none">
                          {userProfile.email}
                        </div>
                        <p className="text-xs text-gray-400">Email address cannot be changed</p>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={handleCancelEditProfile} disabled={isUpdatingProfile}>
                        Cancel
                      </Button>
                      <Button
                        onClick={handleUpdateProfile}
                        disabled={isUpdatingProfile}
                        className="bg-onerpm-orange hover:bg-onerpm-orange/90"
                      >
                        {isUpdatingProfile ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Full Name</p>
                      <p className="text-gray-900">{userProfile.name || '—'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Email Address</p>
                      <p className="text-gray-900">{userProfile.email || '—'}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Change Password */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Change Password
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPasswords.current ? "text" : "password"}
                        value={userProfile.currentPassword}
                        onChange={(e) => setUserProfile(prev => ({ ...prev, currentPassword: e.target.value }))}
                        placeholder="Enter your current password"
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => togglePasswordVisibility('current')}
                      >
                        {showPasswords.current ? (
                          <EyeOff className="h-4 w-4 text-gray-500" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-500" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showPasswords.new ? "text" : "password"}
                          value={userProfile.newPassword}
                          onChange={(e) => setUserProfile(prev => ({ ...prev, newPassword: e.target.value }))}
                          placeholder="Enter new password"
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => togglePasswordVisibility('new')}
                        >
                          {showPasswords.new ? (
                            <EyeOff className="h-4 w-4 text-gray-500" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-500" />
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500">Must be at least 8 characters long</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showPasswords.confirm ? "text" : "password"}
                          value={userProfile.confirmPassword}
                          onChange={(e) => setUserProfile(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          placeholder="Confirm new password"
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => togglePasswordVisibility('confirm')}
                        >
                          {showPasswords.confirm ? (
                            <EyeOff className="h-4 w-4 text-gray-500" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-500" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      onClick={handleChangePassword}
                      disabled={isChangingPassword}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isChangingPassword ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Changing...
                        </>
                      ) : (
                        <>
                          <Shield className="w-4 h-4 mr-2" />
                          Change Password
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "integrations":
        return renderIntegrationsSettings();
      case "staff-access":
        return renderStaffAccessSettings();
      default:
        return (
          <div className="space-y-6">
            {/* Profile Information */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <UserIcon className="w-5 h-5" />
                    Profile Information
                  </h3>
                  {!isEditingProfile && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditProfileDraft({ name: userProfile.name });
                        setIsEditingProfile(true);
                      }}
                    >
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  )}
                </div>

                {isEditingProfile ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-name-default">Full Name</Label>
                        <Input
                          id="edit-name-default"
                          type="text"
                          value={editProfileDraft.name}
                          onChange={(e) => setEditProfileDraft(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Enter your full name"
                          autoFocus
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email Address</Label>
                        <div className="flex items-center h-10 px-3 rounded-md border border-input bg-muted text-sm text-muted-foreground select-none">
                          {userProfile.email}
                        </div>
                        <p className="text-xs text-gray-400">Email address cannot be changed</p>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={handleCancelEditProfile} disabled={isUpdatingProfile}>
                        Cancel
                      </Button>
                      <Button
                        onClick={handleUpdateProfile}
                        disabled={isUpdatingProfile}
                        className="bg-onerpm-orange hover:bg-onerpm-orange/90"
                      >
                        {isUpdatingProfile ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Full Name</p>
                      <p className="text-gray-900">{userProfile.name || '—'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Email Address</p>
                      <p className="text-gray-900">{userProfile.email || '—'}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Change Password */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Change Password
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPasswords.current ? "text" : "password"}
                        value={userProfile.currentPassword}
                        onChange={(e) => setUserProfile(prev => ({ ...prev, currentPassword: e.target.value }))}
                        placeholder="Enter your current password"
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => togglePasswordVisibility('current')}
                      >
                        {showPasswords.current ? (
                          <EyeOff className="h-4 w-4 text-gray-500" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-500" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showPasswords.new ? "text" : "password"}
                          value={userProfile.newPassword}
                          onChange={(e) => setUserProfile(prev => ({ ...prev, newPassword: e.target.value }))}
                          placeholder="Enter new password"
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => togglePasswordVisibility('new')}
                        >
                          {showPasswords.new ? (
                            <EyeOff className="h-4 w-4 text-gray-500" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-500" />
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500">Must be at least 8 characters long</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showPasswords.confirm ? "text" : "password"}
                          value={userProfile.confirmPassword}
                          onChange={(e) => setUserProfile(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          placeholder="Confirm new password"
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => togglePasswordVisibility('confirm')}
                        >
                          {showPasswords.confirm ? (
                            <EyeOff className="h-4 w-4 text-gray-500" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-500" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      onClick={handleChangePassword}
                      disabled={isChangingPassword}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isChangingPassword ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Changing...
                        </>
                      ) : (
                        <>
                          <Shield className="w-4 h-4 mr-2" />
                          Change Password
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AdminNavbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">System Settings</h1>
          <p className="text-gray-600">Platform settings and integrations</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Settings Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <Card>
              <CardContent className="p-4">
                <nav className="space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                          activeTab === tab.id
                            ? 'bg-onerpm-orange text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Settings Content */}
          <div className="flex-1 overflow-x-auto">
            {renderTabContent()}
            
            {/* Save Button */}
            <div className="mt-6 flex justify-end">
            </div> 
          </div>
        </div>
      </main>

      <AdminFooter />

      {/* Staff Member Modal */}
      <StaffMemberFormModal
        isOpen={isStaffModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSaveStaffMember}
        initialData={selectedStaffMember}
        mode={modalMode}
      />

      <ActionConfirmationModal
        open={!!staffMemberToRemove}
        onOpenChange={(open) => {
          if (!open) {
            setStaffMemberToRemove(null);
          }
        }}
        title="Remove Staff Member"
        description={
          staffMemberToRemove
            ? `Are you sure you want to remove ${staffMemberToRemove.name} from the staff? This action cannot be undone.`
            : ""
        }
        confirmLabel="Remove"
        onConfirm={confirmRemoveStaffMember}
      />
    </div>         
  );
};

export default AdminSettings;