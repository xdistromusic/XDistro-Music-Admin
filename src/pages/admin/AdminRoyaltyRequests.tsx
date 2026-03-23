import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Eye, Check, X, DollarSign } from "lucide-react";
import { toast } from "sonner";
import AdminPageLayout from "@/components/admin/AdminPageLayout";
import AdminPageLoader from "@/components/admin/AdminPageLoader";
import PaymentDetailsModal from "@/components/admin/PaymentDetailsModal";
import {
  useAdminRoyaltyRequests,
  useUpdateAdminRoyaltyRequestStatus,
} from "@/hooks/useAdminRoyaltyRequests";
import { AdminRoyaltyRequest, AdminRoyaltyRequestStatus } from "@/types/admin";

const AdminRoyaltyRequests = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState<AdminRoyaltyRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: requests = [], isLoading } = useAdminRoyaltyRequests();
  const updateStatusMutation = useUpdateAdminRoyaltyRequestStatus();

  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.artistName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.artistEmail.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterStatus === "all" || request.status.toLowerCase() === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'processed':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const updateRequestStatus = async (requestId: number, newStatus: AdminRoyaltyRequestStatus) => {
    try {
      await updateStatusMutation.mutateAsync({ requestId, status: newStatus });
      const request = requests.find((item) => item.id === requestId);
      if (request) {
        toast.success(`Royalty request for ${request.artistName} has been ${newStatus.toLowerCase()}`);
      }
    } catch {
      toast.error("Failed to update royalty request status");
    }
  };

  const handleViewDetails = (request: AdminRoyaltyRequest) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRequest(null);
  };

  const totalPendingAmount = filteredRequests
    .filter(r => r.status === 'Pending')
    .reduce((sum, r) => sum + r.amount, 0);

  if (isLoading) {
    return (
      <AdminPageLayout title="Royalty Withdrawal Requests" subtitle="Review and process royalty withdrawal requests">
        <AdminPageLoader message="Loading royalty requests..." />
      </AdminPageLayout>
    );
  }

  return (
    <AdminPageLayout title="Royalty Withdrawal Requests" subtitle="Review and process royalty withdrawal requests">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Requests</p>
                  <p className="text-2xl font-bold text-gray-900">{filteredRequests.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Amount</p>
                  <p className="text-2xl font-bold text-yellow-600">${totalPendingAmount.toFixed(2)}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {filteredRequests.filter(r => r.status === 'Pending').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Processed Today</p>
                  <p className="text-2xl font-bold text-green-600">
                    {filteredRequests.filter(r => r.status === 'Processed').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Check className="w-6 h-6 text-green-600" />
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
                    placeholder="Search by artist name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  aria-label="Filter withdrawal requests by status"
                  title="Filter withdrawal requests by status"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-onerpm-orange focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="processed">Processed</option>
                  <option value="rejected">Rejected</option>
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
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Request Date
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
                  {filteredRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{request.artistName}</div>
                          <div className="text-sm text-gray-500">{request.artistEmail}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">${request.amount.toFixed(2)}</div>
                        {request.amount < request.minimumThreshold && (
                          <div className="text-xs text-red-600">Below minimum threshold</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {request.requestDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getStatusColor(request.status)}>
                          {request.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            title="View Payment Details"
                            onClick={() => handleViewDetails(request)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {request.status === 'Pending' && (
                            <>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                onClick={() => updateRequestStatus(request.id, 'Approved')}
                                title="Approve"
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => updateRequestStatus(request.id, 'Rejected')}
                                title="Reject"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          {request.status === 'Approved' && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              onClick={() => updateRequestStatus(request.id, 'Processed')}
                              title="Mark as Processed"
                            >
                              <DollarSign className="w-4 h-4" />
                            </Button>
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

        {/* Instructions Card */}
        <Card className="mt-6">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Withdrawal Processing Instructions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Workflow:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
                  <li>Users request earnings withdrawal from their dashboard</li>
                  <li>Requests appear here with "Pending" status</li>
                  <li>Update status to "Approved" when payment method checks valid</li>
                  <li>Update status to "Processed" when payment has been processed and sent</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>

      {/* Payment Details Modal */}
      <PaymentDetailsModal
        request={selectedRequest}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onStatusUpdate={updateRequestStatus}
      />
    </AdminPageLayout>
  );
};

export default AdminRoyaltyRequests;