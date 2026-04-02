import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Check, AlertTriangle, Calendar, Mail, Clock } from "lucide-react";
import { toast } from "sonner";
import AdminPageLayout from "@/components/admin/AdminPageLayout";
import AdminPageLoader from "@/components/admin/AdminPageLoader";
import {
  useAdminTakedownRequests,
  useUpdateAdminTakedownRequestStatus,
} from "@/hooks/useAdminTakedownRequests";
import { AdminEntityId, AdminTakedownRequestStatus } from "@/types/admin";

const AdminTakedownRequests = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const { data: takedownRequests = [], isLoading } = useAdminTakedownRequests();
  const updateStatusMutation = useUpdateAdminTakedownRequestStatus();

  const filteredRequests = takedownRequests.filter(request => {
    const matchesSearch = 
      request.artistName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.artistEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.releaseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.releaseId.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || request.status.toLowerCase().replace(' ', '-') === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'completed':
        return <Check className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const handleStatusUpdate = async (requestId: AdminEntityId, newStatus: AdminTakedownRequestStatus) => {
    try {
      await updateStatusMutation.mutateAsync({ requestId, status: newStatus });
      const request = takedownRequests.find((item) => item.id === requestId);
      toast.success(`Takedown request for "${request?.releaseTitle}" updated to ${newStatus}`);
    } catch {
      toast.error("Failed to update takedown request status");
    }
  };

  if (isLoading) {
    return (
      <AdminPageLayout title="Takedown Requests" subtitle="Manage user requests to remove releases from distribution platforms">
        <AdminPageLoader message="Loading takedown requests..." />
      </AdminPageLayout>
    );
  }

  return (
    <AdminPageLayout title="Takedown Requests" subtitle="Manage user requests to remove releases from distribution platforms">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Requests</p>
                  <p className="text-2xl font-bold text-gray-900">{filteredRequests.length}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {filteredRequests.filter(r => r.status === 'Pending').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>          
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by artist, release, or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  aria-label="Filter takedown requests by status"
                  title="Filter takedown requests by status"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-onerpm-orange focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Requests Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-400px)]">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Request Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Release Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRequests.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-500">
                        No takedown requests found.
                      </td>
                    </tr>
                  ) : filteredRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{request.artistName}</div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Mail className="w-3 h-3 mr-1" />
                              {request.artistEmail}
                            </div>
                            <div className="text-xs text-gray-400 flex items-center mt-1">
                              <Calendar className="w-3 h-3 mr-1" />
                              {request.requestDate}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{request.releaseTitle}</div>
                          <div className="text-xs text-gray-500">ID: {request.releaseId}</div>
                          <div className="text-xs text-gray-500 mt-1"> 
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(request.status)}>
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(request.status)}
                              <span>{request.status}</span>
                            </div>
                          </Badge>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {request.status === 'Pending' && (
                            <>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                onClick={() => handleStatusUpdate(request.id, 'Completed')}
                                title="Mark as Completed"
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Request Details Expandable Section */}
        <Card className="mt-6">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Takedown Request Workflow</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Process Steps:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
                  <li>User submits takedown request from their dashboard</li>
                  <li>Request appears here with "Pending" status</li>
                  <li>Review request details and mark as "Completed" when takedown is issued</li>
                  <li>Mark release as 'Deleted' on Releases Management section</li>
                </ol>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Common Reasons for Takedown:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  <li><strong>Copyright Dispute:</strong> Ownership conflicts with labels/publishers</li>
                  <li><strong>Legal Issues:</strong> Cease and desist letters, legal threats</li>
                  <li><strong>Contract Disputes:</strong> Management or label contract conflicts</li>
                  <li><strong>Sample Clearance:</strong> Uncleared samples discovered</li>
                  <li><strong>Personal Request:</strong> Artist rebranding or quality concerns</li>
                  <li><strong>Quality Issues:</strong> Technical problems with audio/metadata</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
    </AdminPageLayout>
  );
};

export default AdminTakedownRequests;