import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ActionConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  isConfirming?: boolean;
  children?: React.ReactNode;
}

const ActionConfirmationModal = ({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  isConfirming = false,
  children,
}: ActionConfirmationModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {children && <div className="py-4">{children}</div>}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isConfirming}>
            {cancelLabel}
          </Button>
          <Button variant="destructive" onClick={() => void onConfirm()} disabled={isConfirming}>
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ActionConfirmationModal;
