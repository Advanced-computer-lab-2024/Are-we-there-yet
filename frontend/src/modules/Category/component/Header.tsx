import axiosInstance from "../../shared/services/axiosInstance";
import { AddCategoryPopup, OpenPopupButton } from "./popup";
import { UserContext } from "../../shared/store/user-context";
import { useContext } from "react";

const Header = ({
  isCategoryPopupOpen,
  setIsCategoryPopupOpen,
  setCategories,
  setRefresh,
}: {
  isCategoryPopupOpen: boolean;
  setIsCategoryPopupOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setCategories: React.Dispatch<React.SetStateAction<any[]>>;
  setRefresh: React.Dispatch<React.SetStateAction<number>>;
}) => {
  // Function to add an Category
  const addCategory = async (name: string) => {
    // try {
    //   const response = await fetch('https://are-we-there-yet-mirror.onrender.com/api/categories', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({ name }),
    //   });
    try {
      // Send the POST request to the backend
      const response = await axiosInstance.post("/categories", {
        name,
      });

      // if (!response.ok) {
      //   throw new Error('Failed to add Category');
      // }

      // const newCategory = await response.json();
      const newCategory = response.data; // Adjust according to your response structure
      console.log("Category added:", newCategory); // Log the added user
      // Optionally, you can trigger a state update or callback to refresh the user list
      const CategoryId = newCategory.data.categoryId;
      const Category = await getCategory(CategoryId);
      console.log("Category:", Category); // Log the added user
      setCategories((prevCategories) => [
        ...prevCategories,
        { _id: Category._id, name: Category.name },
      ]);
      setRefresh((prev) => prev + 1);
    } catch (error) {
      console.error("Error adding Category:", error);
    }
  };
  // async function getCategory(id: string) {
  //   console.log(id);
  //   return fetch(`https://are-we-there-yet-mirror.onrender.com/api/categories/${id}`)
  //     .then((response) => response.json())
  //     .then((data) => {
  //       console.log(data.data);
  //       return data.data.category;
  //     });
  // }
  async function getCategory(id: string) {
    console.log(id);
    try {
      // Send the GET request to the backend
      const response = await axiosInstance.get(`/categories/${id}`);

      console.log(response.data.data); // Log the response data for debugging
      return response.data.data.category; // Adjust according to your response structure
    } catch (error) {
      console.error("Error fetching category:", error);
      throw error; // Optionally rethrow the error for further handling
    }
  }

  const handleAddCategory = (name: string) => {
    addCategory(name);
    setIsCategoryPopupOpen(false); // Close the popup after adding
  };
  const { user } = useContext(UserContext);

  return (
    <header className="flex items-center justify-between p-4">
      <div className="flex flex-col justify-end py-14 text-primary-blue">
        <div className="w-full max-w-[50vw] divide-y-2 divide-primary-green">
          <h1 className="py-4 text-4xl font-bold">Welcome {user.username}</h1>
          <h3 className="py-4 text-2xl font-bold">Categories</h3>
        </div>
      </div>
      <div className="flex space-x-4">
        <OpenPopupButton onClick={() => setIsCategoryPopupOpen(true)}>
          Add Category
        </OpenPopupButton>
        <AddCategoryPopup
          isOpen={isCategoryPopupOpen}
          onClose={() => setIsCategoryPopupOpen(false)}
          onAdd={handleAddCategory}
          title="Add a Category"
          isHeader={true}
        />
      </div>
    </header>
  );
};

export default Header;
