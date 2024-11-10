import axiosInstance from "../services/axiosInstance";
import { useState, useEffect, useContext } from "react";
import { UserContext } from "../../shared/store/user-context";
import toast from "react-hot-toast";

async function getMyItineraries() {
  try {
    // get the data via axios
    const resPromise = await axiosInstance.get("/itineraries/get");

    // format the data
    const res = await resPromise.data;
    const tempData: Itinerary[] = await res.data.itineraries.map(
      (item: any) => {
        const id = item._id;
        const name = item.name === null ? "N/A" : item.name;
        const category = item.category === null ? "N/A" : item.category;
        const tags = item.tags === null ? [] : item.tags.map((tag) => tag.name);
        let activities = [];
        activities = item.activities.map((activity) => {
          if (activity.activity === null) {
            return {
              date: "N/A",
              time: "N/A",
              location: "N/A",
              price: 0,
            };
          }
          return {
            date: activity.activity.date,
            time: activity.activity.time,
            location: activity.activity.location.name,
            price: activity.price,
          };
        });
        const language = item.language === null ? "N/A" : item.language;
        const price = item.price === null ? "N/A" : item.price;
        const availableDateTimes = item.available_datetimes.map(
          (date: string) => ({
            date: date,
            time: date,
          }),
        );
        const accessibilities = item.accessibility;
        const pickupLocation = item.pick_up_location.name;
        const dropoffLocation = item.drop_off_location.name;
        const rating = Math.floor(Math.random() * 5) + 1; // TODO: replace with actual rating

        return {
          id,
          name,
          category,
          rating,
          tags,
          activities,
          language,
          price,
          availableDateTimes,
          accessibilities,
          pickupLocation,
          dropoffLocation,
        };
      },
    );

    // sort the data on rating
    tempData.sort((a, b) => b.rating - a.rating); // TODO: replace with actual rating

    return await tempData;
  } catch (error) {
    console.error("Error fetching user", error);
    throw error;
  }
}

// helper functions
const formatDateTime = (date: string, time: string) => {
  if (date === "N/A" || time === "N/A") {
    return "N/A";
  }
  const parsedDate = new Date(date);
  const parsedTime = new Date(time);
  const formattedDate = parsedDate.toLocaleDateString("en-GB");
  const formattedTime = parsedTime.toLocaleTimeString("en-GB");
  return `${formattedDate} ${formattedTime}`;
};

const formatLocation = (location: string) => {
  const maxLength = 12;
  if (location.length > maxLength) {
    return `${location.substring(0, maxLength)}...`;
  }
  return location;
};
const formatActivity = (activity: Activity) => {
  return `${formatDateTime(activity.date, activity.time)} - ${formatLocation(activity.location)}`;
};

const formatDate = (date: string) => {
  const parsedDate = new Date(date);
  return parsedDate.toLocaleDateString("en-GB");
};

const formatTime = (time: string) => {
  const parsedTime = new Date(time);
  return parsedTime.toLocaleTimeString("en-GB");
};

