import axiosInstance from "../services/axiosInstance";
import { useState, useEffect, useRef } from "react";
import { Clock, CreditCard, MapPin, Share } from "lucide-react";
import ShareLink from "./ShareLink";
import { ModalRef } from "./Modal";
import Modal from "./Modal";
import defaultPhoto from "../../Museums/assets/defaultPhoto.png";
import toast from "react-hot-toast";
import GenericCard from "../GenericCard/GenericCard";
import Map from "./Map";
// data
interface Museum {
  id: string;
  name: string;
  tags: string[];
  description: string;
  category: string;
  pictures: string[];
  location: {
    name: string;
    latitude: number;
    longitude: number;
  };
  opening_hours: string;
  ticket_prices: {
    foreigner: number;
    native: number;
    student: number;
  };
}

interface Tag {
  id: string;
  name: string;
  type: string;
  historical_period: string;
}

const defaultImage = defaultPhoto; // Default image if no valid pictures

async function getMuseums() {
  try {
    // fetch the data
    const response = await axiosInstance.get("/museums/getall");

    // format the data
    const tempData: Museum[] = response.data.data.museums.map((item: any) => {
      const id = item._id;
      const name = item.name ?? "N/A";

      let tags = item.tags ?? [];
      tags = tags.map((tag: any) => tag.name ?? "N/A");

      const description = item.description ?? "N/A";
      const category = item.category ?? "N/A";
      const pictures = item.pictures ?? [];
      const location = {
        name: item.location.name ?? "N/A",
        latitude: item.location.latitude ?? 0,
        longitude: item.location.longitude ?? 0,
      };
      const opening_hours = item.opening_hours ?? "N/A";
      const ticket_prices = {
        foreigner: item.ticket_prices.foreigner ?? 0,
        native: item.ticket_prices.native ?? 0,
        student: item.ticket_prices.student ?? 0,
      };

      return {
        id,
        name,
        tags,
        description,
        category,
        pictures,
        location,
        opening_hours,
        ticket_prices,
      };
    });
    return tempData;
  } catch (error) {
    toast.error("Failed to fetch data");
    throw new Error(`Failed to fetch data: ${error.message}`);
  }
}

async function getTags() {
  try {
    // fetch the data
    const response = await axiosInstance.get("/tags");

    // format the data
    const tempData: Tag[] = response.data.data.tags.map(
      (item: {
        _id: string;
        name: string;
        type: string;
        historical_period: string;
      }) => {
        //       "_id": "67311f168582273232a1260a",
        // "name": "PTag",
        // "type": "Preference",
        // "historical_period": "Always",
        const id = item._id;
        const name = item.name ?? "N/A";
        const type = item.type ?? "N/A";
        const historical_period = item.historical_period ?? "N/A";
        return {
          id,
          name,
          type,
          historical_period,
        };
      },
    );
    return tempData;
  } catch (error) {
    toast.error("Failed to fetch data");
    throw new Error(`Failed to fetch data: ${error.message}`);
  }
}

// helper functions

// const formatDescription = (description: string) => {
//   const maxLength = 5 * 15 * 4;
//   if (description.length > maxLength) {
//     return `${description.substring(0, maxLength)}...`;
//   }
//   return description;
// };

