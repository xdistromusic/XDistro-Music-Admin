import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Music, DollarSign, UserCheck, TrendingUp, Calendar, AlertTriangle } from "lucide-react";
import AdminPageLayout from "@/components/admin/AdminPageLayout";
import { useAuth } from "@/hooks/useAuth";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import { useAdminReleases } from "@/hooks/useAdminReleases";
import { useAdminRoyaltyRequests } from "@/hooks/useAdminRoyaltyRequests";
import { useAdminTakedownRequests } from "@/hooks/useAdminTakedownRequests";
import { userCanAccessPermission } from "@/lib/adminPermissions";
import {
  AdminPermission,
  AdminRelease,
  AdminRoyaltyRequest,
  AdminTakedownRequest,
  AdminUserListItem,
} from "@/types/admin";

interface ActivityItem {
  id: string;
  type: "user" | "release" | "royalty" | "takedown";
  message: string;
  time: string;
}

interface QuickAction {
  label: string;
  path: string;
  className: string;
  icon: typeof Users;
  permission: AdminPermission;
}

const StatCardSkeleton = () => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-4 w-28 bg-gray-200 rounded animate-pulse" />
          <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse" />
      </div>
    </CardContent>
  </Card>
);

const AdminDashboard = () => {
  const { user } = useAuth();
  const { data: usersData, isLoading: usersLoading } = useAdminUsers();
  const { data: releasesData, isLoading: releasesLoading } = useAdminReleases();
  const { data: royaltyRequestsData, isLoading: royaltyLoading } = useAdminRoyaltyRequests();
  const { data: takedownRequestsData, isLoading: takedownLoading } = useAdminTakedownRequests();

  const quickActions = useMemo(() => {
    const actions: QuickAction[] = [
      {
        label: "Manage Users",
        path: "/admin/users",
        className: "bg-onerpm-orange hover:bg-onerpm-orange/90",
        icon: Users,
        permission: "users",
      },
      {
        label: "Review Releases",
        path: "/admin/releases",
        className: "bg-onerpm-purple hover:bg-onerpm-purple/90",
        icon: Music,
        permission: "releases",
      },
      {
        label: "Upload Royalties",
        path: "/admin/royalties",
        className: "bg-onerpm-blue hover:bg-onerpm-blue/90",
        icon: DollarSign,
        permission: "royalties",
      },
      {
        label: "Royalty Requests",
        path: "/admin/royalty-requests",
        className: "bg-onerpm-green hover:bg-onerpm-green/90",
        icon: Calendar,
        permission: "royalty_requests",
      },
      {
        label: "Takedown Requests",
        path: "/admin/takedown-requests",
        className: "bg-red-600 hover:bg-red-700",
        icon: AlertTriangle,
        permission: "takedown_requests",
      },
      {
        label: "Subscription Audit",
        path: "/admin/subscription-audit",
        className: "bg-gray-900 hover:bg-gray-800",
        icon: AlertTriangle,
        permission: "users",
      },
    ];

    return actions.filter((action) => userCanAccessPermission(user, action.permission));
  }, [user]);

  // Build stats from actual data
  const stats = useMemo(() => {
    const users = usersData || [];
    const releases = releasesData || [];
    const royaltyRequests = royaltyRequestsData || [];
    const takedownRequests = takedownRequestsData || [];

    const activeSubscribers = users.filter((u: AdminUserListItem) => u.plan !== "Non Subscriber").length;
    const pendingReleases = releases.filter((r: AdminRelease) => r.status === "Submitted").length;
    const pendingRoyaltyRequests = royaltyRequests.filter((r: AdminRoyaltyRequest) => r.status === "Pending").length;
    const totalAmountRequested = royaltyRequests.reduce((sum: number, r: AdminRoyaltyRequest) => sum + r.amount, 0);

    return {
      totalUsers: users.length,
      activeSubscribers,
      totalReleases: releases.length,
      pendingReleases,
      monthlyRevenue: totalAmountRequested,
      royaltyRequests: pendingRoyaltyRequests,
      takedownRequests: takedownRequests.length
    };
  }, [usersData, releasesData, royaltyRequestsData, takedownRequestsData]);

  // Build recent activity from actual data
  const recentActivity = useMemo(() => {
    const activities: ActivityItem[] = [];

    // Add recent users
    const users = usersData || [];
    users.slice(0, 2).forEach((user: AdminUserListItem) => {
      activities.push({
        id: `user-${user.id}`,
        type: "user",
        message: `New user: ${user.firstName} ${user.lastName} (${user.email})`,
        time: user.joinDate
      });
    });

    // Add recent releases
    const releases = releasesData || [];
    releases.slice(0, 2).forEach((release: AdminRelease) => {
      activities.push({
        id: `release-${release.id}`,
        type: "release",
        message: `${release.status === "Submitted" ? "New release" : "Release"} submitted: "${release.title}" by ${release.artist}`,
        time: release.submissionDate
      });
    });

    // Add recent royalty requests
    const royaltyRequests = royaltyRequestsData || [];
    royaltyRequests.slice(0, 2).forEach((request: AdminRoyaltyRequest) => {
      activities.push({
        id: `royalty-${request.id}`,
        type: "royalty",
        message: `Royalty request: $${request.amount.toFixed(2)} from ${request.artistName}`,
        time: request.requestDate
      });
    });

    // Add recent takedown requests
    const takedownRequests = takedownRequestsData || [];
    takedownRequests.slice(0, 1).forEach((request: AdminTakedownRequest) => {
      activities.push({
        id: `takedown-${request.id}`,
        type: "takedown",
        message: `Takedown request: "${request.releaseTitle}" by ${request.artistName}`,
        time: request.requestDate
      });
    });

    // Sort by time (newest first) and limit to 6
    return activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 6);
  }, [usersData, releasesData, royaltyRequestsData, takedownRequestsData]);

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return "just now";
      if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
      if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const canAccessUsers = userCanAccessPermission(user, "users");
  const canAccessReleases = userCanAccessPermission(user, "releases");
  const canAccessRoyaltyRequests = userCanAccessPermission(user, "royalty_requests");
  const canAccessTakedowns = userCanAccessPermission(user, "takedown_requests");

  const primaryStats = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: <Users className="w-6 h-6 text-onerpm-orange" />,
      path: canAccessUsers ? "/admin/users" : undefined,
    },
    {
      title: "Active Subscribers",
      value: stats.activeSubscribers,
      icon: <UserCheck className="w-6 h-6 text-onerpm-orange" />,
      path: canAccessUsers ? "/admin/users" : undefined,
    },
    {
      title: "Total Releases",
      value: stats.totalReleases,
      icon: <Music className="w-6 h-6 text-onerpm-orange" />,
      path: canAccessReleases ? "/admin/releases" : undefined,
    },
  ];

  const secondaryStats = [
    {
      title: "Pending Releases",
      value: stats.pendingReleases,
      icon: <Calendar className="w-6 h-6 text-onerpm-orange" />,
      path: canAccessReleases ? "/admin/releases" : undefined,
    },
    {
      title: "Royalty Requests",
      value: stats.royaltyRequests,
      icon: <DollarSign className="w-6 h-6 text-onerpm-orange" />,
      path: canAccessRoyaltyRequests ? "/admin/royalty-requests" : undefined,
    },
    {
      title: "Takedown Requests",
      value: stats.takedownRequests,
      icon: <AlertTriangle className="w-6 h-6 text-onerpm-orange" />,
      path: canAccessTakedowns ? "/admin/takedown-requests" : undefined,
    },
  ];

  const StatCard = ({ title, value, icon, path, trend, trendValue }: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    path?: string;
    trend?: 'up' | 'down';
    trendValue?: string;
  }) => (
    <Card className={`transition-shadow ${path ? "hover:shadow-lg" : ""}`}>
      {path ? (
        <Link to={path} className="block">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{title}</p>
                <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
                {trend && trendValue && (
                  <div className={`flex items-center mt-2 text-sm ${
                    trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <TrendingUp className={`w-4 h-4 mr-1 ${trend === 'down' ? 'rotate-180' : ''}`} />
                    <span>{trendValue}</span>
                  </div>
                )}
              </div>
              <div className="w-12 h-12 bg-onerpm-orange/10 rounded-lg flex items-center justify-center">
                {icon}
              </div>
            </div>
          </CardContent>
        </Link>
      ) : (
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
              {trend && trendValue && (
                <div className={`flex items-center mt-2 text-sm ${
                  trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  <TrendingUp className={`w-4 h-4 mr-1 ${trend === 'down' ? 'rotate-180' : ''}`} />
                  <span>{trendValue}</span>
                </div>
              )}
            </div>
            <div className="w-12 h-12 bg-onerpm-orange/10 rounded-lg flex items-center justify-center">
              {icon}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );

  const isLoading = usersLoading || releasesLoading || royaltyLoading || takedownLoading;

  return (
    <AdminPageLayout title="Dashboard" subtitle="Platform overview and operational highlights.">

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => <StatCardSkeleton key={i} />)
          ) : (
            <>
              {primaryStats.map((stat) => (
                <StatCard key={stat.title} title={stat.title} value={stat.value} icon={stat.icon} path={stat.path} />
              ))}
            </>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => <StatCardSkeleton key={i} />)
          ) : (
            <>
              {secondaryStats.map((stat) => (
                <StatCard key={stat.title} title={stat.title} value={stat.value} icon={stat.icon} path={stat.path} />
              ))}
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          {quickActions.map((action) => {
            const Icon = action.icon;

            return (
              <Button
                key={action.path}
                asChild
                className={`${action.className} text-white p-6 h-auto flex flex-col items-center space-y-2`}
              >
                <Link to={action.path}>
                  <Icon className="w-6 h-6" />
                  <span>{action.label}</span>
                </Link>
              </Button>
            );
          })}
        </div>

        {/* Recent Activity */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-start space-x-3 p-3">
                    <div className="w-2 h-2 rounded-full mt-2 bg-gray-200 animate-pulse flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-1/4" />
                    </div>
                  </div>
                ))
              ) : recentActivity.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No activity yet</p>
              ) : (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.type === 'release' ? 'bg-onerpm-purple' :
                      activity.type === 'user' ? 'bg-onerpm-blue' :
                      activity.type === 'takedown' ? 'bg-red-500' :
                      'bg-onerpm-green'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-gray-900">{activity.message}</p>
                      <p className="text-sm text-gray-500">{formatTime(activity.time)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
    </AdminPageLayout>
  );
};

export default AdminDashboard;