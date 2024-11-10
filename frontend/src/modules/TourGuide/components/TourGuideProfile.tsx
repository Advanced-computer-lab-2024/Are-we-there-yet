import { WorkHistory } from "@/modules/shared/types/PrevWorks";
import { UserType } from "@/modules/shared/types/User.types";
import {
  Building2,
  Calendar,
  Clock,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
} from "lucide-react";

export default function TourGuideProfile({
  user,
  setEditingWorkHistory,
  setShowWorkHistoryModal,
  handleEditWorkHistory,
}: {
  user: UserType;
  setEditingWorkHistory: (workHistory: WorkHistory | null) => void;
  setShowWorkHistoryModal: (show: boolean) => void;
  handleEditWorkHistory: (workHistory: WorkHistory) => void;
}) {
  return (
    <div className="grid flex-1 grid-cols-1 gap-x-8 gap-y-6 pt-10 md:grid-cols-2">
      <div className="space-y-6">
        <h3 className="border-b border-secondary-light_grey pb-2 font-semibold text-accent-dark-blue">
          Guide Information
        </h3>
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-slate-600">
            <Mail className="h-5 w-5 flex-shrink-0 text-primary-blue" />
            <span className="truncate">{user.email || "NA"}</span>
          </div>
          <div className="flex items-center gap-3 text-slate-600">
            <Phone className="h-5 w-5 flex-shrink-0 text-primary-blue" />
            <span>{user.mobile_number || "NA"}</span>
          </div>
          <div className="flex items-center gap-3 text-slate-600">
            <Clock className="h-5 w-5 flex-shrink-0 text-primary-blue" />
            <span>
              {user.years_of_experience || "NA"}
              {user.years_of_experience ? " years of experience" : ""}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-secondary-light_grey pb-2">
          <h3 className="font-semibold text-accent-dark-blue">Work History</h3>
          <button
            onClick={() => {
              setEditingWorkHistory(null);
              setShowWorkHistoryModal(true);
            }}
            className="flex items-center gap-1 text-sm text-primary-blue hover:text-primary-blue/80"
          >
            <Plus className="h-4 w-4" />
            Add Experience
          </button>
        </div>

        <div className="max-h-[410px] space-y-6 overflow-y-auto">
          {user.previous_work?.map((work, index) => (
            <div key={index} className="rounded-lg border border-gray-200 p-4">
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <h4 className="font-medium text-accent-dark-blue">
                    {work.title}
                  </h4>
                  <p className="text-sm text-gray-600">{work.company}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditWorkHistory(work)}
                    className="text-gray-500 hover:text-primary-blue"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-2 space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  <span>{work.employmentType}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Date(work.startDate).toLocaleDateString()} -
                    {work.endDate
                      ? new Date(work.endDate).toLocaleDateString()
                      : "Present"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {work.location} ({work.locationType})
                  </span>
                </div>

                {work.description && (
                  <p className="mt-2 whitespace-pre-wrap text-gray-700">
                    {work.description}
                  </p>
                )}
              </div>
            </div>
          ))}

          {(!user.previous_work || user.previous_work.length === 0) && (
            <div className="text-center text-gray-500">
              No work experience added yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
