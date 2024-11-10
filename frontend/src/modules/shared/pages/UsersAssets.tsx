import { useState } from "react";
import Greeting from "../../shared/components/Greeting";
import { ActivityList } from "../components/ActivityList";
import { ItineraryList } from "../components/ItineraryList";
import { MuseumList } from "../components/MuseumList";

export function UsersAssets() {
  // define some stuff
  const sectionName: string = "Assets";
  const [currentTab, setCurrentTab] = useState("activities");

  // handle tab change
  const handleTabChange = (tab: string) => {
    setCurrentTab(tab);
  };

  return (
    <div className="container mx-auto max-w-7xl space-y-8 px-4 py-8">
      {/* Header Section */}
      <div className="space-y-2">
        <Greeting name="John Doe" title={sectionName} signedIn />
      </div>

      {/* Navigation Tabs */}
      <div className="rounded-lg bg-secondary-light_grey p-1">
        <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
          {[
            { id: "activities", label: "Activities" },
            { id: "itinerary", label: "Itineraries" },
            { id: "museum", label: "Museum and Historical Places" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`w-full rounded-lg px-6 py-3 text-body transition-all duration-200 sm:w-auto ${
                currentTab === tab.id
                  ? "bg-accent-dark-blue font-headline text-secondary-white shadow-lg"
                  : "bg-transparent text-accent-dark-blue hover:bg-primary-blue/10"
              } `}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="min-h-[500px] rounded-lg border border-borders-primary bg-secondary-white p-6 shadow-lg">
        <div className="h-full">
          {currentTab === "activities" && (
            <div className="h-full">
              <ActivityList />
            </div>
          )}
          {currentTab === "itinerary" && (
            <div className="h-full">
              <ItineraryList />
            </div>
          )}
          {currentTab === "museum" && (
            <div className="h-full">
              <MuseumList />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
