import axiosInstance from "../../../shared/services/axiosInstance";
import { useEffect, useState } from "react";

interface Activity {
  _id: string;
  booking_id: string;
  date: string;
  time: string;
  location: {
    name: string;
    latitude: number;
    longitude: number;
  };
  price: number;
  category: string;
  ratings: number;
  tags: {
    name: string;
    type: string;
    historical_period: string;
  }[];
  specialDiscounts: number;
  bookingOpen: boolean;
}

const formatText = (text: string) => {
  const maxLength = 5 * 3;
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
};

async function getMyActivities() {
  try {
    // Get the data via axios
    const resPromise = await axiosInstance.get("/users/getActivities");
    const responseData = resPromise?.data;

    // Log the raw response to debug the data structure
    console.log("Raw Response:", responseData);

    // Check if the expected properties exist
    const activityBookings = responseData?.data?.activities?.activity_bookings;
    if (!Array.isArray(activityBookings)) {
      console.error("activity_bookings is not an array:", activityBookings);
      return [];
    }

    // Transform the data into the desired format
    const res = activityBookings.map((booking) => {
      const { _id, activity } = booking;
      return {
        _id: activity?._id ?? "",
        booking_id: _id ?? "",
        datetime: activity?.datetime ?? "",
        location: activity?.location ?? {
          name: "N/A",
          latitude: 0,
          longitude: 0,
        },
        price: activity?.price ?? -1,
        category: activity?.category ?? "N/A",
        tags: activity?.tags ?? [],
        specialDiscounts: activity?.specialDiscounts ?? 0,
        bookingOpen: activity?.bookingOpen ?? false,
        created_by: activity?.created_by ?? "",
        createdAt: activity?.createdAt ?? "",
        updatedAt: activity?.updatedAt ?? "",
        __v: activity?.__v ?? 0,
        average_rating: activity?.average_rating ?? 0,
        reviews: activity?.reviews ?? [],
      };
    });

    // Format data into the Activity type
    const data: Activity[] = res.map((item) => {
      const datetime = item.datetime ?? "N/A";
      const date = new Date(datetime).toLocaleDateString();
      const time = new Date(datetime).toLocaleTimeString();

      const location = {
        name: item.location.name ?? "N/A",
        latitude: item.location.latitude ?? 0,
        longitude: item.location.longitude ?? 0,
      };

      const tags = item.tags?.map((tag) => tag.name) ?? [];
      const ratings = Math.floor(Math.random() * 5) + 1; // Mock ratings

      return {
        _id: item._id,
        booking_id: item.booking_id,
        date,
        time,
        location,
        ratings,
        price: item.price ?? -1,
        category: item.category ?? "N/A",
        tags,
        specialDiscounts: item.specialDiscounts ?? 0,
        bookingOpen: item.bookingOpen ?? false,
      };
    });

    data.sort((a, b) => a.price - b.price);

    return data;
  } catch (error) {
    console.error("Error fetching activities:", error);
    throw error;
  }
}

async function cancelBooking(activity_id: string, booking_id: string) {
  try {
    console.log("Cancelling booking:", activity_id, booking_id);

    const response = await axiosInstance.patch("/users/cancelActivityBooking", {
      activity_id,
      booking_id,
    });

    if (response.status === 200) {
      alert("Booking cancelled successfully!");
      return true;
    } else {
      alert(response.data.message || "Failed to cancel booking.");
      return false;
    }
  } catch (error: any) {
    console.error("Error cancelling booking:", error.message);
    alert("An error occurred while cancelling the booking.");
    return false;
  }
}

function ActivityCard({ activity }: { activity: Activity }) {
  const classes = "text-left text-[18px] text-ellipsis";

  const handleCancel = async () => {
    const confirmed = confirm("Are you sure you want to cancel this booking?");
    if (confirmed) {
      try {
        const success = await cancelBooking(activity._id, activity.booking_id);
        if (success) {
          window.location.reload(); // Reload to refresh data if successful
        } else {
          alert("Failed to cancel booking.");
        }
      } catch (error) {
        console.error("Error cancelling booking:", error);
        alert("An error occurred while cancelling the booking.");
      }
    }
  };

  return (
    <div className="grid min-h-[8rem] w-full grid-cols-9 gap-8 rounded-lg border border-gray-300 bg-card px-4 py-4">
      <div className={classes}>{activity.date}</div>
      <div className={classes}>{activity.time}</div>
      <div className={classes}>{activity.location.name}</div>
      <div className={classes}>{activity.price}</div>
      <div className={classes}>{activity.ratings}/5</div>
      <div className={classes}>{activity.category}</div>
      <div className={classes}>
        {activity.tags.map(formatText).join(", ") || "N/A"}
      </div>
      <div className="text-left text-base">{activity.specialDiscounts}</div>
      <div className="text-left text-base">
        {activity.bookingOpen ? "Open" : "Closed"}
      </div>
      <button
        className="col-span-9 justify-self-end rounded bg-red-500 px-3 py-2 text-white"
        onClick={handleCancel}
        // disabled={!activity.bookingOpen}
      >
        Cancel
      </button>
    </div>
  );
}

