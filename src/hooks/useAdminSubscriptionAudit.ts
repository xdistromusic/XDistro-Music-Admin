import { useQuery } from "@tanstack/react-query";
import { getAdminSubscriptionAudit } from "@/services/adminSubscriptionAudit";

const adminSubscriptionAuditQueryKey = ["admin", "subscription-audit"] as const;

export const useAdminSubscriptionAudit = () => {
  return useQuery({
    queryKey: adminSubscriptionAuditQueryKey,
    queryFn: getAdminSubscriptionAudit,
    refetchOnWindowFocus: false,
  });
};
