import { Home, Users, Music, UserRound, DollarSign, Settings, TriangleAlert as AlertTriangle, MessageSquare } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { lazy, type ComponentType, type LazyExoticComponent } from "react";
import { AdminPermission } from "@/types/admin";

const AdminArtists = lazy(() => import("@/pages/admin/AdminArtists"));
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const AdminReleases = lazy(() => import("@/pages/admin/AdminReleases"));
const AdminRoyalties = lazy(() => import("@/pages/admin/AdminRoyalties"));
const AdminRoyaltyRequests = lazy(() => import("@/pages/admin/AdminRoyaltyRequests"));
const AdminSettings = lazy(() => import("@/pages/admin/AdminSettings"));
const AdminSubscriptionAudit = lazy(() => import("@/pages/admin/AdminSubscriptionAudit"));
const AdminSupport = lazy(() => import("@/pages/admin/AdminSupport"));
const AdminTakedownRequests = lazy(() => import("@/pages/admin/AdminTakedownRequests"));
const AdminUsers = lazy(() => import("@/pages/admin/AdminUsers"));

export interface AdminRouteConfig {
  path: string;
  title: string;
  label: string;
  icon: LucideIcon;
  component: ComponentType | LazyExoticComponent<ComponentType>;
  requiredPermission?: AdminPermission;
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
    requiredPermission: "dashboard",
    showInPrimaryNav: true,
  },
  {
    path: "/admin/users",
    title: "Users Management",
    label: "Users",
    icon: Users,
    component: AdminUsers,
    requiredPermission: "users",
    showInPrimaryNav: true,
  },
  {
    path: "/admin/releases",
    title: "Releases Management",
    label: "Releases",
    icon: Music,
    component: AdminReleases,
    requiredPermission: "releases",
    showInPrimaryNav: true,
  },
  {
    path: "/admin/artists",
    title: "Artists Management",
    label: "Artists",
    icon: UserRound,
    component: AdminArtists,
    requiredPermission: "artists",
    showInPrimaryNav: true,
  },
  {
    path: "/admin/royalties",
    title: "Royalties Management",
    label: "Royalties",
    icon: DollarSign,
    component: AdminRoyalties,
    requiredPermission: "royalties",
    showInPrimaryNav: true,
  },
  {
    path: "/admin/royalty-requests",
    title: "Royalty Requests",
    label: "Withdrawals",
    icon: DollarSign,
    component: AdminRoyaltyRequests,
    requiredPermission: "royalty_requests",
    showInPrimaryNav: true,
  },
  {
    path: "/admin/takedown-requests",
    title: "Takedown Requests",
    label: "Takedowns",
    icon: AlertTriangle,
    component: AdminTakedownRequests,
    requiredPermission: "takedown_requests",
    showInPrimaryNav: true,
  },
  {
    path: "/admin/support",
    title: "Support Requests",
    label: "Support",
    icon: MessageSquare,
    component: AdminSupport,
    requiredPermission: "support_requests",
    showInPrimaryNav: true,
  },
  {
    path: "/admin/subscription-audit",
    title: "Subscription Audit",
    label: "Sub Audit",
    icon: AlertTriangle,
    component: AdminSubscriptionAudit,
    requiredPermission: "users",
    showInPrimaryNav: true,
  },
  {
    path: "/admin/settings",
    title: "System Settings",
    label: "Settings",
    icon: Settings,
    component: AdminSettings,
    requiredPermission: "settings",
    showInUserMenu: true,
  },
];

export const adminPrimaryNavRoutes = adminProtectedRoutes.filter((route) => route.showInPrimaryNav);

/**
 * Eagerly fetches all admin route JS chunks so the browser caches them before
 * the user navigates. Call this immediately after a successful login.
 */
export const prefetchAdminRoutes = (): void => {
  void import("@/pages/admin/AdminDashboard");
  void import("@/pages/admin/AdminUsers");
  void import("@/pages/admin/AdminReleases");
  void import("@/pages/admin/AdminArtists");
  void import("@/pages/admin/AdminRoyalties");
  void import("@/pages/admin/AdminRoyaltyRequests");
  void import("@/pages/admin/AdminTakedownRequests");
  void import("@/pages/admin/AdminSupport");
  void import("@/pages/admin/AdminSubscriptionAudit");
  void import("@/pages/admin/AdminSettings");
};


export const adminUserMenuRoutes = adminProtectedRoutes.filter((route) => route.showInUserMenu);

export const getAdminPageTitle = (path: string): string => {
  if (path === "/login") {
    return "XDistro Music - Admin Login";
  }

  const matchingRoute = adminProtectedRoutes.find((route) => route.path === path);

  if (matchingRoute) {
    return `XDistro Music - ${matchingRoute.title}`;
  }

  return "XDistro Music - Admin Panel";
};