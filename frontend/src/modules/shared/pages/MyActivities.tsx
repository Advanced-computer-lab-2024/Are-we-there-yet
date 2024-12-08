import { ActivityList } from "../components/ActivityList";

export function AllActivities() {
  return (
    <div className="mx-7 flex flex-col gap-4">
      {/* This is the main content */}
      <ActivityList />
    </div>
  );
}
