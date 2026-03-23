import { Home, Users, Music, UserRound, DollarSign, FileText, Settings, TriangleAlert as AlertTriangle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { lazy, type ComponentType, type LazyExoticComponent } from "react";

const AdminArtists = lazy(() => import("@/pages/admin/AdminArtists"));
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const AdminReleases = lazy(() => import("@/pages/admin/AdminReleases"));
const AdminReportRequests = lazy(() => import("@/pages/admin/AdminReportRequests"));
const AdminRoyalties = lazy(() => import("@/pages/admin/AdminRoyalties"));
const AdminRoyaltyRequests = lazy(() => import("@/pages/admin/AdminRoyaltyRequests"));
const AdminSettings = lazy(() => import("@/pages/admin/AdminSettings"));
const AdminTakedownRequests = lazy(() => import("@/pages/admin/AdminTakedownRequests"));
const AdminUsers = lazy(() => import("@/pages/admin/AdminUsers"));

export interface AdminRouteConfig {
  path: string;
  title: string;
  label: string;
  icon: LucideIcon;
  component: ComponentType | LazyExoticComponent<ComponentType>;
  showInPrimaryNav?: boolean;
  showInUserMenu?: boolean;
}

export const adminProtectedRoutes: AdminRouteConfig[] = [
  {
    path: "/admin",
    title: "Dashboard",
    label: "Overview",
    icon: Home,
    component: AdminDashboard,
    showInPrimaryNav: true,
  },
  {
    path: "/admin/users",
    title: "Users Management",
    label: "Users",
    icon: Users,
    component: AdminUsers,
    showInPrimaryNav: true,
  },
  {
    path: "/admin/releases",
    title: "Releases Management",
    label: "Releases",
    icon: Music,
    component: AdminReleases,
    showInPrimaryNav: true,
  },
  {
    path: "/admin/artists",
    title: "Artists Management",
    label: "Artists",
    icon: UserRound,
    component: AdminArtists,
    showInPrimaryNav: true,
  },
  {
    path: "/admin/royalties",
    title: "Royalties Management",
    label: "Royalties",
    icon: DollarSign,
    component: AdminRoyalties,
    showInPrimaryNav: true,
  },
  {
    path: "/admin/royalty-requests",
    title: "Royalty Requests",
    label: "Withdrawals",
    icon: DollarSign,
    component: AdminRoyaltyRequests,
    showInPrimaryNav: true,
  },
  {
    path: "/admin/report-requests",
    title: "Report Requests",
    label: "Reports",
    icon: FileText,
    component: AdminReportRequests,
    showInPrimaryNav: true,
  },
  {
    path: "/admin/takedown-requests",
    title: "Takedown Requests",
    label: "Takedowns",
    icon: AlertTriangle,
    component: AdminTakedownRequests,
    showInPrimaryNav: true,
  },
  {
    path: "/admin/settings",
    title: "System Settings",
    label: "Settings",
    icon: Settings,
    component: AdminSettings,
    showInUserMenu: true,
  },
];

export const adminPrimaryNavRoutes = adminProtectedRoutes.filter((route) => route.showInPrimaryNav);

export const adminUserMenuRoutes = adminProtectedRoutes.filter((route) => route.showInUserMenu);

export const getAdminPageTitle = (path: string): string => {
  if (path === "/login") {
    return "XDistro Music Admin - Admin Login";
  }

  const matchingRoute = adminProtectedRoutes.find((route) => route.path === path);

  if (matchingRoute) {
    return `XDistro Music Admin - ${matchingRoute.title}`;
  }

  return "XDistro Music Admin - Admin Panel";
};