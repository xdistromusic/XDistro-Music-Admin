import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Search, Eye, CheckCircle2, Clock3 } from "lucide-react";
import { toast } from "sonner";
import AdminPageLayout from "@/components/admin/AdminPageLayout";
import AdminPageLoader from "@/components/admin/AdminPageLoader";
import SupportDetailsModal from "@/components/admin/SupportDetailsModal";
import {
  useAdminSupportTicketDetail,
  useAdminSupportTickets,
  useReplyToAdminSupportTicket,
  useUpdateAdminSupportTicketStatus,
} from "@/hooks/useAdminSupportTickets";
import { AdminSupportTicketStatus } from "@/types/admin";

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "open":
      return "bg-yellow-100 text-yellow-800";
    case "in progress":
      return "bg-blue-100 text-blue-800";
    case "resolved":
      return "bg-green-100 text-green-800";
    case "closed":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const AdminSupport = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const { data: tickets = [], isLoading } = useAdminSupportTickets();
  const { data: selectedTicket, isLoading: isLoadingTicket } = useAdminSupportTicketDetail(selectedTicketId);
  const updateStatusMutation = useUpdateAdminSupportTicketStatus();
  const replyMutation = useReplyToAdminSupportTicket();

  const filteredTickets = tickets.filter((ticket) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      ticket.ticketNumber.toLowerCase().includes(query) ||
      ticket.contactName.toLowerCase().includes(query) ||
      ticket.contactEmail.toLowerCase().includes(query) ||
      ticket.subject.toLowerCase().includes(query);

    const normalizedStatus = ticket.status.toLowerCase().replace(/\s+/g, "-");
    const matchesStatus = filterStatus === "all" || normalizedStatus === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const handleStatusUpdate = async (ticketId: string | number, status: AdminSupportTicketStatus) => {
    try {
      await updateStatusMutation.mutateAsync({ ticketId, status });
      toast.success(`Support ticket updated to ${status}`);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to update support ticket status");
    }
  };

  const handleReply = async (ticketId: string | number, message: string) => {
    try {
      await replyMutation.mutateAsync({ ticketId, message });
      toast.success("Support reply sent successfully");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to send support reply");
    }
  };

  if (isLoading) {
    return (
      <AdminPageLayout title="Support Requests" subtitle="Review support tickets and respond to users by email">
        <AdminPageLoader message="Loading support requests..." />
      </AdminPageLayout>
    );
  }

  return (
    <AdminPageLayout title="Support Requests" subtitle="Review support tickets and respond to users by email">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tickets</p>
                <p className="text-2xl font-bold text-gray-900">{filteredTickets.length}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-onerpm-orange" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Open</p>
                <p className="text-2xl font-bold text-yellow-600">{filteredTickets.filter((ticket) => ticket.status === "Open").length}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock3 className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{filteredTickets.filter((ticket) => ticket.status === "In Progress").length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-green-600">{filteredTickets.filter((ticket) => ticket.status === "Resolved").length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by ticket, subject, name, or email..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(event) => setFilterStatus(event.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-onerpm-orange focus:border-transparent"
                aria-label="Filter support requests by status"
                title="Filter support requests by status"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-400px)]">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">
                      No support tickets found for the current filters.
                    </td>
                  </tr>
                ) : filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 align-top">
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{ticket.ticketNumber}</div>
                        <div className="text-sm text-gray-700 mt-1">{ticket.subject}</div>
                        <div className="text-xs text-gray-500 mt-1">{ticket.category}</div>
                        <div className="text-xs text-gray-400 mt-2 line-clamp-2">{ticket.preview}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <div className="text-sm font-medium text-gray-900">{ticket.contactName}</div>
                      <div className="text-sm text-gray-500">{ticket.contactEmail}</div>
                      <div className="text-xs text-gray-400 mt-2">Created {ticket.createdDate}</div>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <Badge className={getStatusColor(ticket.status)}>{ticket.status}</Badge>
                      <div className="text-xs text-gray-500 mt-2">{ticket.messageCount} messages</div>
                    </td>
                    <td className="px-6 py-4 align-top text-sm text-gray-700">
                      <div>{ticket.lastUpdatedDate}</div>
                      {ticket.lastAdminReplyDate && ticket.lastAdminReplyDate !== "N/A" && (
                        <div className="text-xs text-gray-500 mt-1">Last reply {ticket.lastAdminReplyDate}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 align-top text-sm font-medium">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        onClick={() => setSelectedTicketId(String(ticket.id))}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <SupportDetailsModal
        ticket={selectedTicket ?? null}
        isOpen={Boolean(selectedTicketId)}
        onClose={() => setSelectedTicketId(null)}
        onStatusUpdate={handleStatusUpdate}
        onReply={handleReply}
        isUpdatingStatus={updateStatusMutation.isPending}
        isSendingReply={replyMutation.isPending || isLoadingTicket}
      />
    </AdminPageLayout>
  );
};

export default AdminSupport;