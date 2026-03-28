import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAdminStaff,
  deleteAdminStaff,
  getAdminStaff,
  updateAdminStaff,
} from "@/services/adminStaff";
import { CreateStaffInput, UpdateStaffInput } from "@/types/admin";

const STAFF_QUERY_KEY = ["admin", "staff"] as const;

export const useAdminStaff = () =>
  useQuery({
    queryKey: STAFF_QUERY_KEY,
    queryFn: getAdminStaff,
  });

export const useCreateStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateStaffInput) => createAdminStaff(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: STAFF_QUERY_KEY }),
  });
};

export const useUpdateStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdateStaffInput }) =>
      updateAdminStaff(id, updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: STAFF_QUERY_KEY }),
  });
};

export const useDeleteStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAdminStaff(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: STAFF_QUERY_KEY }),
  });
};
