import AdminNavbar from "@/components/admin/AdminNavbar";
import AdminFooter from "@/components/admin/AdminFooter";
import { Loader2 } from "lucide-react";

/**
 * Renders the full admin chrome (navbar + footer) with a centered spinner.
 * Used as the Suspense fallback for lazy admin routes so the layout never
 * collapses to a blank screen while a JS chunk is being fetched.
 */
const AdminShellFallback = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AdminNavbar />

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-primary/20 border-t-primary bg-background shadow-sm">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Loading…</p>
          </div>
        </div>
      </main>

      <AdminFooter />
    </div>
  );
};

export default AdminShellFallback;
