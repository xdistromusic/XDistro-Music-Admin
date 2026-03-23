import { useQuery } from "@tanstack/react-query";
import { getCurrentAdminUser } from "@/services/adminAuth";

export const useAdminUser = () => {
  return useQuery({
    queryKey: ["admin", "user"],
    queryFn: getCurrentAdminUser,
    retry: false,
    refetchOnWindowFocus: false,
  });
};