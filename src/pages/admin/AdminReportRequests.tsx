import { ChangeEvent, useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Download, Upload, Check, Clock, FileText, Calendar, User, Mail } from "lucide-react";
import { toast } from "sonner";
import AdminPageLayout from "@/components/admin/AdminPageLayout";
import {
  useAdminReportRequests,
  useUpdateAdminReportRequestStatus,
  useUploadAdminReportRequestFile,
} from "@/hooks/useAdminReportRequests";
import { AdminReportRequestStatus } from "@/types/admin";

const AdminReportRequests = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPeriod, setFilterPeriod] = useState("all");
  const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});
  const { data: reportRequests = [] } = useAdminReportRequests();
  const updateStatusMutation = useUpdateAdminReportRequestStatus();
  const uploadReportMutation = useUploadAdminReportRequestFile();

  const filteredRequests = reportRequests.filter(request => {
    const matchesSearch = 
      request.artistName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.artistEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.reportPeriod.includes(searchQuery);
    
    const matchesStatus = filterStatus === "all" || request.status.toLowerCase() === filterStatus;
    const matchesPeriod = filterPeriod === "all" || request.reportPeriod === filterPeriod;
    
    return matchesSearch && matchesStatus && matchesPeriod;
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'downloaded':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'processing':
        return <FileText className="w-4 h-4" />;
      case 'ready':
        return <Check className="w-4 h-4" />;
      case 'downloaded':
        return <Download className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const handleFileUpload = async (requestId: number, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast.error("Please upload a CSV file");
      return;
    }

    try {
      await uploadReportMutation.mutateAsync({ requestId, fileName: file.name });
      const request = reportRequests.find((item) => item.id === requestId);
      toast.success(`Report uploaded successfully for ${request?.artistName || "artist"}`);
    } catch (error) {
      toast.error("Failed to upload report file");
    } finally {
      // Clear the file input
      if (fileInputRefs.current[requestId]) {
        fileInputRefs.current[requestId]!.value = '';
      }
    }
  };

  const handleStatusUpdate = async (requestId: number, newStatus: AdminReportRequestStatus) => {
    try {
      await updateStatusMutation.mutateAsync({ requestId, status: newStatus });
      const request = reportRequests.find((item) => item.id === requestId);
      toast.success(`Status updated to ${newStatus} for ${request?.artistName || "artist"}`);
    } catch {
      toast.error("Failed to update report request status");
    }
  };

  const downloadTemplate = () => {
    // Create a sample CSV template for earnings report
    const csvContent = `Period,Track_Title,ISRC,Streams,Downloads,Revenue,Platform,Country
2024-02,Summer Vibes,USRC17607839,15420,234,25.67,Spotify,US
2024-02,Summer Vibes,USRC17607839,8932,156,18.45,Apple Music,US
2024-02,Summer Vibes,USRC17607839,5678,89,12.34,YouTube Music,US
2024-02,Midnight Dreams,USRC17607840,12456,178,22.89,Spotify,UK
2024-02,Midnight Dreams,USRC17607840,7834,123,16.78,Apple Music,UK`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'earnings_report_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success("Downloaded earnings report template");
  };

  const exportRequests = () => {
    const headers = ['ID', 'Artist', 'Email', 'Period', 'Request Date', 'Status', 'Earnings', 'Tracks'];
    const csvContent = [
      headers.join(','),
      ...filteredRequests.map(request => [
        request.id,
        `"${request.artistName}"`,
        request.artistEmail,
        request.reportPeriod,
        request.requestDate,
        request.status,
        request.totalEarnings,
        request.trackCount
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report_requests_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success(`Exported ${filteredRequests.length} report requests`);
  };

  // Get unique periods for filter
  const uniquePeriods = [...new Set(reportRequests.map(r => r.reportPeriod))].sort().reverse();

  return (
    <AdminPageLayout title="Royalty Report Requests" subtitle="Manage user requests for monthly earnings reports">

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Requests</p>
                  <p className="text-2xl font-bold text-gray-900">{filteredRequests.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
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
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Processing</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {filteredRequests.filter(r => r.status === 'Processing').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ready</p>
                  <p className="text-2xl font-bold text-green-600">
                    {filteredRequests.filter(r => r.status === 'Ready').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Check className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Downloaded</p>
                  <p className="text-2xl font-bold text-gray-600">
                    {filteredRequests.filter(r => r.status === 'Downloaded').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Download className="w-6 h-6 text-gray-600" />
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
                    placeholder="Search by artist, email, or period..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  aria-label="Filter report requests by status"
                  title="Filter report requests by status"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-onerpm-orange focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="ready">Ready</option>
                  <option value="downloaded">Downloaded</option>
                </select>
                <select
                  value={filterPeriod}
                  onChange={(e) => setFilterPeriod(e.target.value)}
                  aria-label="Filter report requests by period"
                  title="Filter report requests by period"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-onerpm-orange focus:border-transparent"
                >
                  <option value="all">All Periods</option>
                  {uniquePeriods.map(period => (
                    <option key={period} value={period}>{period}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={downloadTemplate}>
                  <Download className="w-4 h-4 mr-2" />
                  Template
                </Button>
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
                      Report Period
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Request Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Earnings
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Downloads
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
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-onerpm-orange/10 rounded-full flex items-center justify-center mr-3">
                            <User className="w-5 h-5 text-onerpm-orange" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{request.artistName}</div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Mail className="w-3 h-3 mr-1" />
                              {request.artistEmail}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{request.reportPeriod}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {request.requestDate}
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">${request.totalEarnings.toFixed(2)}</div>
                        <div className="text-xs text-gray-500">{request.reportType}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{request.downloadCount} times</div>
                        {request.uploadedFile && (
                          <div className="text-xs text-gray-500 font-mono">{request.uploadedFile}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {(request.status === 'Pending' || request.status === 'Processing') && (
                            <>
                              <input
                                ref={el => fileInputRefs.current[request.id] = el}
                                type="file"
                                accept=".csv"
                                onChange={(e) => handleFileUpload(request.id, e)}
                                aria-label={`Upload earnings report CSV for ${request.artistName}`}
                                title={`Upload earnings report CSV for ${request.artistName}`}
                                className="hidden"
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => fileInputRefs.current[request.id]?.click()}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                title="Upload Report"
                              >
                                <Upload className="w-4 h-4" />
                              </Button>
                              <select
                                value={request.status}
                                onChange={(e) =>
                                  handleStatusUpdate(request.id, e.target.value as AdminReportRequestStatus)
                                }
                                aria-label={`Update report request status for ${request.artistName}`}
                                title={`Update report request status for ${request.artistName}`}
                                className="text-xs border border-gray-300 rounded px-2 py-1"
                              >
                                <option value="Pending">Pending</option>
                                <option value="Processing">Processing</option>
                                <option value="Ready">Ready</option>
                              </select>
                            </>
                          )}
                          
                          {request.status === 'Ready' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStatusUpdate(request.id, 'Downloaded')}
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              title="Mark as Downloaded"
                            >
                              <Check className="w-4 h-4" />
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Processing Instructions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Workflow:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
                  <li>Users request monthly earnings reports from their dashboard</li>
                  <li>Requests appear here with "Pending" status</li>
                  <li>Update status to "Processing" when generating the report</li>
                  <li>Upload the CSV file when ready</li>
                  <li>Status automatically changes to "Ready" after upload</li>
                  <li>Users can download from their dashboard</li>
                  <li>Mark as "Downloaded" when artist accesses the file</li>
                </ol>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">CSV Format Requirements:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  <li>Include Period, Track_Title, ISRC, Streams, Downloads, Revenue</li>
                  <li>Add Platform and Country columns for detailed breakdown</li>
                  <li>Use consistent date format (YYYY-MM)</li>
                  <li>Include all revenue streams for the requested period</li>
                  <li>File naming: username_period_earnings.csv</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
    </AdminPageLayout>
  );
};

export default AdminReportRequests;