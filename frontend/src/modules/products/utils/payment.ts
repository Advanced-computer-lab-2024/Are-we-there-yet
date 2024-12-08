import axiosInstance from "@/modules/shared/services/axiosInstance";
import { loadStripe } from "@stripe/stripe-js";
import toast from "react-hot-toast";

export async function payWithStripe({
  address_id,
  activity_id,
  itinerary_id,
}: {
  address_id?: string;
  activity_id?: string;
  itinerary_id?: string;
}) {
  if (!address_id && !activity_id && !itinerary_id) {
    throw new Error("Address, Activity or Itinerary id is required");
  }

  const pk = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
  const stripe = await loadStripe(pk);

  if (!stripe) {
    throw new Error("Failed to load stripe");
  }

  const domainName = window.location.origin;

  const body: {
    address_id?: string;
    activity_id?: string;
    itinerary_id?: string;
    success_url: string;
    cancel_url: string;
  } = {
    success_url: `${domainName}/home/checkout/confirm/{CHECKOUT_SESSION_ID}`,
    cancel_url: `${domainName}/home/checkout/cancel`,
  };

  if (address_id) {
    body["address_id"] = address_id;
  }

  if (activity_id) {
    body["activity_id"] = activity_id;
  }

  if (itinerary_id) {
    body["itinerary_id"] = itinerary_id;
  }

  const sessionResponse = await toast.promise(
    axiosInstance.post("/orders/payment/card", body),
    {
      loading: "Creating payment session...",
      success: "Payment session created successfully",
      error: (error) =>
        `Failed to create payment session: ${error.response?.data.message}`,
    },
  );

  const sessionId = sessionResponse.data.data.session.id;

  const result = await stripe.redirectToCheckout({
    sessionId,
  });

  if (result.error) {
    throw new Error(result.error.message);
  }
}
