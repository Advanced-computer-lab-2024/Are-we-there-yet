import Greeting from "@/modules/shared/components/Greeting";
import { UserContext } from "@/modules/shared/store/user-context";
import { useContext, useEffect, useRef, useState } from "react";
import TourGuidesTable from "../components/TourGuidesTable";
import Modal, { ModalRef } from "@/modules/shared/components/Modal";
import axiosInstance from "@/modules/shared/services/axiosInstance";
import ReviewsForm from "../components/ReviewsForm";
import toast from "react-hot-toast";
import ActivitiesTable from "../components/ActivitiesTable";
import ItineraryTable from "../components/ItineraryTable";
import ProductTable from "../components/ProductTable";

interface TourGuide {
    _id: string;
    username: string;
    email: string;
    mobile_number: string;
    years_of_experience?: number;
    average_rating?: number;
  }
  interface Activity {
    _id: string;
    name: string;
    datetime: Date;
    location: { name: string };
    price: number;
    category: { name: string };
    tags: { name: string }[];
    specialDiscounts: number;
    average_rating?: number;
  }
  interface Itinerary {
    _id: string;
    name: string;
    tags: { name: string }[];
    timeline: string;
    language: string;
    price: number;
    available_datetimes: Date[];
    created_by: { username: string };
    accessibility: {
      wheelchairAccessible: boolean;
      assistiveHearingDevices: boolean;
      visualAidSupport: boolean;
      serviceAnimalAllowed: boolean;
      accessibleParking: boolean;
    };
    average_rating?: number;
    pick_up_location: { name: string };
    drop_off_location: { name: string };
  }

interface Product{
    _id: string;
  name: string;
  description: string;
  price: number;
  available_quantity?: number;
  sales?: number;
  average_rating?: number;
  tags: { name: string }[];
}