// main components
function MuseumModal({
  Museum,
  onClose,
}: {
  Museum: Museum;
  onClose: () => void;
}) {
  // states for the animation
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

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
  const handleLocation = (Museum: Museum) => {
    const value = {
      lat: Museum.location.latitude,
      lng: Museum.location.longitude,
      name: Museum.location.name,
    };
    console.log(value);
    return value;
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

  // functions to handle the sharing modal
  const shareRef = useRef<ModalRef>(null);
  const [shareLink, setShareLink] = useState<string>("");
  const handleShare = (Museum: Museum) => {
    // get the link
    const baseLink = window.location.origin;
    const link: string = `${baseLink}/all-museums/${Museum.id}`;

    // set the link
    setShareLink(link);

    // open the modal
    shareRef.current?.open();
  };

  return (
    <>
      <ShareLink ref={shareRef} link={shareLink} />
      <Modal open onClose={onClose}>
        <div
          className="flex items-center justify-center"
          style={modalOverlayStyle}
        >
          <div
            className="relative h-auto w-full max-w-[80vw] transform rounded-lg border-2 border-black bg-white p-4 transition-all duration-300 ease-in-out"
            style={modalContentStyle}
          >
            {/* Close button */}
            <div className="absolute right-2 top-2 m-4 flex flex-row items-center gap-4">
              <Share
                onClick={() => {
                  handleShare(Museum);
                }}
                className="cursor-pointer transition-all duration-150 hover:scale-110"
              />
              <button onClick={handleModalClose} className="text-xl font-bold">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="black"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div>
              {/* Museum name */}
              <div className="mx-4 my-8 w-fit text-left text-xl font-bold">
                {Museum.name}
                {/* add an underline */}
                <div className="border-b-2 border-black"></div>
              </div>
              {/* Museum details */}
              <div className="mx-8 mb-8 grid grid-cols-[70%_30%] gap-8 px-8">
                {/* Museum info */}
                <div className="col-span-2 h-96">
                  <Map
                    className="h-full w-full"
                    defaultCenter={handleLocation(Museum)}
                    value={handleLocation(Museum)}
                  />
                </div>{" "}
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}

// function MuseumCard({
//   Museum,
//   onCardClick,
// }: {
//   Museum: Museum;
//   onCardClick: () => void;
// }) {
//   return (
//     <div
//       className="grid-rows-[ 48px_auto_auto ] grid h-full w-full cursor-pointer rounded-lg border border-gray-200 bg-white shadow-lg transition-transform duration-200 hover:scale-105 hover:shadow-xl"
//       onClick={onCardClick}
//     >
//       {/* Museum picture */}
//       <img
//         src={Museum.pictures[0]}
//         alt={Museum.name}
//         className="mx-auto h-full min-h-48 w-full rounded-t-lg border-0 object-cover"
//       />

//       {/* Museum name */}
//       <div className="px-4 py-2 text-left text-lg font-bold">{Museum.name}</div>

//       {/* Museum description */}
//       <div className="max-h-48 truncate px-4 py-2 text-sm text-gray-700">
//         {formatDescription(Museum.description)}
//       </div>
//     </div>
//   );
// }

export function MuseumList() {
  const [selectedMuseum, setSelectedMuseum] = useState<Museum | null>(null);
  const [data, setData] = useState<Museum[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [allTags, setAllTags] = useState<string[]>([]);
  const [tag, setTag] = useState<string>("");
  const [filteredData, setFilteredData] = useState<Museum[]>([]);
  const [imageURLs, setImageURLs] = useState<{ [key: string]: string[] }>({});
  const shareRef = useRef<ModalRef>(null);
  const [shareLink, setShareLink] = useState<string>("");

  const handleShare = (Museum: Museum) => {
    // get the link
    const baseLink = window.location.origin;
    const link: string = `${baseLink}/all-museums/${Museum.id}`;

    // set the link
    setShareLink(link);

    // open the modal
    shareRef.current?.open();
  };

  useEffect(() => {
    getMuseums()
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
    getTags()
      .then((data) => {
        setAllTags(data.map((tag) => tag.name));
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    setFilteredData(
      data.filter((item) => {
        const matchesSearchQuery =
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.tags.some((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase()),
          );

        const matchesTag = tag === "" || item.tags.includes(tag);
        return matchesSearchQuery && matchesTag;
      }),
    );
  }, [searchQuery, tag, data]);
  const fetchPicture = async (
    pictureId: string,
  ): Promise<string | undefined> => {
    try {
      const response = await axiosInstance.get(`/attachments/${pictureId}`); // Fetch binary data
      return response.data.url;
    } catch (error) {
      console.error("Error fetching picture:", error);
      return undefined;
    }
  };
  useEffect(() => {
    const fetchImages = async () => {
      const newImageURLs: { [key: string]: string[] } = {}; // Prepare to store an array of URLs
      for (const museum of data) {
        newImageURLs[museum.id] = []; // Initialize an empty array for each museum
        if (museum.pictures.length > 0) {
          for (const pictureId of museum.pictures) {
            const imageUrl = await fetchPicture(pictureId);
            if (imageUrl) {
              newImageURLs[museum.id].push(imageUrl); // Store the image URL
            }
          }
        }
        // If no valid images were fetched, add the default image
        if (newImageURLs[museum.id].length === 0) {
          newImageURLs[museum.id].push(defaultPhoto); // Default image if no valid pictures
        }
      }
      setImageURLs(newImageURLs); // Update state with new URLs
    };

    fetchImages();
  }, [data]);
  const handleCardClick = (Museum: Museum) => setSelectedMuseum(Museum);
  const handleCloseModal = () => setSelectedMuseum(null);

  // get the url
  const url = window.location.href;
  const museumID: string = url.split("/").pop() ?? "";
  // if the museumID from the query param is valid set the search filed to the itinerary name
  useEffect(() => {
    // early exit if data hasnt loaded
    if (!data) return;
    // get the itinerary name given the id
    for (const museum of data) {
      if (museum.id === museumID) {
        setSearchQuery(museum.name);
        break;
      }
    }
  }, [data]);

  return (
    <>
      {loading ? (
        <div className="text-center text-2xl font-bold">Loading...</div>
      ) : error ? (
        <div className="text-center text-2xl font-bold text-red-500">
          {error}
        </div>
      ) : (
        <>
          {/* Tool bar */}
          <div className="rounded-lg bg-secondary-light_grey p-8 shadow-lg">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2">
              <input
                type="text"
                placeholder="Search museums..."
                className="h-full w-full rounded-lg border-2 border-black p-4 focus:border-blue-500 focus:outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="relative h-full w-full">
                <select
                  className="h-full w-full appearance-none rounded-lg border-2 border-black p-4 focus:outline-none"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                >
                  <option value="">All Tags</option>
                  {allTags.map((tag, index) => (
                    <option value={tag} key={index}>
                      {tag}
                    </option>
                  ))}
                </select>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="pointer-events-none absolute right-4 top-1/2 h-6 w-6 -translate-y-1/2 transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>
          {/* Museum Cards */}
          <div className="space-y-4 rounded-lg bg-secondary-white p-8 shadow-lg">
            <h2 className="text-sub-headings font-sub_headings text-accent-dark-blue">
              Available Historical Places
            </h2>
            <div className="grid grid-cols-3 gap-6 p-4">
              {filteredData.length > 0 ? (
                filteredData.map((museum, index) => (
                  <div key={index}>
                    <ShareLink ref={shareRef} link={shareLink} />
                    <GenericCard
                      item={museum}
                      images={
                        imageURLs[museum.id]
                          ? imageURLs[museum.id]
                          : [defaultImage]
                      } // Pass the fetched image URL or default image
                      onClick={() => handleCardClick(museum)} // Opens the modal on click
                    >
                      <p className="line-clamp-2 text-body text-gray-700">
                        {museum.description}
                      </p>
                      <div className={customStyles.infoRow}>
                        <Clock size={20} className={customStyles.icon} />
                        <p className={customStyles.slideText}>
                          {museum.opening_hours}
                        </p>
                      </div>

                      <div className={customStyles.ticketPrices}>
                        <p
                          className={`${customStyles.slideText} flex items-center justify-center text-center font-bold text-accent-dark-blue`}
                        >
                          <CreditCard size={20} className={customStyles.icon} />{" "}
                          Ticket Prices:
                        </p>
                        <div className={customStyles.ticketRow}>
                          <div className={customStyles.ticketColumn}>
                            <p className={customStyles.slideText}>Foreigner</p>
                            <p className={customStyles.slideText2}>
                              ${museum.ticket_prices.foreigner.toFixed(2)}
                            </p>
                          </div>
                          <div className={customStyles.ticketColumn}>
                            <p className={customStyles.slideText}>Native</p>
                            <p className={customStyles.slideText2}>
                              ${museum.ticket_prices.native.toFixed(2)}
                            </p>
                          </div>
                          <div className={customStyles.ticketColumn}>
                            <p className={customStyles.slideText}>Student</p>
                            <p className={customStyles.slideText2}>
                              ${museum.ticket_prices.student.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <div className={`mt-2 items-center justify-center`}>
                          <p
                            className={`${customStyles.slideText} flex items-center justify-center text-center font-bold text-accent-dark-blue`}
                          >
                            <MapPin size={30} className={customStyles.icon} />{" "}
                            Location:
                          </p>
                          <p className={customStyles.slideText}>
                            {museum.location.name}
                          </p>
                        </div>
                        <div className={`${customStyles.infoRow} mt-2`}>
                          {museum.tags.length > 0 &&
                            museum.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="mt-3 inline-flex items-center rounded-full bg-primary-green px-2.5 py-0.5 text-xs font-semibold text-gray-900 transition-colors hover:bg-primary-blue focus:outline-none focus:ring-2 focus:ring-primary-blue focus:ring-offset-2"
                              >
                                {tag}
                              </span>
                            ))}
                        </div>
                        <div className={`${customStyles.infoRow} mt-2`}>
                          <Share
                            onClick={() => {
                              handleShare(museum);
                            }}
                            className="cursor-pointer transition-all duration-150 hover:scale-110"
                          />
                        </div>
                      </div>
                    </GenericCard>
                  </div>
                ))
              ) : (
                <div className="flex h-64 items-center justify-center rounded-lg bg-secondary-light_grey">
                  <p className="text-body text-muted-foreground">
                    No historical places found matching your criteria
                  </p>
                </div>
              )}
            </div>
          </div>
          Museum Modal
          {selectedMuseum && (
            <MuseumModal Museum={selectedMuseum} onClose={handleCloseModal} />
          )}
        </>
      )}
    </>
  );
}
const customStyles = {
  container:
    "h-auto max-h-[100vh] bg-secondary-white max-w-fit border-2 border-gray-300 pr-2 pt-4 pl-10 pb-10 mx-auto",
  sliderContainer: "relative",
  sliderContent: "overflow-hidden",
  sliderWrapper:
    "grid grid-cols-3 gap-12 max-h-[70vh] overflow-y-auto pr-6 pt-2", // Set a max height and make it scrollable
  slideText: "text-sm mt-1",
  slide: "w-[50%] h-[100%] flex-shrink-0 px-2 transition-all duration-600 m-6",
  addSlideDiv:
    "flex items-center justify-center h-[50vh] w-[35vh] border-2 border-dashed border-gray-300 bg-white cursor-pointer hover:bg-gray-50",
  addSlideIcon: "text-gray-400 w-16 h-16",
  infoRow: "flex items-center justify-center mb-2", // Center align info rows
  ticketPrices: "text-center mt-2",
  ticketRow: "flex justify-between", // Flex container for the ticket row
  ticketColumn: "flex flex-col items-center", // Flex column for each ticket type
  slideText2: "text-sm text-gray-700", // Adjusted text styles as needed // Margin for icons
  icon: " text-blue-600 mr-2",
};
