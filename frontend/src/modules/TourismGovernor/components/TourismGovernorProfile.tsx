import { UserType } from "@/modules/shared/types/User.types";
import { Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TourismGovernorProfile({ user }: { user: UserType }) {
  return (
    <div className="w-full space-y-8 pt-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-accent-dark-blue">
            Contact Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-slate-600">
              <Mail className="h-5 w-5 flex-shrink-0 text-primary-blue" />
              <span className="truncate">{user.email || "NA"}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
