import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteAdminUser,
  suspendAdminUser,
  getAdminUsers,
  getAdminUsersPage,
  updateAdminUserPlan,
  updateAdminUserStatus,
  updateAdminUserDetails,
  AdminUserDetailsUpdate,
} from "@/services/adminUsers";
import { AdminEntityId, SubscriptionPlanName } from "@/types/admin";

const adminUsersQueryKey = ["admin", "users"] as const;

export const useAdminUsers = () => {
  return useQuery({
    queryKey: adminUsersQueryKey,
    queryFn: getAdminUsers,
    refetchOnWindowFocus: false,
  });
};

export const useAdminUsersPage = (
  page: number,
  pageSize: number,
  search: string,
  plan: "all" | SubscriptionPlanName
) => {
  return useQuery({
    queryKey: [...adminUsersQueryKey, "page", page, pageSize, search, plan],
    queryFn: () => getAdminUsersPage({ page, pageSize, search, plan }),
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });
};

export const useDeleteAdminUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: AdminEntityId) => deleteAdminUser(userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminUsersQueryKey });
    },
  });
};

export const useSuspendAdminUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, reason }: { userId: AdminEntityId; reason: string }) =>
      suspendAdminUser(userId, reason),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminUsersQueryKey });
    },
  });
};

export const useUpdateAdminUserPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, plan }: { userId: AdminEntityId; plan: SubscriptionPlanName }) =>
      updateAdminUserPlan(userId, plan),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminUsersQueryKey });
    },
  });
};

export const useUpdateAdminUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, status }: { userId: AdminEntityId; status: string }) =>
      updateAdminUserStatus(userId, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminUsersQueryKey });
    },
  });
};
export const useUpdateAdminUserDetails = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, details }: { userId: AdminEntityId; details: AdminUserDetailsUpdate }) =>
      updateAdminUserDetails(userId, details),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminUsersQueryKey });
    },
  });
};
