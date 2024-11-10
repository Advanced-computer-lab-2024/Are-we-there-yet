import { useContext } from "react";
import Greeting from "../../shared/components/Greeting";
import { ItineraryList } from "../components/ItineraryList";
import { UserContext } from "../store/user-context";

export function AllItineraries() {
  // define some stuff
  const { user } = useContext(UserContext);
  const sectionName: string = "Itineraries";

  return (
    <div className="mx-7 flex flex-col gap-4">
      {user.username && (
        <div className="w-fit-content my-4 rounded-lg bg-secondary-light_grey">
          <Greeting name={user.username} title={sectionName} signedIn />
        </div>
      )}
      {/* This is the main content */}
      <ItineraryList />
    </div>
  );
}
