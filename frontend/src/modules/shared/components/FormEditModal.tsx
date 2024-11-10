import { forwardRef, useContext, useImperativeHandle, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogDescription } from "@radix-ui/react-dialog";
import { Eye, EyeOff } from "lucide-react";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import { UserContext } from "../store/user-context";

interface EditModalProps {
  fields: string[];
  onSave: (data: Record<string, string>) => void;
  onDeleteAccount: () => Promise<void> | void;
}

export type formModalRef = {
  open: (initialData?: Record<string, string>) => void;
  close: () => void;
};

const EditModal = forwardRef(
  ({ fields, onSave, onDeleteAccount }: EditModalProps, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState<Record<string, string>>({});
    const [showPassword, setShowPassword] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [, setIsDeleting] = useState(false);
    const { user } = useContext(UserContext);

    useImperativeHandle(ref, () => ({
      open: (initialData = {}) => {
        setFormData(initialData);
        setIsOpen(true);
        setShowPassword(false);
      },
      close: () => {
        setIsOpen(false);
        setShowPassword(false);
      },
    }));

    const handleInputChange = (field: string, value: string) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

    const handleSave = () => {
      onSave(formData);
      setIsOpen(false);
    };

    const handleClose = () => {
      setIsOpen(false);
    };

    const handleDeleteAccount = async () => {
      setIsDeleting(true);
      setIsDeleteModalOpen(false);
      setIsOpen(false);
      await onDeleteAccount();
    };

    const renderField = (field: string) => {
      if (field === "Password") {
        const hasPassword = formData[field]?.length > 0;

        return (
          <div className="relative">
            <Input
              id={field}
              type={showPassword ? "text" : "password"}
              value={formData[field] || ""}
              onChange={(e) => handleInputChange(field, e.target.value)}
              placeholder={`Enter new password`}
              className="h-12 border-slate-200 bg-white pr-10 text-base placeholder:text-slate-400 focus:ring-2 focus:ring-blue-100"
            />
            {hasPassword && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            )}
          </div>
        );
      }

      return (
        <Input
          id={field}
          disabled={field === "Date of Birth" || field === "Wallet"}
          value={formData[field] || ""}
          type="text"
          onChange={(e) => handleInputChange(field, e.target.value)}
          placeholder={`Enter ${
            field === "YearsOfExperience"
              ? "Years of Experience"
              : field === "loyaltyPoints"
                ? "Loyalty Points"
                : field
          }`}
          className="h-12 border-slate-200 bg-white text-base placeholder:text-slate-400 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-500"
        />
      );
    };

    return (
      <>
        <Dialog open={isOpen} onOpenChange={handleClose}>
          <DialogContent className="border-none bg-white shadow-xl sm:max-w-3xl">
            <DialogHeader className="border-b border-slate-100 pb-6">
              <DialogTitle className="text-3xl font-bold text-slate-800">
                Edit Profile
              </DialogTitle>
              <DialogDescription className="mt-2 text-base text-slate-500">
                Update your personal information below
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 px-2 py-8">
              {fields.map((field) => (
                <div key={field} className="space-y-2">
                  <Label
                    htmlFor={field}
                    className="text-sm font-medium text-slate-700"
                  >
                    {field === "YearsOfExperience"
                      ? "Years of Experience"
                      : field === "MobileNumber"
                        ? "Mobile Number"
                        : field === "loyaltyPoints"
                          ? "Loyalty Points"
                          : field}
                  </Label>
                  {renderField(field)}
                </div>
              ))}
            </div>

            <DialogFooter className="border-t border-slate-100 pt-6">
              <div className="flex w-full items-center justify-between">
                {!user.deletionRequested && (
                  <Button
                    variant="outline"
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="h-12 border-red-200 px-6 text-base text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    Delete Account
                  </Button>
                )}
                <div className="flex">
                  <Button
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                    className="h-12 border-slate-200 px-6 text-base hover:bg-slate-50 hover:text-slate-800"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    className="ml-3 h-12 bg-accent-dark-blue px-6 text-base text-white hover:bg-accent-dark-blue/80"
                  >
                    Save changes
                  </Button>
                </div>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirmDelete={handleDeleteAccount}
        />
      </>
    );
  },
);

EditModal.displayName = "EditModal";

export default EditModal;
