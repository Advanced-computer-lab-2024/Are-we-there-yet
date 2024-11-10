import { useContext } from "react";
import Greeting from "../../../shared/components/Greeting";
import { ActivityBookingList } from "../../components/BookingLists/ActivityBookingList";
import { UserContext } from "../../../shared/store/user-context";

export function ActivityBookings() {
  // define some stuff
  const { user } = useContext(UserContext);
  const sectionName: string = "Activity Bookings";

  return (
    <div className="mx-7 flex flex-col gap-4">
      {user.username && (
        <div className="w-fit-content">
          <Greeting name={user.username} title={sectionName} signedIn />
        </div>
      )}
      {/* This is the main content */}
      <div className="mb-16 flex h-fit w-full flex-col rounded-lg border-2 border-borders-primary">
        <ActivityBookingList />
      </div>
    </div>
  );
}