export function ActivityBookingList() {
  // get the data using axios
  const [data, setData] = useState<Activity[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // handle the sorting state
  const [sortingOption, setSortingOption] = useState<{
    isSortedByPrice: boolean;
    isAscending: boolean;
  }>({
    isSortedByPrice: true,
    isAscending: true,
  });

  // useEffect to get the data
  useEffect(() => {
    getMyActivities()
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  }, []);

  // handle the sorting
  useEffect(() => {
    if (!data) return;
    setData(
      [...data].sort((a, b) =>
        sortingOption.isSortedByPrice
          ? (a.price - b.price) * (sortingOption.isAscending ? 1 : -1)
          : (a.ratings - b.ratings) * (sortingOption.isAscending ? 1 : -1),
      ),
    );
  }, [sortingOption]);

  // handle the search and filter
  const [searchQuery, setSearchQuery] = useState<string>("");

  // the rest of the tool bar
  const [budget, setBudget] = useState<number | null>(null);
  const [date, setDate] = useState<string>("");
  const [ratings, setRatings] = useState<number | null>(null);

  const [filteredData, setFilteredData] = useState<Activity[]>([]);

  useEffect(() => {
    setFilteredData(
      data?.filter((item) => {
        // Check each filter criteria
        const matchesSearchQuery =
          searchQuery === "" ||
          item.date.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.tags.some((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase()),
          );

        const matchesBudget = budget === null || item.price <= budget;

        const matchesDate =
          date === "" || new Date(item.date) >= new Date(date);

        const matchesRatings = ratings === null || item.ratings >= ratings;

        // Return true if all conditions match
        return (
          matchesSearchQuery && matchesBudget && matchesDate && matchesRatings
        );
      }),
    );
  }, [searchQuery, budget, date, ratings, data]);

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* tool bar */}
      <div className="grid grid-cols-6 gap-6 p-4">
        <input
          type="text"
          placeholder="Search"
          className="h-full w-full rounded-md border border-gray-300 p-3"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <input
          type="number"
          placeholder="Max Budget"
          className="w-full rounded-md border border-gray-300 p-3"
          value={budget ?? ""}
          onChange={(e) =>
            setBudget(e.target.value ? parseInt(e.target.value) : null)
          }
        />
        <input
          type="date"
          className="w-full rounded-md border border-gray-300 p-3"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <input
          type="number"
          placeholder="Min Ratings"
          className="w-full rounded-md border border-gray-300 p-3"
          value={ratings ?? ""}
          onChange={(e) =>
            setRatings(e.target.value ? parseInt(e.target.value) : null)
          }
        />
        <button
          className="col-span-1 rounded-md bg-accent-gold p-3 font-semibold text-white"
          onClick={() => {
            setSortingOption({
              isSortedByPrice: !sortingOption.isSortedByPrice,
              isAscending: true,
            });
          }}
        >
          Sort by {sortingOption.isSortedByPrice ? "Price" : "Ratings"}
        </button>
        <button
          className="col-span-1 rounded-md bg-accent-gold p-3 font-semibold text-white"
          onClick={() =>
            setSortingOption({
              ...sortingOption,
              isAscending: !sortingOption.isAscending,
            })
          }
        >
          {sortingOption.isAscending ? "Ascending" : "Descending"}
        </button>
      </div>

      {/* header */}
      <div className="grid w-full grid-cols-9 rounded-lg border border-gray-300 bg-card px-4 py-4">
        <div className="text-left text-lg font-semibold">Date</div>
        <div className="text-left text-lg font-semibold">Time</div>
        <div className="text-left text-lg font-semibold">Location</div>
        <div className="text-left text-lg font-semibold">Price</div>
        <div className="text-left text-lg font-semibold">Ratings</div>
        <div className="text-left text-lg font-semibold">Category</div>
        <div className="text-left text-lg font-semibold">Tags</div>
        <div className="text-left text-lg font-semibold">Discount</div>
        <div className="text-left text-lg font-semibold">Booking</div>
      </div>

      {/* body */}
      {loading && (
        <div className="text-center text-xl font-semibold">Loading...</div>
      )}
      {error && (
        <div className="text-center text-xl font-semibold text-red-600">
          {error}
        </div>
      )}
      {filteredData ? (
        filteredData?.map((activity, index) => (
          <ActivityCard key={index} activity={activity} />
        ))
      ) : (
        <div className="text-center text-xl font-semibold">No data found</div>
      )}
    </div>
  );
}
