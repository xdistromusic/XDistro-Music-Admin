import { Loader2 } from "lucide-react";

interface AdminPageLoaderProps {
  message: string;
}

const AdminPageLoader = ({ message }: AdminPageLoaderProps) => {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6 py-10">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-primary/20 border-t-primary bg-background shadow-sm">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">{message}</p>
      </div>
    </div>
  );
};

export default AdminPageLoader;
