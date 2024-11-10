import {
  createBrowserRouter,
  Outlet,
  RouterProvider,
  useNavigate,
} from "react-router-dom";
import {
  ErrorPage,
  NotFoundPage,
  RootLayout,
  rootLayoutLoader,
} from "./modules/Layout/App";
import { AdminPage as AdminProducts } from "./modules/products/App";
import { AllProducts } from "./modules/products/App";
import { SellerPage as SellerProducts } from "./modules/products/App";
import { Dashboard as AdminDashboard } from "./modules/Admin/App";
import { Tag } from "./modules/Tags/App";
import { PrefrenceTag } from "./modules/PrefrenceTag/App";
import { Category } from "./modules/Category/App";
import { TourGuideProfile } from "./modules/TourGuide/App";
import { AdvertiserProfile } from "./modules/Advertiser/App";
import { SellerProfile } from "./modules/Seller/App";

import { TouristProfile, touristProfileLoader } from "./modules/Tourist/App";
import { Toaster } from "react-hot-toast";
import { AllActivities } from "./modules/shared/pages/MyActivities";
import { AllItineraries } from "./modules/shared/pages/MyItineraries";
import { AllMuseums } from "./modules/shared/pages/MyMuseums";
import { UsersAssets as CrudUserAssets } from "./modules/TourGuide/pages/UsersAssets";
import { MyMuseums } from "./modules/Museums/App";
import { loader as activityLoader } from "./modules/Activity/pages/Activity";
import {
  loader as activityAddLoader,
  editLoader as activityEditLoader,
  action as activityFormAction,
} from "./modules/Activity/component/ActivityForm";
import { Activity, ActivityForm, EditActivity } from "./modules/Activity/App";
import UserContextProvider, {
  UserContext,
} from "./modules/shared/store/user-context";
import { RouteGuard } from "./modules/shared/components/RouteGuard";
import { AccountType } from "./modules/shared/types/User.types";
import { LandingPage } from "./modules/LandingPage/App";
import Register from "./modules/Register/pages/Register";
import { registerAction, registerLoader } from "./modules/Register/App";
import { useContext } from "react";
import axiosInstance from "./modules/shared/services/axiosInstance";
import AllComplaints from "./modules/Complaints/pages/AllComplaints";
import AdminAllComplaints from "./modules/Complaints/pages/AdminAllComplaints";
import LandingPageLayout from "./modules/LandingPage/pages/LadningPageLayout";
import History from "./modules/History/pages/History";
import FlagItineraries, {
  loader as flagItinerariesLoader,
} from "./modules/Admin/pages/FlagItineraries";
import { ActivityBookings } from "./modules/Tourist/pages/Bookings/ActivityBookings";
import { ItineraryBookings } from "./modules/Tourist/pages/Bookings/ItineraryBookings";
import { TransportationBookings } from "./modules/Tourist/pages/Bookings/TransportationBookings";
import Booking from "./modules/Booking/pages/Booking";

const Login = () => {
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const email = (e.target as any).elements[0].value;
        const password = (e.target as any).elements[1].value;
        axiosInstance
          .post("/auth/login", { email, password })
          .then((res) => {
            const data = res.data as any;
            localStorage.setItem("token", data.data.jwt);
            setUser(data.data.user);
            navigate("/home");
          })
          .catch((err) => console.error(err));
      }}
      className="container mx-auto mt-9 space-y-4 bg-secondary-white"
    >
      <input
        type="email"
        placeholder="Email"
        className="w-full rounded-lg border p-3"
      />
      <input
        type="password"
        placeholder="Password"
        className="w-full rounded-lg border p-3"
      />
      <button
        type="submit"
        className="w-full rounded-full border bg-accent-dark-blue p-2 text-white"
      >
        Login
      </button>
    </form>
  );
};

