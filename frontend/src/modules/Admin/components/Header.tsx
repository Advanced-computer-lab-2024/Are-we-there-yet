import { AddUserPopup, OpenPopupButton } from "./popup";
import axiosInstance from "../../shared/services/axiosInstance";
import { UserContext } from "../../shared/store/user-context";
import { useContext } from "react";
import { Link } from "react-router-dom";

const Header = ({
  isTourismGovernorPopupOpen,
  setIsTourismGovernorPopupOpen,
  isAdminPopupOpen,
  setIsAdminPopupOpen,
  setUsers,
  setRefresh,
}: {
  isTourismGovernorPopupOpen: boolean;
  isAdminPopupOpen: boolean;
  isProfilePopupOpen: boolean;
  setIsProfilePopupOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsTourismGovernorPopupOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsAdminPopupOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setUsers: React.Dispatch<React.SetStateAction<any[]>>;
  setRefresh: React.Dispatch<React.SetStateAction<number>>;
}) => {
  // Function to add an Tag
  const addUser = async (
    username: string,
    password: string,
    email: string,
    accountType: string,
  ) => {
    try {
      const response = await axiosInstance.post("/auth/register", {
        username,
        password,
        email,
        account_type: accountType,
      });

      if (response.status !== 200) {
        throw new Error("Failed to add user");
      }

      localStorage.setItem(`${accountType}Token`, response.data.data.jwt);
      const newUser = await response.data;
      const userId = newUser.data.user._id;
      const user = await getUser(userId);
      setUsers((prevUsers) => [
        ...prevUsers,
        {
          _id: user._id,
          username: user.username,
          email: user.email,
          account_type: user.account_type,
        },
      ]);
      setRefresh((prev) => prev + 1);
    } catch (error) {
      console.error("Error adding user:", error);
    }
  };

  async function getUser(id: string) {
    try {
      const response = await axiosInstance.get(`/users/${id}`);
      return response.data.data.user; // Adjust according to your response structure
    } catch (error) {
      console.error("Error fetching user:", error);
      throw error; // Rethrow error if needed
    }
  }

  const handleAddTourismGovernor = (
    username: string,
    password: string,
    email: string,
  ) => {
    addUser(username, password, email, "TourismGovernor");
    setIsTourismGovernorPopupOpen(false); // Close the popup after adding
  };

  const handleAddAdmin = (
    username: string,
    password: string,
    email: string,
  ) => {
    addUser(username, password, email, "Admin");
    setIsAdminPopupOpen(false); // Close the popup after adding
  };
  const { user } = useContext(UserContext);

  return (
    <header className="flex items-center justify-between p-4">
      <div className="flex flex-col justify-end py-14 text-primary-blue">
        <div className="w-full max-w-[50vw] divide-y-2 divide-primary-green">
          <h1 className="py-4 text-4xl font-bold">Welcome {user.username}</h1>
          <h3 className="py-4 text-2xl font-bold">Users</h3>
        </div>
      </div>
      <div className="flex max-w-[70%] flex-wrap gap-4">
        <OpenPopupButton onClick={() => setIsTourismGovernorPopupOpen(true)}>
          Add Tourism Governor
        </OpenPopupButton>
        <OpenPopupButton onClick={() => setIsAdminPopupOpen(true)}>
          Add Admin
        </OpenPopupButton>

        <Link
          to="prefrence-tags"
          className="rounded bg-accent-dark-blue px-4 py-2 text-white hover:bg-accent-dark-blue/80 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
        >
          Preference Tags
        </Link>

        <AddUserPopup
          isOpen={isTourismGovernorPopupOpen}
          onClose={() => setIsTourismGovernorPopupOpen(false)}
          onAdd={handleAddTourismGovernor}
          title="Add a Tourism Governor"
        />
        <AddUserPopup
          isOpen={isAdminPopupOpen}
          onClose={() => setIsAdminPopupOpen(false)}
          onAdd={handleAddAdmin}
          title="Add an Admin"
        />
      </div>
    </header>
  );
};

export default Header;