// main components
function ItineraryModal({
  itinerary,
  onClose,
}: {
  itinerary: Itinerary;
  onClose: () => void;
}) {
  // states for the animation
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const { user } = useContext(UserContext);
  const isUserTourist = user?.account_type === "Tourist" || false;

  // handle the close button
  useEffect(() => {
    // Trigger opening animation when component mounts
    setIsVisible(true);
  }, []);

  const handleModalClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 300); // Match timeout to the animation duration
  };

  // Animation styles
  const modalOverlayStyle = {
    transition: "opacity 0.3s ease-in-out",
    opacity: isVisible && !isClosing ? 1 : 0,
  };

  const modalContentStyle = {
    transition: "transform 0.3s ease-in-out, opacity 0.3s ease-in-out",
    transform: isVisible && !isClosing ? "scale(1)" : "scale(0.95)",
    opacity: isVisible && !isClosing ? 1 : 0,
  };

  // function to handle booking
  const handleBooking = async () => {
    try {
      // init body
      const body = {
        itinerary_id: itinerary.id,
      };

      // make the booking
      const resPromise = await axiosInstance.post(
        "/itineraries/bookings",
        body,
      );
      const res = await resPromise.data;

      // show success message
      toast.success(res.message);
    } catch (error) {
      toast.error(`Error booking itinerary: ${error.message}`);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      style={modalOverlayStyle}
    >
      <div
        className="relative h-auto w-full max-w-[85vw] rounded-lg border border-borders-primary bg-secondary-white p-8 shadow-lg"
        style={modalContentStyle}
      >
        {/* Close button */}
        <button
          onClick={handleModalClose}
          className="absolute right-4 top-4 rounded-full p-2 text-accent-dark-blue transition-colors hover:bg-secondary-light_grey"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="space-y-8">
          {/* Itinerary name */}
          <div className="inline-block">
            <h2 className="text-headline font-headline text-accent-dark-blue">
              {itinerary.name}
            </h2>
            <div className="mt-2 h-1 w-full rounded-full bg-primary-blue"></div>
          </div>

          {/* Itinerary details */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4 lg:grid-rows-2">
            {/* Basic Info */}
            <div className="space-y-6 rounded-lg bg-secondary-light_grey p-6 lg:col-span-2 lg:row-span-2">
              {[
                { label: "Language", value: itinerary.language },
                { label: "Price", value: itinerary.price },
                {
                  label: "Dropoff Location",
                  value: itinerary.dropoffLocation,
                },
                { label: "Pickup Location", value: itinerary.pickupLocation },
                { label: "Category", value: itinerary.category },
                { label: "Tags", value: itinerary.tags.join(", ") },
                { label: "Rating", value: `${itinerary.rating}/5` },
                {
                  label: "Accessibilities",
                  value: itinerary.accessibilities ? "Yes" : "No",
                },
              ].map((item, index) => (
                <div key={index} className="space-y-1">
                  <div className="text-sub-headings font-sub_headings text-accent-dark-blue">
                    {item.label}
                  </div>
                  <div className="text-body text-text-primary">
                    {item.value}
                  </div>
                </div>
              ))}
            </div>

            {/* booking */}
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-sub-headings font-sub_headings text-accent-dark-blue">
                  Book Now
                </h3>
                <div className="text-body text-text-primary">
                  Book this itinerary now to secure your spot
                </div>
              </div>
              {isUserTourist ? (
                <button
                  onClick={handleBooking}
                  className="hover:bg-primary-dark-blue focus:ring-primary-dark-blue h-12 w-full rounded-lg bg-primary-blue font-semibold text-secondary-white transition-colors focus:outline-none focus:ring-2"
                >
                  Book Now
                </button>
              ) : (
                <div className="text-body text-text-primary">
                  You need to be a tourist to book this itinerary
                </div>
              )}
            </div>

            {/* Activities */}
            <div className="space-y-4">
              <h3 className="text-sub-headings font-sub_headings text-accent-dark-blue">
                Activities
              </h3>
              {itinerary.activities.length !== 0 ? (
                <div className="overflow-hidden rounded-lg border border-borders-primary">
                  <table className="w-full">
                    <thead className="bg-primary-blue text-secondary-white">
                      <tr>
                        <th className="p-4 text-left">DateTime</th>
                        <th className="p-4 text-left">Location</th>
                        <th className="p-4 text-left">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {itinerary.activities.map((activity, index) => (
                        <tr
                          key={index}
                          className="border-t border-borders-primary transition-colors hover:bg-secondary-light_grey"
                        >
                          <td className="p-4">
                            {formatDateTime(activity.date, activity.time)}
                          </td>
                          <td className="p-4">
                            {formatLocation(activity.location)}
                          </td>
                          <td className="p-4">{activity.price}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="rounded-lg bg-secondary-light_grey p-4 text-center text-body">
                  No activities available
                </div>
              )}
            </div>

            {/* Date and Time */}
            <div className="space-y-4">
              <h3 className="text-sub-headings font-sub_headings text-accent-dark-blue">
                Available Dates & Times
              </h3>
              {itinerary.availableDateTimes.length !== 0 ? (
                <div className="overflow-hidden rounded-lg border border-borders-primary">
                  <table className="w-full">
                    <thead className="bg-primary-green text-secondary-white">
                      <tr>
                        <th className="p-4 text-left">Date</th>
                        <th className="p-4 text-left">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {itinerary.availableDateTimes.map((dateTime, index) => (
                        <tr
                          key={index}
                          className="border-t border-borders-primary transition-colors hover:bg-secondary-light_grey"
                        >
                          <td className="p-4">{formatDate(dateTime.date)}</td>
                          <td className="p-4">{formatTime(dateTime.time)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="rounded-lg bg-secondary-light_grey p-4 text-center text-body">
                  No available dates and times
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ItineraryCard({
  itinerary,
  onCardClick,
}: {
  itinerary: Itinerary;
  onCardClick: () => void;
}) {
  return (
    <div
      className="h-full w-full cursor-pointer rounded-lg border border-gray-200 bg-white shadow-lg transition-transform duration-200 hover:scale-105 hover:shadow-xl"
      onClick={onCardClick}
    >
      {/* Itinerary Name */}
      <div className="p-4 text-center text-lg font-semibold text-accent-dark-blue">
        {itinerary.name}
      </div>

      {/* Activity List */}
      <div className="grid gap-3 px-6 pb-4 pt-2">
        {itinerary.activities.length !== 0 ? (
          itinerary.activities.slice(0, 3).map((activity, index) => (
            <div className="text-center text-gray-600" key={index}>
              {formatActivity(activity)}
            </div>
          ))
        ) : (
          <div className="text-center italic text-gray-500">No activities</div>
        )}
      </div>
    </div>
  );
}

export function ItineraryList() {
  const [selectedItinerary, setSelectedItinerary] = useState<Itinerary | null>(
    null,
  );
  const handleCardClick = (itinerary: Itinerary) => {
    setSelectedItinerary(itinerary);
  };
  const handleCloseModal = () => {
    setSelectedItinerary(null);
  };

  // get the data
  const [data, setData] = useState<Itinerary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    getMyItineraries()
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  }, []);

  // handle the search and filter
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [budget, setBudget] = useState<number | null>(null);
  const [date, setDate] = useState<string>("");
  const [ratings, setRatings] = useState<number | null>(null);

  const [filteredData, setFilteredData] = useState<Activity[]>([]);

  useEffect(() => {
    setFilteredData(
      data.filter((item) => {
        // Check each filter criteria
        const matchesSearchQuery =
          searchQuery === "" ||
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.tags.some((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase()),
          );

        // handle the budget
        const matchesBudget = budget === null || item.price <= budget;

        // handle the date
        const matchesDate =
          date === "" ||
          item.availableDateTimes.some((dateTime) => {
            const formattedDate = new Date(dateTime.date).toLocaleDateString(
              "en-GB",
            );
            return formattedDate === new Date(date).toLocaleDateString("en-GB");
          });

        // handle the ratings
        const matchesRatings = ratings === null || item.rating >= ratings;

        // Return true if all conditions match
        return (
          matchesSearchQuery && matchesBudget && matchesDate && matchesRatings
        );
      }),
    );
  }, [searchQuery, budget, date, ratings, data]);

  return (
    <div className="space-y-8">
      {loading && (
        <>
          {/* Toolbar */}
          <div className="rounded-lg bg-secondary-light_grey p-8 shadow-lg">
            <div className="text-headline font-headline text-accent-dark-blue">
              Loading...
            </div>
          </div>

          {/* Results */}
          <div className="space-y-4 rounded-lg bg-secondary-white p-8 shadow-lg">
            <h2 className="text-sub-headings font-sub_headings text-accent-dark-blue">
              Available Itineraries
            </h2>
            <div className="flex h-64 items-center justify-center">
              <div className="text-headline font-headline text-accent-dark-blue">
                Loading...
              </div>
            </div>
          </div>
        </>
      )}

      {error && (
        <div className="flex h-64 items-center justify-center rounded-lg bg-destructive/10 p-6">
          <div className="text-headline font-headline text-destructive">
            {error}
          </div>
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-8">
          {/* Toolbar */}
          <div className="rounded-lg bg-secondary-light_grey p-8 shadow-lg">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {/* Search Input */}
              <div className="space-y-2">
                <label className="text-input_or_label font-sub_headings text-accent-dark-blue">
                  Search
                </label>
                <input
                  type="text"
                  placeholder="Search itineraries..."
                  className="h-12 w-full rounded-lg border border-borders-primary bg-secondary-white p-4 text-body shadow-inner transition-colors placeholder:text-muted-foreground focus:border-primary-blue focus:outline-none focus:ring-2 focus:ring-primary-blue/50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Budget Input */}
              <div className="space-y-2">
                <label className="text-input_or_label font-sub_headings text-accent-dark-blue">
                  Max Budget
                </label>
                <input
                  type="number"
                  placeholder="Enter maximum budget"
                  className="h-12 w-full rounded-lg border border-borders-primary bg-secondary-white p-4 text-body shadow-inner transition-colors placeholder:text-muted-foreground focus:border-primary-blue focus:outline-none focus:ring-2 focus:ring-primary-blue/50"
                  value={budget ?? ""}
                  onChange={(e) =>
                    setBudget(e.target.value ? parseInt(e.target.value) : null)
                  }
                />
              </div>

              {/* Date Input */}
              <div className="space-y-2">
                <label className="text-input_or_label font-sub_headings text-accent-dark-blue">
                  Date
                </label>
                <input
                  type="date"
                  className="h-12 w-full rounded-lg border border-borders-primary bg-secondary-white p-4 text-body shadow-inner transition-colors placeholder:text-muted-foreground focus:border-primary-blue focus:outline-none focus:ring-2 focus:ring-primary-blue/50"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              {/* Ratings Input */}
              <div className="space-y-2">
                <label className="text-input_or_label font-sub_headings text-accent-dark-blue">
                  Min Rating
                </label>
                <input
                  type="number"
                  placeholder="Minimum rating (1-5)"
                  min="1"
                  max="5"
                  className="h-12 w-full rounded-lg border border-borders-primary bg-secondary-white p-4 text-body shadow-inner transition-colors placeholder:text-muted-foreground focus:border-primary-blue focus:outline-none focus:ring-2 focus:ring-primary-blue/50"
                  value={ratings ?? ""}
                  onChange={(e) =>
                    setRatings(e.target.value ? parseInt(e.target.value) : null)
                  }
                />
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-4 rounded-lg bg-secondary-white p-8 shadow-lg">
            <h2 className="text-sub-headings font-sub_headings text-accent-dark-blue">
              Available Itineraries
            </h2>

            {filteredData.length === 0 ? (
              <div className="flex h-64 items-center justify-center rounded-lg bg-secondary-light_grey">
                <p className="text-body text-muted-foreground">
                  No itineraries found matching your criteria
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredData.map((itinerary, index) => (
                  <ItineraryCard
                    key={index}
                    itinerary={itinerary}
                    onCardClick={() => handleCardClick(itinerary)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Modal */}
          {selectedItinerary && (
            <ItineraryModal
              itinerary={selectedItinerary}
              onClose={handleCloseModal}
            />
          )}
        </div>
      )}
    </div>
  );
}