const BrowserRouter = createBrowserRouter([
  {
    path: "/",
    element: <LandingPageLayout />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
      {
        path: "all-activities",
        element: <AllActivities />,
      },
      {
        path: "all-itineraries",
        element: <AllItineraries />,
      },
      {
        path: "all-museums",
        element: <AllMuseums />,
      },
      {
        path: "all-products",
        element: <AllProducts />,
      },
      {
        path: "activity-bookings",
        element: <ActivityBookings />,
      },
      {
        path: "itinerary-bookings",
        element: <ItineraryBookings />,
      },
      {
        path: "transportation-bookings",
        element: <TransportationBookings />,
      },
      {
        path: "booking",
        element: <Booking />,
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
    action: registerAction,
    loader: registerLoader,
  },
  {
    path: "/home",
    id: "root",
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    loader: rootLayoutLoader,
    children: [
      {
        path: "tour-guide-profile/:id",
        // element: <TourGuideProfile />,
        element: (
          <RouteGuard account_types={[AccountType.TourGuide]}>
            <TourGuideProfile />
          </RouteGuard>
        ),
      },
      {
        path: "advertiser-profile/:id",
        // element: <AdvertiserProfile />,
        element: (
          <RouteGuard account_types={[AccountType.Advertiser]}>
            <AdvertiserProfile />,
          </RouteGuard>
        ),
      },
      {
        path: "seller-profile/:id",
        // element: <SellerProfile />,
        element: (
          <RouteGuard account_types={[AccountType.Seller]}>
            <SellerProfile />,
          </RouteGuard>
        ),
      },
      {
        path: "tourist-profile/:id",
        // element: <TouristProfile />,
        element: (
          <RouteGuard account_types={[AccountType.Tourist]}>
            <TouristProfile />
          </RouteGuard>
        ),
        loader: touristProfileLoader,
      },
      {
        path: "my-products-seller",
        element: <SellerProducts />,
      },
      {
        path: "admin-dashboard",
        children: [
          {
            index: true,
            element: <AdminDashboard />,
          },
          {
            path: "prefrence-tags",
            element: <PrefrenceTag />,
          },
          {
            path: "activity-categories",
            element: <Category />,
          },
          {
            path: "my-products-admin",
            element: <AdminProducts />,
          },
          {
            path: "flag-itineraries",
            element: <FlagItineraries />,
            loader: flagItinerariesLoader,
          },
        ],
      },
      {
        path: "tag",
        element: <Tag />,
      },
      {
        path: "crud-users-assets",
        element: <CrudUserAssets />,
      },
      {
        path: "my-museums",
        element: <MyMuseums />,
      },
      {
        path: "my-complaints",
        element: <AllComplaints />,
      },
      {
        path: "history",
        element: <History />,
      },
      {
        path: "admin-complaints",
        element: <AdminAllComplaints />,
      },
      {
        path: "my-activities",
        element: (
          <RouteGuard account_types={[AccountType.Advertiser]}>
            <Outlet />,
          </RouteGuard>
        ),
        children: [
          {
            index: true,
            element: <Activity />,
            loader: activityLoader,
          },
          {
            path: "add",
            element: <ActivityForm method="post" />,
            action: activityFormAction,
            loader: activityAddLoader,
          },
          {
            path: "edit/:activityId",
            element: <EditActivity />,
            action: activityFormAction,
            loader: activityEditLoader,
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

function App() {
  return (
    <>
      <Toaster
        position="top-center"
        containerStyle={{ margin: "8px" }}
        toastOptions={{
          success: { duration: 3000 },
          error: { duration: 4000 },
          style: {
            fontSize: "16px",
            lineHeight: "1.5",
            maxWidth: "500px",
            padding: "16px 24px",
            background: "white",
            margin: "5px",
            display: "absolute",
          },
        }}
      />
      <UserContextProvider>
        <RouterProvider router={BrowserRouter} />
      </UserContextProvider>
    </>
  );
}

export default App;
