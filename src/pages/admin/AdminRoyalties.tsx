import { ChangeEvent, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, Download, FileText, Check, AlertCircle, DollarSign } from "lucide-react";
import { toast } from "sonner";
import AdminPageLayout from "@/components/admin/AdminPageLayout";
import AdminPageLoader from "@/components/admin/AdminPageLoader";
import {
  useAdminRoyaltyStats,
  useAdminRoyaltyUploadHistory,
  useUploadAdminRoyaltyFile,
} from "@/hooks/useAdminRoyalties";

const AdminRoyalties = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: royaltyStats, isLoading: isStatsLoading } = useAdminRoyaltyStats();
  const { data: uploadHistory = [], isLoading: isUploadHistoryLoading } = useAdminRoyaltyUploadHistory();
  const uploadRoyaltyFileMutation = useUploadAdminRoyaltyFile();
  const isProcessing = uploadRoyaltyFileMutation.isPending;
  const isLoading = isStatsLoading || isUploadHistoryLoading;

  const today = new Date();
  const defaultYear = String(today.getFullYear());
  const defaultMonth = String(today.getMonth() + 1).padStart(2, "0");
  const [selectedYear, setSelectedYear] = useState(defaultYear);
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);

  const months = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  const years = Array.from({ length: 8 }, (_, index) => String(today.getFullYear() - index));

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const period = `${selectedYear}-${selectedMonth}`;
    if (!/^\d{4}-\d{2}$/.test(period)) {
      toast.error("Please select a valid reporting month and year.");
      return;
    }

    if (!file.name.toLowerCase().endsWith(".csv")) {
      toast.error("Please upload a CSV file");
      return;
    }

    try {
      const newUpload = await uploadRoyaltyFileMutation.mutateAsync({ file, period });
      toast.success(
        `Successfully processed ${newUpload.recordsProcessed} royalty records for ${newUpload.period || period}`
      );
    } catch {
      toast.error("Failed to process royalty file");
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const downloadTemplate = () => {
    const csvContent = `ISRC,Artist_Name,Track_Title,Royalty_Amount,Currency,Period
USRC17607839,John Doe,Summer Vibes,25.67,USD,2024-02
USRC17607840,Jane Smith,Midnight Dreams,45.23,USD,2024-02
USRC17607841,Mike Wilson,Rock Anthem,12.45,USD,2024-02`;

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "royalty_upload_template.csv";
    anchor.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <AdminPageLayout title="Royalties Management" subtitle="Upload monthly royalty CSV files and manage distributions">
        <AdminPageLoader message="Loading royalties data..." />
      </AdminPageLayout>
    );
  }

  return (
    <AdminPageLayout title="Royalties Management" subtitle="Upload monthly royalty CSV files and manage distributions">
      <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Distributed</p>
                <p className="text-2xl font-bold text-gray-900">${(royaltyStats?.totalDistributed || 0).toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Distribution</p>
                <p className="text-2xl font-bold text-gray-900">${(royaltyStats?.pendingDistribution || 0).toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Artists</p>
                <p className="text-2xl font-bold text-gray-900">{(royaltyStats?.totalArtists || 0).toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Monthly Royalties</h3>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <div className="mb-4">
                <label htmlFor="royalty-period-month" className="block text-sm font-medium text-gray-700 mb-2">
                  Reporting Period
                </label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <select
                    id="royalty-period-month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-onerpm-orange"
                    title="Select reporting month"
                    aria-label="Select reporting month"
                  >
                    {months.map((month) => (
                      <option key={month.value} value={month.value}>
                        {month.label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-onerpm-orange"
                    title="Select reporting year"
                    aria-label="Select reporting year"
                  >
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-onerpm-orange transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {isProcessing ? (
                  <div className="space-y-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto animate-pulse">
                      <Upload className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Processing CSV file...</p>
                      <p className="text-gray-600 text-sm">Please wait while we process the royalty data</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                    <div>
                      <p className="font-medium">Upload Royalty CSV File</p>
                      <p className="text-gray-600 text-sm">Click to browse or drag and drop</p>
                    </div>
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                aria-label="Upload royalty CSV file"
                title="Upload royalty CSV file"
                className="hidden"
                disabled={isProcessing}
              />
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">CSV File Requirements:</h4>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>• File must be in CSV format</li>
                <li>• Required columns: ISRC, Track, Artists, Release, Label, Royalty Total</li>
                <li>• Select the reporting month before upload</li>
                <li>• ISRC codes must match existing releases</li>
                <li>• Artist and track names are stored for audit but matching is done by ISRC</li>
                <li>• Royalty amounts should be in decimal format (e.g., 25.67)</li>
              </ul>

              <Button variant="outline" onClick={downloadTemplate} className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Download CSV Template
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Upload History</h3>
          </div>

          <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-400px)]">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    File Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Upload Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Records Processed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Processed By
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {uploadHistory.map((upload) => (
                  <tr key={upload.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{upload.fileName}</div>
                          {upload.period && <div className="text-xs text-gray-500">Period: {upload.period}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{upload.uploadDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {upload.recordsProcessed.toLocaleString()}
                      {(upload.matchedRows !== undefined || upload.unmatchedRows !== undefined) && (
                        <div className="text-xs text-gray-500">
                          Matched: {upload.matchedRows ?? 0} | Unmatched: {upload.unmatchedRows ?? 0}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${upload.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={getStatusColor(upload.status)}>
                        <div className="flex items-center space-x-1">
                          <Check className="w-4 h-4" />
                          <span>{upload.status}</span>
                        </div>
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{upload.processedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </AdminPageLayout>
  );
};

export default AdminRoyalties;