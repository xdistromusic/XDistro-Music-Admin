import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Download, Eye, Mail, MapPin, ChevronLeft, ChevronRight, Ban } from "lucide-react";
import { toast } from "@/lib/toast";
import AdminPageLayout from "@/components/admin/AdminPageLayout";
import AdminPageLoader from "@/components/admin/AdminPageLoader";
import ActionConfirmationModal from "@/components/admin/ActionConfirmationModal";
import UserDetailsModal from "@/components/admin/UserDetailsModal";
import { AdminEntityId, AdminUserListItem, SubscriptionPlanName } from "@/types/admin";
import {
  useAdminUsersPage,
  useSuspendAdminUser,
  useUpdateAdminUserPlan,
  useUpdateAdminUserStatus,
} from "@/hooks/useAdminUsers";

const PLAN_OPTIONS: Array<"all" | SubscriptionPlanName> = ["all", "Non Subscriber", "Artist", "Pro", "Label"];
const PAGE_SIZE = 50;

const formatShortUserId = (id: string) => {
  if (!id) {
    return "";
  }

  return id.length <= 6 ? id : `${id.slice(0, 6)}...`;
};

const formatShortEmail = (email: string) => {
  if (!email) {
    return "";
  }

  return email.length <= 26 ? email : `${email.slice(0, 26)}...`;
};

