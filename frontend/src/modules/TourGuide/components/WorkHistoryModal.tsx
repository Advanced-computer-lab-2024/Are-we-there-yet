import { WorkHistory } from "@/modules/shared/types/PrevWorks";
import { X } from "lucide-react";

export default function WorkHistoryModal({
  editingWorkHistory,
  setEditingWorkHistory,
  showWorkHistoryModal,
  setShowWorkHistoryModal,
  handleSaveWorkHistory,
}: {
  editingWorkHistory: WorkHistory | null;
  setEditingWorkHistory: (workHistory: WorkHistory | null) => void;
  showWorkHistoryModal: boolean;
  setShowWorkHistoryModal: (show: boolean) => void;
  handleSaveWorkHistory: (workHistory: WorkHistory) => void;
}) {
  return (
    <>
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 ${showWorkHistoryModal ? "" : "hidden"}`}
      >
        <div className="w-full max-w-2xl rounded-lg bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-accent-dark-blue">
              {editingWorkHistory
                ? "Edit Work Experience"
                : "Add Work Experience"}
            </h2>
            <button
              onClick={() => {
                setShowWorkHistoryModal(false);
                setEditingWorkHistory(null);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const workData = Object.fromEntries(
                formData.entries(),
              ) as unknown as WorkHistory;
              handleSaveWorkHistory(workData);

              // Reset form
              e.currentTarget.reset();
            }}
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Job Title
                </label>
                <input
                  type="text"
                  name="title"
                  defaultValue={editingWorkHistory?.title}
                  className="mt-1 w-full rounded-md border p-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Company
                </label>
                <input
                  type="text"
                  name="company"
                  defaultValue={editingWorkHistory?.company}
                  className="mt-1 w-full rounded-md border p-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Employment Type
                </label>
                <select
                  name="employmentType"
                  defaultValue={editingWorkHistory?.employmentType}
                  className="mt-1 w-full rounded-md border p-2"
                  required
                >
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="freelance">Freelance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  defaultValue={editingWorkHistory?.startDate.slice(0, 10)}
                  className="mt-1 w-full rounded-md border p-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  End Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  defaultValue={editingWorkHistory?.endDate.slice(0, 10)}
                  className="mt-1 w-full rounded-md border p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  defaultValue={editingWorkHistory?.location}
                  className="mt-1 w-full rounded-md border p-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Location Type
                </label>
                <select
                  name="locationType"
                  defaultValue={editingWorkHistory?.locationType}
                  className="mt-1 w-full rounded-md border p-2"
                  required
                >
                  <option value="on-site">On-site</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="remote">Remote</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  name="description"
                  defaultValue={editingWorkHistory?.description || ""}
                  className="mt-1 h-32 w-full rounded-md border p-2"
                  required
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowWorkHistoryModal(false);
                  setEditingWorkHistory(null);
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-accent-dark-blue px-4 py-2 text-white hover:bg-accent-dark-blue/80"
              >
                {editingWorkHistory ? "Update" : "Add"} Experience
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
