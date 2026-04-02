import { CreateStaffInput, StaffMember, UpdateStaffInput } from "@/types/admin";
import { isAdminDataDummyEnabled, requestAdminJson } from "@/services/adminClient";
import { mockAdminStaff } from "@/data/adminStaff";

const STAFF_KEY = "admin:staff";

const readStoredStaff = (): StaffMember[] => {
  try {
    const raw = localStorage.getItem(STAFF_KEY);
    if (!raw) {
      localStorage.setItem(STAFF_KEY, JSON.stringify(mockAdminStaff));
      return mockAdminStaff;
    }

    const parsed = JSON.parse(raw) as StaffMember[];
    return Array.isArray(parsed) ? parsed : mockAdminStaff;
  } catch {
    return mockAdminStaff;
  }
};

const writeStoredStaff = (staff: StaffMember[]) => {
  localStorage.setItem(STAFF_KEY, JSON.stringify(staff));
};

export const getAdminStaff = async (): Promise<StaffMember[]> => {
  if (isAdminDataDummyEnabled()) {
    return readStoredStaff();
  }

  const payload = await requestAdminJson<{ data?: StaffMember[] }>("/staff");
  return payload.data ?? [];
};

export const createAdminStaff = async (input: CreateStaffInput): Promise<StaffMember> => {
  if (isAdminDataDummyEnabled()) {
    const staff = readStoredStaff();
    const newMember: StaffMember = {
      id: `staff-${Date.now()}`,
      ...input,
      status: "active",
      createdAt: new Date().toISOString().slice(0, 10),
      lastLogin: null,
    };
    writeStoredStaff([...staff, newMember]);
    return newMember;
  }

  const payload = await requestAdminJson<{ data: StaffMember }>("/staff", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return payload.data;
};

export const updateAdminStaff = async (id: string, updates: UpdateStaffInput): Promise<StaffMember> => {
  if (isAdminDataDummyEnabled()) {
    const staff = readStoredStaff();
    const updated = staff.map((m) =>
      m.id === id ? { ...m, ...updates } : m
    );
    writeStoredStaff(updated);
    const result = updated.find((m) => m.id === id);
    if (!result) throw new Error("Staff member not found");
    return result;
  }

  const payload = await requestAdminJson<{ data: StaffMember }>(`/staff/${id}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
  return payload.data;
};

export const deleteAdminStaff = async (id: string): Promise<void> => {
  if (isAdminDataDummyEnabled()) {
    const staff = readStoredStaff().filter((m) => m.id !== id);
    writeStoredStaff(staff);
    return;
  }

  await requestAdminJson(`/staff/${id}`, { method: "DELETE" });
};

export const resendAdminInvite = async (id: string): Promise<{ message: string }> => {
  if (isAdminDataDummyEnabled()) {
    // Mock resend in dummy mode
    return { message: "Invitation resent successfully" };
  }

  const payload = await requestAdminJson<{ message: string }>(`/staff/${id}/resend-invite`, {
    method: "POST",
  });
  return payload;
};
