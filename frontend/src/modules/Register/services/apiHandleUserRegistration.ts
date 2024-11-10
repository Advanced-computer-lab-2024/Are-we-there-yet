import toast from "react-hot-toast";
// import { redirect } from "react-router-dom";
import axiosInstance from "../../shared/services/axiosInstance";
import { AxiosResponse } from "axios";

// Generic function for handling form submission, API request, and redirect
export async function handleUserRegistration({
  endpoint,
  requestData,
  // successRedirect,
}: {
  endpoint: string;
  requestData: object;
  successRedirect: string;
}) {
  try {
    const resPromise = axiosInstance.post(
      endpoint,
      requestData,
    ) as Promise<AxiosResponse>;

    toast.promise(
      resPromise,
      {
        loading: "Creating account...",
        success: "Account created successfully",
        error: (err) => {
          if (
            err.response?.data?.message.includes("duplicate key error") &&
            err.response?.data?.message.includes("email")
          ) {
            return "Email already exists";
          }
          if (
            err.response?.data?.message.includes("duplicate key error") &&
            err.response?.data?.message.includes("username")
          ) {
            return "Username already exists";
          }
          return "An error occurred";
        },
      },
      {
        style: {
          display: "absolute",
        },
        success: {
          duration: 2000,
        },
      },
    );

    const res = await resPromise;

    // Check if the response is successful and perform the redirect
    if (res.status === 200) {
      localStorage.setItem("token", res.data.data.jwt); // Store the user ID in local storage
      // return redirect(`${successRedirect}/${res.data.data.user._id}`); // Redirect to the specified route
      return res;
    }
  } catch (error) {
    console.error("Request failed:", error);
  }

  return null;
}
