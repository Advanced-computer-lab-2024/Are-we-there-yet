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

  const body: { [key: string]: string } = {
    cancel_url: `${domainName}/home/checkout/cancel`,
  };

  let success_url = `${domainName}/home/checkout/confirm`;
  if (address_id) {
    body["address_id"] = address_id;
    success_url += `/cart`;
  }

  if (activity_id) {
    body["activity_id"] = activity_id;
    success_url += `/activity`;
  }

  if (itinerary_id) {
    body["itinerary_id"] = itinerary_id;
    success_url += `/itinerary`;
  }

  body["success_url"] = success_url + "/{CHECKOUT_SESSION_ID}";

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
