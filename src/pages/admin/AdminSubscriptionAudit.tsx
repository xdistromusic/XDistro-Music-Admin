import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AdminPageLayout from "@/components/admin/AdminPageLayout";
import { useAdminSubscriptionAudit } from "@/hooks/useAdminSubscriptionAudit";

const formatDateTime = (value?: string | null): string => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
};

export const SubscriptionAuditContent = () => {
  const { data, isLoading, isFetching, refetch, error } = useAdminSubscriptionAudit();

  return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Audit Snapshot</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Last generated: {formatDateTime(data?.generatedAt)}
                </p>
              </div>
              <Button onClick={() => void refetch()} disabled={isFetching}>
                {isFetching ? "Refreshing..." : "Refresh"}
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 mt-6 md:grid-cols-2">
              <div className="rounded-lg border border-gray-200 p-4">
                <p className="text-sm text-gray-600">Users with multiple active subscriptions</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {data?.currentDuplicateActiveCount ?? 0}
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 p-4">
                <p className="text-sm text-gray-600">Likely duplicate cleanup rows</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {data?.likelyDuplicateCleanupCount ?? 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-base font-semibold text-gray-900">Current Duplicate Active Users</h3>
              <p className="text-sm text-gray-500">Each row represents a user with more than one active subscription.</p>
            </div>
            <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-460px)]">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active Count</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscription IDs</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">
                        Loading subscription audit...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-sm text-red-600">
                        Failed to load subscription audit report.
                      </td>
                    </tr>
                  ) : (data?.currentDuplicateActiveUsers.length ?? 0) === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">
                        No current duplicate active subscriptions found.
                      </td>
                    </tr>
                  ) : data?.currentDuplicateActiveUsers.map((user) => (
                    <tr key={user.userId} className="hover:bg-gray-50 align-top">
                      <td className="px-6 py-4 text-sm text-gray-900">{user.name || "Unknown"}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{user.email || "-"}</td>
                      <td className="px-6 py-4 text-xs text-gray-500 font-mono">{user.userId}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{user.activeCount}</td>
                      <td className="px-6 py-4 text-xs text-gray-600">
                        <div className="space-y-1">
                          {user.activeSubscriptions.map((subscription) => (
                            <div key={subscription.id} className="font-mono break-all">{subscription.id}</div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-base font-semibold text-gray-900">Likely Duplicate Cleanup Rows</h3>
              <p className="text-sm text-gray-500">Rows inferred as duplicates that were deactivated by cleanup logic.</p>
            </div>
            <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-500px)]">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscription ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Terminated</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">
                        Loading cleanup rows...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-sm text-red-600">
                        Failed to load cleanup rows.
                      </td>
                    </tr>
                  ) : (data?.likelyDuplicateCleanupRows.length ?? 0) === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">
                        No likely duplicate cleanup rows found.
                      </td>
                    </tr>
                  ) : data?.likelyDuplicateCleanupRows.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50 align-top">
                      <td className="px-6 py-4 text-xs text-gray-600 font-mono break-all">{row.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{row.name || row.userId}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{row.email || "-"}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{formatDateTime(row.terminatedAt)}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{formatDateTime(row.updatedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
  );
};

const AdminSubscriptionAudit = () => (
  <AdminPageLayout
    title="Subscription Audit"
    subtitle="Track duplicate active subscriptions and duplicate-cleanup activity."
  >
    <SubscriptionAuditContent />
  </AdminPageLayout>
);

export default AdminSubscriptionAudit;
