import { UserType } from "@/modules/shared/types/User.types";
import { Info, Mail } from "lucide-react";

export default function SellerProfile({ user }: { user: UserType }) {
  return (
    <div className="grid flex-1 grid-cols-1 gap-x-8 gap-y-6 pt-10 md:grid-cols-2">
      <div className="space-y-6">
        <h3 className="border-b border-secondary-light_grey pb-2 font-semibold text-accent-dark-blue">
          Contact Details
        </h3>
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-slate-600">
            <Mail className="h-5 w-5 flex-shrink-0 text-primary-blue" />
            <span className="truncate">{user.email || "NA"}</span>
          </div>
          <div className="flex items-center gap-3 text-slate-600">
            <Info className="h-5 w-5 flex-shrink-0 text-primary-blue" />
            <span>{user.description || "NA"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