export function History(){

const sectionName: string = 'History';
const [currentTab, setCurrentTab] = useState('tour guides');
const { user } = useContext(UserContext);
const [tourGuides, setTourGuides] = useState<TourGuide[]>([]);
const [activities, setActivities] = useState<Activity[]>([]);
const [itineraries, setItineraries] = useState<Itinerary[]>([]);
const [products, setProducts] = useState<Product[]>([]);
const [objectId, setObjectId] = useState<string>("");
const [objectType, setObjectType] = useState<string>("");
const modalRef = useRef<ModalRef>(null);
const [refresh, setRefresh] = useState(0); // State for refresh trigger

useEffect(() => {
  const fetchItineraries = async () => {
    try {
      const response = await axiosInstance.get("/users/getItineraries");
      console.log(response.data.data.itineraries.itinerary_bookings);

      // Get the itineraries from the booking data
      const itineraries = response.data.data.itineraries.itinerary_bookings
      .filter((booking) => booking.status === "attended")
      .map(
        (booking) => booking.itinerary
      );

      // Extract the user IDs (tour guide IDs) from the itineraries
      const tourGuideIds = itineraries.map((itinerary) => itinerary.created_by._id);
      console.log(tourGuideIds);
      // Set the itineraries in the state
      setItineraries(itineraries);

      // Fetch the tour guides based on the filtered IDs
      await fetchTourGuides(tourGuideIds); // Pass the filtered tour guide IDs to the function
    } catch (error) {
      console.error("Error fetching itineraries:", error);
    }
  };

  const fetchTourGuides = async (tourGuideIds) => {
    try {
      const response = await axiosInstance.get("/users/tourGuides");
      const filteredTourGuides = response.data.data.tourGuides.filter((tourGuide) =>
        tourGuideIds.includes(tourGuide._id) // Filter tour guides based on the extracted IDs
      );
      setTourGuides(filteredTourGuides); // Set the filtered tour guides in the state
      console.log(filteredTourGuides);
    } catch (error) {
      console.error("Error fetching tour guides:", error);
    }
  };

  const fetchActivities = async () => {
    try {
      const response = await axiosInstance.get("/users/getActivities");
      const activities = response.data.data.activities.activity_bookings
        .filter((booking) => booking.status === "attended")
        .map((booking) => booking.activity);

      setActivities(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
    }
  };
  const fetchProducts = async () => {
    try {
      const response = await axiosInstance.get("/products");
      console.log(response.data.data.products);
      const products = response.data.data.products;
      setProducts(products);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  }
  // Call all fetch functions inside useEffect
  fetchItineraries();
  fetchActivities();
  fetchProducts();
}, [refresh]);  // Only re-fetch when `refresh` changes


const handleCreateRating = async (modelType, modelId, review: { rating: number; comment: string }, ) => {
        try {
        console.log(modelType, modelId, review);
        modalRef.current?.close();
        const response = await axiosInstance.post("/reviews", {review, modelType, modelId});
        if(response.status === 200) {
        toast.success("Review submitted successfully!");
        }
        setRefresh((prev) => prev + 1); // Increment the refresh state
        } catch (error) {
        console.error("Error creating review:", error);
        toast.error("Error submitting review!");
        }
};

const handleOpenModal = (object: { _id: string; type: string }) => {
    setObjectId(object._id); 
    setObjectType(object.type);
    console.log(objectId); 
    console.log(objectType);
    modalRef.current?.open();
};

  const handleCloseModal = () => {
    modalRef.current?.close();
  };
// handle tab change
const handleTabChange = (tab: string) => {
  setCurrentTab(tab);
};

return (
  <div className="mx-7 flex flex-col gap-8">
    <div className="w-fit-content">
      <Greeting name={user.username} title={sectionName} signedIn />
    </div>
    {/* tab to choose which asset to view */}
    <div className="w-full h-fit border-2 flex flex-row justify-around bg-primary-green">
  <button
    className={`w-fit h-full my-4 self-center text-xl ${currentTab === 'activities' ? 'font-bold text-white' : 'text-gray-900'} hover:text-white`}
    onClick={() => handleTabChange('activities')}
  >
    Activities
  </button>
  <button
    className={`w-fit h-full my-4 self-center text-xl ${currentTab === 'itinerary' ? 'font-bold text-white' : 'text-gray-900'} hover:text-white`}
    onClick={() => handleTabChange('itinerary')}
  >
    Itineraries
  </button>
  <button
    className={`w-fit h-full my-4 self-center text-xl ${currentTab === 'tour guide' ? 'font-bold text-white' : 'text-gray-900'} hover:text-white`}
    onClick={() => handleTabChange('tour guide')}
  >
    Tour Guides
  </button>
  <button
    className={`w-fit h-full my-4 self-center text-xl ${currentTab === 'product' ? 'font-bold text-white' : 'text-gray-900'} hover:text-white`}
    onClick={() => handleTabChange('product')}
  >
    Products
  </button>
</div>
    <Modal ref={modalRef} onClose={handleCloseModal}>
        <ReviewsForm 
          objectType={objectType}
          objectId={objectId}
          initialValues={{ rating: 0, comment: "" }}
          onClose={handleCloseModal} 
          onSubmit={handleCreateRating}
        />
      </Modal>
    {/* This is the main content */}
    <div className="w-full h-fit border-black border-2 mb-16 flex flex-col bg-primary-green">
      {currentTab === 'activities' ? (
          <ActivitiesTable activities={activities} onEditRating={handleOpenModal} />
      ) : null}

      {currentTab === 'tour guide' ? (
          <TourGuidesTable tourGuides={tourGuides} onEditRating={handleOpenModal} />
      ) : null}

      {currentTab === 'itinerary' ? (
            <ItineraryTable itineraries={itineraries} onEditRating={handleOpenModal} />
      ) : null}
      
      {currentTab === 'product' ? (
            <ProductTable products={products} onEditRating={handleOpenModal} />
      ) : null}
    </div>
  </div>
);
}

export default History;