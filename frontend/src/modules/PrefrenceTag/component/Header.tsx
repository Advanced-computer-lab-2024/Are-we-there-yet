import axiosInstance from "../../shared/services/axiosInstance";
import { AddTagPopup, OpenPopupButton } from "./popup";
import { UserContext } from "../../shared/store/user-context";
import { useContext } from "react";

const Header = ({
  isTagPopupOpen,
  setIsTagPopupOpen,
  setTags,
  setRefresh,
}: {
  isTagPopupOpen: boolean;
  setIsTagPopupOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setTags: React.Dispatch<React.SetStateAction<any[]>>;
  setRefresh: React.Dispatch<React.SetStateAction<number>>;
}) => {
  // Function to add an Tag
  const addTag = async (
    name: string,
    type: string,
    historical_period: string,
  ) => {
    try {
      // const response = await fetch('https://are-we-there-yet-mirror.onrender.com/api/tags', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ name, type, historical_period }),
      // });

      // if (!response.ok) {
      //   throw new Error('Failed to add tag');
      // }
      const response = await axiosInstance.post("/tags", {
        name,
        type,
        historical_period,
      });

      // const newTag = await response.json();
      const newTag = response.data; // Adjust according to your response structure
      console.log("Tag added:", newTag); // Log the added user
      // Optionally, you can trigger a state update or callback to refresh the user list
      const tagId = newTag.data.tagId;
      const tag = await getTag(tagId);
      // console.log('Tag:', tag); // Log the added user
      setTags((prevTags) => [
        ...prevTags,
        {
          _id: tag._id,
          name: tag.name,
          type: tag.type,
          historical_period: tag.historical_period,
        },
      ]);
      setRefresh((prev) => prev + 1);
    } catch (error) {
      console.error("Error adding tag:", error);
    }
  };
  // async function getTag(id: string) {
  //   return fetch(`https://are-we-there-yet-mirror.onrender.com/api/tags/${id}`)
  //     .then((response) => response.json())
  //     .then((data) => data.data.tag[0]);
  // }
  async function getTag(id: string) {
    try {
      // Send the GET request to the backend
      const response = await axiosInstance.get(`/tags/${id}`);
      
      console.log(response.data.data); // Log the response data for debugging
      return response.data.data.tag[0]; // Adjust according to your response structure
    } catch (error) {
      console.error('Error fetching tag:', error);
      throw error; // Optionally rethrow the error for further handling
    }
  }
  

  const handleAddTag = (name: string, historical_period: string) => {
    addTag(name, "Preference", historical_period);
    setIsTagPopupOpen(false); // Close the popup after adding
  };
  const { user } = useContext(UserContext);

  return (
    <header className="flex items-center justify-between p-4">
      <div className="flex flex-col justify-end py-14 text-primary-blue">
        <div className="w-full max-w-[50vw] divide-y-2 divide-primary-green">
          <h1 className="py-4 text-4xl font-bold">Welcome {user.username}</h1>
          <h3 className="py-4 text-2xl font-bold">Preference Tags</h3>
        </div>
      </div>
      <div className="flex space-x-4">
          <OpenPopupButton onClick={() => setIsTagPopupOpen(true)}>
            Add Preference Tag
          </OpenPopupButton>
          <AddTagPopup
            isOpen={isTagPopupOpen}
            onClose={() => setIsTagPopupOpen(false)}
            onAdd={handleAddTag}
            title="Add a Preference Tag"
            isHeader={true}
          />
        </div>
    </header>
  );
};

export default Header;
