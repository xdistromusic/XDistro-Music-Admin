import { StaffMember } from "@/types/admin";

export const mockAdminStaff: StaffMember[] = [
  {
    id: "staff-1",
    name: "John Admin",
    email: "john@xdistromusic.com",
    role: "super_admin",
    permissions: ["dashboard", "users", "releases", "artists", "royalties", "royalty_requests", "takedown_requests", "settings"],
    status: "active",
    createdAt: "2024-01-15",
    lastLogin: "2024-03-15",
  },
  {
    id: "staff-2",
    name: "Sarah Manager",
    email: "sarah@xdistromusic.com",
    role: "manager",
    permissions: ["dashboard", "users", "releases", "royalties", "royalty_requests"],
    status: "active",
    createdAt: "2024-02-01",
    lastLogin: "2024-03-14",
  },
  {
    id: "staff-3",
    name: "Mike Support",
    email: "mike@xdistromusic.com",
    role: "support_agent",
    permissions: ["dashboard", "users"],
    status: "active",
    createdAt: "2024-02-15",
    lastLogin: "2024-03-13",
  },
  {
    id: "staff-4",
    name: "Lisa Reviewer",
    email: "lisa@xdistromusic.com",
    role: "content_reviewer",
    permissions: ["dashboard", "releases", "takedown_requests"],
    status: "inactive",
    createdAt: "2024-03-01",
    lastLogin: "2024-03-10",
  },
];
