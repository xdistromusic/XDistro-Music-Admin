import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/lib/toast";
import { User, Mail, Shield, X } from "lucide-react";
import { AdminRole, AdminPermission, CreateStaffInput, StaffMember, ROLE_DEFAULT_PERMISSIONS } from "@/types/admin";

interface StaffMemberFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateStaffInput) => void;
  initialData?: StaffMember | null;
  mode: 'add' | 'edit';
}

const AVAILABLE_ROLES: { value: AdminRole; label: string }[] = [
  { value: 'super_admin',      label: 'Super Admin' },
  { value: 'admin',            label: 'Admin' },
  { value: 'manager',         label: 'Manager' },
  { value: 'support_agent',   label: 'Support Agent' },
  { value: 'content_reviewer', label: 'Content Reviewer' },
];

const AVAILABLE_PERMISSIONS: AdminPermission[] = [
  'dashboard', 'users', 'releases', 'artists', 'royalties',
  'royalty_requests', 'takedown_requests', 'settings',
];

const StaffMemberFormModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData, 
  mode 
}: StaffMemberFormModalProps) => {
  const [formData, setFormData] = useState<CreateStaffInput>({
    name: '',
    email: '',
    role: 'support_agent',
    permissions: []
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableRoles = AVAILABLE_ROLES;
  const availablePermissions = AVAILABLE_PERMISSIONS;

  // Reset form when modal opens/closes or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && initialData) {
        setFormData({
          name: initialData.name,
          email: initialData.email,
          role: initialData.role,
          permissions: initialData.permissions || []
        });
      } else {
        setFormData({
          name: '',
          email: '',
          role: 'support_agent',
          permissions: []
        });
      }
      setErrors({});
    }
  }, [isOpen, initialData, mode]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.role.trim()) {
      newErrors.role = 'Role is required';
    }

    if (formData.permissions.length === 0) {
      newErrors.permissions = 'At least one permission is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSubmit(formData);
      onClose();
      
      toast.success(
        mode === 'add' 
          ? `Staff member ${formData.name} has been added successfully`
          : `Staff member ${formData.name} has been updated successfully`
      );
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: "name" | "email" | "role", value: string) => {
    if (field === "role") {
      const role = value as AdminRole;
      setFormData((prev) => ({
        ...prev,
        role,
        // Keep permissions aligned to role defaults unless manually changed afterward.
        permissions: [...ROLE_DEFAULT_PERMISSIONS[role]],
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePermissionToggle = (permission: AdminPermission) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
    // Clear permission error when user selects a permission
    if (errors.permissions) {
      setErrors(prev => ({ ...prev, permissions: '' }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-onerpm-orange" />
            {mode === 'add' ? 'Add Staff Member' : 'Edit Staff Member'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Full Name
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="name"
                type="text"
                placeholder="Enter full name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`pl-10 ${errors.name ? 'border-red-500' : ''}`}
                disabled={isSubmitting}
              />
            </div>
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                disabled={isSubmitting}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="text-sm font-medium">
              Role
            </Label>
            <div className="relative">
              <Shield className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <select
                id="role"
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                className={`w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-onerpm-orange focus:border-transparent ${errors.role ? 'border-red-500' : ''}`}
                disabled={isSubmitting}
              >
                {availableRoles.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            {errors.role && (
              <p className="text-sm text-red-600">{errors.role}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Permissions
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {availablePermissions.map(permission => (
                <label
                  key={permission}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.permissions.includes(permission)}
                    onChange={() => handlePermissionToggle(permission)}
                    className="rounded border-gray-300 text-onerpm-orange focus:ring-onerpm-orange"
                    disabled={isSubmitting}
                  />
                  <span className="text-sm capitalize">{permission}</span>
                </label>
              ))}
            </div>
            {errors.permissions && (
              <p className="text-sm text-red-600">{errors.permissions}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-onerpm-orange hover:bg-onerpm-orange/90"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  {mode === 'add' ? 'Adding...' : 'Updating...'}
                </>
              ) : (
                mode === 'add' ? 'Add Staff Member' : 'Update Staff Member'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StaffMemberFormModal;