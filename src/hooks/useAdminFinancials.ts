import { useQuery } from "@tanstack/react-query";
import { getAdminFinancialsReport } from "@/services/adminFinancials";

const adminFinancialsQueryKey = ["admin", "financials"] as const;

export const useAdminFinancials = () => {
  return useQuery({
    queryKey: adminFinancialsQueryKey,
    queryFn: getAdminFinancialsReport,
    refetchOnWindowFocus: false,
  });
};
