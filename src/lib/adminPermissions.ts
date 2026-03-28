import { AdminPermission, AdminRouteConfig } from "@/config/adminRoutes";
import { AdminUser } from "@/types/admin";

export const userCanAccessPermission = (
  user: AdminUser | null | undefined,
  permission?: AdminPermission
): boolean => {
  if (!permission) return true;
  if (!user) return false;
  return user.permissions.includes(permission);
};

export const filterRoutesByPermission = (
  routes: AdminRouteConfig[],
  user: AdminUser | null | undefined
): AdminRouteConfig[] => routes.filter((route) => userCanAccessPermission(user, route.requiredPermission));