const AdminUsers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [filterPlan, setFilterPlan] = useState<"all" | SubscriptionPlanName>("all");
  const [page, setPage] = useState(1);
  const [selectedUserId, setSelectedUserId] = useState<AdminEntityId | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToSuspend, setUserToSuspend] = useState<AdminUserListItem | null>(null);
  const [suspensionReason, setSuspensionReason] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
    }, 500);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearchQuery, filterPlan]);

  const { data: usersPage, isLoading, isFetching } = useAdminUsersPage(
    page,
    PAGE_SIZE,
    debouncedSearchQuery,
    filterPlan
  );
  const users = usersPage?.items ?? [];
  const totalUsers = usersPage?.total ?? 0;
  const totalPages = usersPage?.totalPages ?? 1;
  const suspendUserMutation = useSuspendAdminUser();
  const updatePlanMutation = useUpdateAdminUserPlan();
  const updateStatusMutation = useUpdateAdminUserStatus();

  const filteredUsers = users;

  const getPlanColor = (plan: SubscriptionPlanName) => {
    switch (plan) {
      case 'Non Subscriber':
        return 'bg-gray-100 text-gray-800';
      case 'Artist':
        return 'bg-blue-100 text-blue-800';
      case 'Pro':
        return 'bg-purple-100 text-purple-800';
      case 'Label':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewUser = (user: AdminUserListItem) => {
    setSelectedUserId(user.id);
    setIsModalOpen(true);
  };

  const handleSuspendUser = (user: AdminUserListItem) => {
    setUserToSuspend(user);
    setSuspensionReason("");
  };

  const confirmSuspendUser = async () => {
    if (!userToSuspend || !suspensionReason.trim()) {
      toast.error("Please provide a suspension reason");
      return;
    }

    await suspendUserMutation.mutateAsync({
      userId: userToSuspend.id,
      reason: suspensionReason,
    });
    toast.success(`User ${userToSuspend.firstName} ${userToSuspend.lastName} has been suspended`);
    setUserToSuspend(null);
    setSuspensionReason("");
  };

  const handleStatusChange = async (userId: AdminEntityId, newStatus: string) => {
    await updateStatusMutation.mutateAsync({ userId, status: newStatus });
    
    const user = users.find(u => u.id === userId);
    if (user) {
      toast.success(`${user.firstName} ${user.lastName}'s status updated to ${newStatus}`);
    }
  }; 

  const handlePlanChange = async (userId: AdminEntityId, newPlan: SubscriptionPlanName) => {
    await updatePlanMutation.mutateAsync({ userId, plan: newPlan });
    
    const user = users.find(u => u.id === userId);
    if (user) {
      toast.success(`${user.firstName} ${user.lastName}'s plan updated to ${newPlan}`);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUserId(null);
  };

  const selectedUser = users.find((user) => user.id === selectedUserId) || null;

  const exportUsers = () => {
    // Create CSV content
    const headers = ['ID', 'Name', 'Email', 'Country', 'Plan', 'Status', 'Join Date', 'Releases', 'Earnings'];
    const csvContent = [
      headers.join(','),
      ...filteredUsers.map(user => [
        user.id,
        `"${user.firstName} ${user.lastName}"`,
        user.email,
        user.country,
        user.plan,
        user.joinDate,
        user.releases,
        user.totalEarnings
      ].join(','))
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success(`Exported ${filteredUsers.length} users to CSV`);
  };
  
  if (isLoading) {
    return (
      <AdminPageLayout title="Users Management" subtitle="Manage all registered user accounts">
        <AdminPageLoader message="Loading users..." />
      </AdminPageLayout>
    );
  }

  return (
    <AdminPageLayout title="Users Management" subtitle="Manage all registered user accounts">
        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search users by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={filterPlan}
                  onChange={(e) => setFilterPlan(e.target.value as "all" | SubscriptionPlanName)}
                  aria-label="Filter users by subscription plan"
                  title="Filter users by subscription plan"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-onerpm-orange focus:border-transparent"
                >
                  {PLAN_OPTIONS.map((plan) => (
                    <option key={plan} value={plan}>
                      {plan === "all" ? "All Users" : plan}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={exportUsers}>
                  <Download className="w-4 h-4 mr-2" />
                  Export (Page {users.length})
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardContent className="p-0">
            {isFetching && !searchQuery ? (
              <div className="px-3 py-2 text-xs text-gray-500 border-b border-gray-100">Refreshing page...</div>
            ) : null}
            <div className="overflow-y-auto md:overflow-x-visible overflow-x-auto max-h-[calc(100vh-400px)]">
              <table className="w-full table-fixed">
                <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                  <tr>
                    <th className="w-[22%] px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="w-[26%] px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="w-[16%] px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Country
                    </th>
                    <th className="w-[14%] px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="w-[10%] px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Activity
                    </th>
                    <th className="w-[7%] px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Earnings
                    </th>
                    <th className="w-[3%] px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-2 py-12 text-center text-sm text-gray-500">
                        No users found.
                      </td>
                    </tr>
                  ) : filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-2 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate" title={`${user.firstName} ${user.lastName}`}>
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-xs text-gray-500" title={user.id}>ID: {formatShortUserId(user.id)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center min-w-0">
                          <Mail className="w-4 h-4 mr-1 text-gray-400 shrink-0" />
                          <span className="truncate" title={user.email}>{formatShortEmail(user.email)}</span>
                        </div>
                      </td>
                      <td className="px-2 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center">
                          <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                          {user.country}
                        </div>
                        <div className="text-xs text-gray-500 truncate" title={`Joined: ${user.joinDate}`}>{user.joinDate}</div>
                      </td>
                      <td className="px-2 py-3 whitespace-nowrap">
                        <select
                          value={user.plan}
                          onChange={(e) => void handlePlanChange(user.id, e.target.value as SubscriptionPlanName)}
                          aria-label={`Change subscription plan for ${user.firstName} ${user.lastName}`}
                          title={`Change subscription plan for ${user.firstName} ${user.lastName}`}
                          className={`w-full max-w-[8.75rem] text-xs border-0 rounded px-2 py-1 font-medium ${getPlanColor(user.plan)}`}
                        >
                          <option value="Non Subscriber">Non Sub</option>
                          <option value="Artist">Artist</option>
                          <option value="Pro">Pro</option>
                          <option value="Label">Label</option>
                        </select>
                      </td>
                      <td className="px-2 py-3 whitespace-nowrap text-sm text-gray-900">
                        <div>{user.releases} releases</div>
                        <div className="text-xs text-gray-500 truncate" title={`Last login: ${user.lastLogin}`}>{user.lastLogin}</div>
                      </td>
                      <td className="px-2 py-3 whitespace-nowrap text-sm text-gray-900">
                        <div className="font-medium">${user.totalEarnings.toFixed(2)}</div>
                      </td>
                      <td className="px-2 py-3 whitespace-nowrap text-sm font-medium">
                        <div className="flex justify-start">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewUser(user)}
                            title="View Details"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => void handleSuspendUser(user)}
                            title="Suspend User Account"
                            className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                          >
                            <Ban className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-3 py-3 border-t border-gray-100">
              <div className="text-sm text-gray-600">
                Page {page} of {totalPages} • {totalUsers} total users
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page <= 1 || isLoading}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={page >= totalPages || isLoading}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{filteredUsers.length}</div>
              <div className="text-sm text-gray-600">Users On Page</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{totalUsers}</div>
              <div className="text-sm text-gray-600">All Users</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-600">
                {filteredUsers.filter(u => u.plan === 'Non Subscriber').length}
              </div>
              <div className="text-sm text-gray-600">Non Subscribers</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {filteredUsers.filter(u => u.plan === 'Artist').length}
              </div>
              <div className="text-sm text-gray-600">Artist Users</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {filteredUsers.filter(u => u.plan === 'Pro').length}
              </div>
              <div className="text-sm text-gray-600">Pro Users</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {filteredUsers.filter(u => u.plan === 'Label').length}
              </div>
              <div className="text-sm text-gray-600">Label Users</div>
            </CardContent>
          </Card>
        </div>

      {/* User Details Modal */}
      <UserDetailsModal
        user={selectedUser}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onStatusUpdate={(userId, newStatus) => void handleStatusChange(userId, newStatus)}
      />

      <ActionConfirmationModal
        open={!!userToSuspend}
        onOpenChange={(open) => {
          if (!open) {
            setUserToSuspend(null);
            setSuspensionReason("");
          }
        }}
        title="Suspend User Account"
        description={
          userToSuspend
            ? `Suspend ${userToSuspend.firstName} ${userToSuspend.lastName}? They will be unable to log in and their account will be restricted.`
            : ""
        }
        confirmLabel="Suspend"
        onConfirm={confirmSuspendUser}
        isConfirming={suspendUserMutation.isPending}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Suspension Reason *
            </label>
            <textarea
              value={suspensionReason}
              onChange={(e) => setSuspensionReason(e.target.value)}
              placeholder="Enter the reason for suspending this account (required)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-onerpm-orange focus:border-transparent"
              rows={3}
              disabled={suspendUserMutation.isPending}
            />
            {!suspensionReason.trim() && (
              <p className="mt-1 text-xs text-red-600">Suspension reason is required</p>
            )}
          </div>
        </div>
      </ActionConfirmationModal>
    </AdminPageLayout>
  );
};

export default AdminUsers;