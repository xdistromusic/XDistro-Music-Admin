import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Download, Eye, Trash2, Mail, MapPin } from "lucide-react";
import { toast } from "@/lib/toast";
import AdminPageLayout from "@/components/admin/AdminPageLayout";
import AdminPageLoader from "@/components/admin/AdminPageLoader";
import ActionConfirmationModal from "@/components/admin/ActionConfirmationModal";
import UserDetailsModal from "@/components/admin/UserDetailsModal";
import { AdminUserListItem, SubscriptionPlanName } from "@/types/admin";
import {
  useAdminUsers,
  useDeleteAdminUser,
  useUpdateAdminUserPlan,
  useUpdateAdminUserStatus,
} from "@/hooks/useAdminUsers";

const PLAN_OPTIONS: Array<"all" | SubscriptionPlanName> = ["all", "Non Subscriber", "Artist", "Pro", "Label"];

const AdminUsers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPlan, setFilterPlan] = useState<"all" | SubscriptionPlanName>("all");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<AdminUserListItem | null>(null);

  const { data: users = [], isLoading } = useAdminUsers();
  const deleteUserMutation = useDeleteAdminUser();
  const updatePlanMutation = useUpdateAdminUserPlan();
  const updateStatusMutation = useUpdateAdminUserStatus();

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPlan = filterPlan === "all" || user.plan === filterPlan;
    
    return matchesSearch && matchesPlan;
  });

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

  const handleDeleteUser = (user: AdminUserListItem) => {
    setUserToDelete(user);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) {
      return;
    }

    await deleteUserMutation.mutateAsync(userToDelete.id);
    toast.success(`User ${userToDelete.firstName} ${userToDelete.lastName} has been deleted`);
    setUserToDelete(null);
  };

  const handleStatusChange = async (userId: number, newStatus: string) => {
    await updateStatusMutation.mutateAsync({ userId, status: newStatus });
    
    const user = users.find(u => u.id === userId);
    if (user) {
      toast.success(`${user.firstName} ${user.lastName}'s status updated to ${newStatus}`);
    }
  }; 

  const handlePlanChange = async (userId: number, newPlan: SubscriptionPlanName) => {
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

  return (
    <AdminPageLayout title="Users Management" subtitle="Manage all registered user accounts">
      {isLoading && <AdminPageLoader message="Loading users..." />}

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
                  Export ({filteredUsers.length})
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-400px)]">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Country
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Activity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Earnings
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm text-gray-500">ID: {user.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center">
                          <Mail className="w-4 h-4 mr-2 text-gray-400" />
                          {user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center">
                          <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                          {user.country}
                        </div>
                        <div className="text-sm text-gray-500">Joined: {user.joinDate}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={user.plan}
                          onChange={(e) => void handlePlanChange(user.id, e.target.value as SubscriptionPlanName)}
                          aria-label={`Change subscription plan for ${user.firstName} ${user.lastName}`}
                          title={`Change subscription plan for ${user.firstName} ${user.lastName}`}
                          className={`text-xs border-0 rounded px-2 py-1 font-medium ${getPlanColor(user.plan)}`}
                        >
                          <option value="Non Subscriber">Non Subscriber</option>
                          <option value="Artist">Artist</option>
                          <option value="Pro">Pro</option>
                          <option value="Label">Label</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>{user.releases} releases</div>
                        <div className="text-xs text-gray-500">Last: {user.lastLogin}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="font-medium">${user.totalEarnings.toFixed(2)}</div>
                        <div className="text-xs text-gray-500">Total earned</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
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
                            onClick={() => void handleDeleteUser(user)}
                            title="Delete User"
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
        <div className="mt-6 grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{filteredUsers.length}</div>
              <div className="text-sm text-gray-600">Total Users</div>
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
        open={!!userToDelete}
        onOpenChange={(open) => {
          if (!open) {
            setUserToDelete(null);
          }
        }}
        title="Delete User"
        description={
          userToDelete
            ? `Are you sure you want to delete ${userToDelete.firstName} ${userToDelete.lastName}? This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        onConfirm={confirmDeleteUser}
        isConfirming={deleteUserMutation.isPending}
      />
    </AdminPageLayout>
  );
};

export default AdminUsers;