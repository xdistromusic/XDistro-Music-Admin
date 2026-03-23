import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Music, DollarSign, UserCheck, TrendingUp, Calendar, AlertTriangle } from "lucide-react";
import AdminPageLayout from "@/components/admin/AdminPageLayout";

const AdminDashboard = () => {
  // Mock data - in real app this would come from API
  const [stats] = useState({
    totalUsers: 12547,
    activeSubscribers: 8932,
    totalReleases: 45678,
    pendingReleases: 234,
    monthlyRevenue: 89432,
    royaltyRequests: 67,
    takedownRequests: 12
  });

  const [recentActivity] = useState([
    { id: 1, type: "takedown", message: "New takedown request: 'Summer Vibes' by John Doe", time: "5 minutes ago" },
    { id: 2, type: "release", message: "New release submitted by john.doe@email.com", time: "15 minutes ago" },
    { id: 3, type: "user", message: "New user registration: jane.smith@email.com", time: "25 minutes ago" },
    { id: 4, type: "royalty", message: "Royalty withdrawal request: $245.67", time: "1 hour ago" },
    { id: 5, type: "release", message: "Release approved: 'Summer Vibes' by John Doe", time: "2 hours ago" },
    { id: 6, type: "user", message: "User upgraded to Pro plan: mike.wilson@email.com", time: "3 hours ago" }
  ]);

  const StatCard = ({ title, value, icon, trend, trendValue }: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: 'up' | 'down';
    trendValue?: string;
  }) => (
    <Card className="hover:shadow-lg transition-shadow">
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
    </Card>
  );

  return (
    <AdminPageLayout title="Admin Dashboard" subtitle="Activity Overview">

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={stats.totalUsers} 
            icon={<Users className="w-6 h-6 text-onerpm-orange" />}
          />
          <StatCard
            title="Active Subscribers"
            value={stats.activeSubscribers}
            icon={<UserCheck className="w-6 h-6 text-onerpm-orange" />}
          />
          <StatCard
            title="Total Releases"
            value={stats.totalReleases}
            icon={<Music className="w-6 h-6 text-onerpm-orange" />}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-6 mb-8">          
          <StatCard
            title="Pending Releases"
            value={stats.pendingReleases}
            icon={<Calendar className="w-6 h-6 text-onerpm-orange" />}
          />
          <StatCard
            title="Royalty Requests"
            value={stats.royaltyRequests}
            icon={<DollarSign className="w-6 h-6 text-onerpm-orange" />}
          />
          <StatCard
            title="Takedown Requests"
            value={stats.takedownRequests}
            icon={<AlertTriangle className="w-6 h-6 text-onerpm-orange" />}
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Button className="bg-onerpm-orange hover:bg-onerpm-orange/90 text-white p-6 h-auto flex flex-col items-center space-y-2">
            <Users className="w-6 h-6" />
            <span>Manage Users</span>
          </Button>
          <Button className="bg-onerpm-purple hover:bg-onerpm-purple/90 text-white p-6 h-auto flex flex-col items-center space-y-2">
            <Music className="w-6 h-6" />
            <span>Review Releases</span>
          </Button>
          <Button className="bg-onerpm-blue hover:bg-onerpm-blue/90 text-white p-6 h-auto flex flex-col items-center space-y-2">
            <DollarSign className="w-6 h-6" />
            <span>Upload Royalties</span>
          </Button>
          <Button className="bg-onerpm-green hover:bg-onerpm-green/90 text-white p-6 h-auto flex flex-col items-center space-y-2">
            <Calendar className="w-6 h-6" />
            <span>Royalty Requests</span>
          </Button>
          <Button className="bg-red-600 hover:bg-red-700 text-white p-6 h-auto flex flex-col items-center space-y-2">
            <AlertTriangle className="w-6 h-6" />
            <span>Takedown Requests</span>
          </Button>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === 'release' ? 'bg-onerpm-purple' :
                    activity.type === 'user' ? 'bg-onerpm-blue' :
                    activity.type === 'takedown' ? 'bg-red-500' :
                    'bg-onerpm-green'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-gray-900">{activity.message}</p>
                    <p className="text-sm text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
    </AdminPageLayout>
  );
};

export default AdminDashboard;