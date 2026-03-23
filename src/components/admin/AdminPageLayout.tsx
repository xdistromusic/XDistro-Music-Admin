import { ReactNode } from "react";
import AdminFooter from "@/components/admin/AdminFooter";
import AdminNavbar from "@/components/admin/AdminNavbar";

interface AdminPageLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

const AdminPageLayout = ({ title, subtitle, children }: AdminPageLayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AdminNavbar />

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
          <p className="text-gray-600">{subtitle}</p>
        </div>

        {children}
      </main>

      <AdminFooter />
    </div>
  );
};

export default AdminPageLayout;