import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, CalendarClock, RefreshCw, Repeat, Users } from "lucide-react";
import AdminPageLayout from "@/components/admin/AdminPageLayout";
import { useAdminFinancials } from "@/hooks/useAdminFinancials";

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

const getBarWidthClass = (ratio: number): string => {
  if (ratio >= 0.9) return "w-full";
  if (ratio >= 0.75) return "w-5/6";
  if (ratio >= 0.6) return "w-2/3";
  if (ratio >= 0.45) return "w-1/2";
  if (ratio >= 0.3) return "w-2/5";
  if (ratio > 0) return "w-1/4";
  return "w-0";
};

export const FinancialsContent = () => {
  const { data, isLoading, isFetching, refetch, error } = useAdminFinancials();

  const maxPlanCount = Math.max(...(data?.planDistribution.map((item) => item.count) ?? [0]));
  const maxRenewals = Math.max(...(data?.renewalsByPeriod.map((item) => item.renewals) ?? [0]));

  return (
    <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Financial Snapshot</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Last generated: {formatDateTime(data?.generatedAt)}
                </p>
              </div>
              <Button onClick={() => void refetch()} disabled={isFetching}>
                <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
                {isFetching ? "Refreshing..." : "Refresh"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">All-Time Subscriptions</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {data?.allTimeSubscriptions ?? 0}
                  </p>
                </div>
                <div className="w-11 h-11 rounded-lg bg-blue-100 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-blue-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Users Ever Subscribed</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {data?.usersEverSubscribed ?? 0}
                  </p>
                </div>
                <div className="w-11 h-11 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <Users className="w-5 h-5 text-emerald-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Renewals</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {data?.renewalEventsCount ?? 0}
                  </p>
                </div>
                <div className="w-11 h-11 rounded-lg bg-violet-100 flex items-center justify-center">
                  <Repeat className="w-5 h-5 text-violet-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Most Subscribed Plan</p>
                  <p className="text-xl font-bold text-gray-900 mt-1 truncate max-w-[170px]">
                    {data?.mostSubscribedPlan?.planName ?? "-"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {(data?.mostSubscribedPlan?.count ?? 0).toLocaleString()} subscriptions
                  </p>
                </div>
                <div className="w-11 h-11 rounded-lg bg-amber-100 flex items-center justify-center">
                  <CalendarClock className="w-5 h-5 text-amber-700" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <Card>
            <CardContent className="p-0">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-base font-semibold text-gray-900">Plan Distribution (All-Time)</h3>
                <p className="text-sm text-gray-500">Count of subscriptions created per plan.</p>
              </div>

              <div className="p-6 space-y-4">
                {(data?.planDistribution.length ?? 0) === 0 ? (
                  <p className="text-sm text-gray-500">No subscription plan data available yet.</p>
                ) : (
                  data?.planDistribution.map((item) => {
                    const ratio = maxPlanCount > 0 ? item.count / maxPlanCount : 0;
                    return (
                      <div key={item.planId}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="font-medium text-gray-800">{item.planName}</span>
                          <span className="text-gray-600">{item.count.toLocaleString()}</span>
                        </div>
                        <div className="h-2 rounded-full bg-gray-100">
                          <div className={`h-2 rounded-full bg-onerpm-orange ${getBarWidthClass(ratio)}`} />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-base font-semibold text-gray-900">Renewals by Month</h3>
                <p className="text-sm text-gray-500">Exact renewals from the subscription date forward.</p>
              </div>

              <div className="p-6 space-y-4">
                {(data?.renewalsByPeriod.length ?? 0) === 0 ? (
                  <p className="text-sm text-gray-500">No renewals yet.</p>
                ) : (
                  data?.renewalsByPeriod.map((item) => {
                    const ratio = maxRenewals > 0 ? item.renewals / maxRenewals : 0;
                    return (
                      <div key={item.period}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="font-medium text-gray-800">{item.period}</span>
                          <span className="text-gray-600">{item.renewals.toLocaleString()}</span>
                        </div>
                        <div className="h-2 rounded-full bg-gray-100">
                          <div className={`h-2 rounded-full bg-blue-500 ${getBarWidthClass(ratio)}`} />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">
              Renewal metrics are exact from the subscription date forward.
            </p>
          </CardContent>
        </Card>

        {isLoading && (
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-gray-500">Loading financial metrics...</p>
            </CardContent>
          </Card>
        )}

        {error && !isLoading && (
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-red-600">Failed to load financial metrics.</p>
            </CardContent>
          </Card>
        )}
      </div>
  );
};

const AdminFinancials = () => (
  <AdminPageLayout
    title="Financials"
    subtitle="Track subscription lifetime totals, renewals, and dominant plan trends."
  >
    <FinancialsContent />
  </AdminPageLayout>
);

export default AdminFinancials;
