import Modal, { type ModalRef } from "@/modules/shared/components/Modal";
import type { TableColumn } from "@/modules/shared/components/Table";
import Table from "@/modules/shared/components/Table";
import axiosInstance from "@/modules/shared/services/axiosInstance";
import { UserContext } from "@/modules/shared/store/user-context";
import type { ItineraryType } from "@/modules/shared/types/Itinerary.types";
import { X } from "lucide-react";
import { useContext, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useLoaderData } from "react-router";

export default function FlagItineraries() {
  const { user } = useContext(UserContext);
  const ref = useRef<ModalRef>(null);
  const [itineraries, setItineraries] = useState(
    useLoaderData() as ItineraryType[],
  );
  const [selectedId, setSelectedId] = useState("");
  const selectedItinerary = itineraries.find(
    (itinerary) => itinerary._id === selectedId,
  );
  console.log(itineraries, selectedItinerary, selectedId);

  const tableColumns: TableColumn[] = [
    {
      header: "Name",
      accessor: "name",
    },
    {
      header: "Category",
      accessor: "category",
    },
    {
      header: "Active",
      accessor: "active",
      render: (active: boolean) => (
        <span
          className={`rounded-full p-1 bg-${active ? "primary-green" : ""}`}
        >
          {active ? "Yes" : "No"}
        </span>
      ),
    },
    {
      header: "Average Rating",
      accessor: "average_rating",
    },
    {
      header: "Flagged",
      accessor: "flagged",
      render: (flagged: boolean) => (
        <span className={`rounded-full p-1 bg-${flagged ? "destructive" : ""}`}>
          {flagged ? "Yes" : "No"}
        </span>
      ),
    },
  ];

  const handleFlagItinerary = (id: string) => {
    toast.promise(
      axiosInstance.patch(`/itineraries/toggleFlag/${id}`).then(() =>
        setItineraries((prev) => {
          const itineraries = [...prev];
          const index = itineraries.findIndex(
            (itinerary) => itinerary._id === id,
          );
          itineraries[index] = {
            ...itineraries[index],
            flagged: !itineraries[index].flagged,
          };
          return itineraries;
        }),
      ),
      {
        loading: "Toggle flagging itinerary...",
        success: "Itinerary toggled successfully!",
        error: "Failed to toggle itinerary.",
      },
    );
  };

  return (
    <>
      <div className="container mx-auto space-y-5 p-4">
        <header className="flex items-center justify-between">
          <div className="flex flex-col py-14 text-primary-blue">
            <div className="w-full max-w-[50vw] divide-y-2 divide-primary-green">
              <h1 className="py-4 text-4xl font-bold">
                Welcome {user.username}
              </h1>
              <h3 className="py-4 text-2xl font-bold text-primary-blue">
                Flag/Unflag Itineraries
              </h3>
            </div>
          </div>
        </header>
        <Table
          columns={tableColumns}
          data={itineraries}
          actions={{
            onEdit: (id) => {
              setSelectedId(id);
              ref.current?.open();
            },
          }}
        />
      </div>

      <Modal ref={ref} onClose={() => setSelectedId("")}>
        {selectedItinerary && (
          <div className="items-left flex flex-col gap-4 p-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-primary-blue">
                {selectedItinerary.name}
              </h1>
              <button
                className="text-lg text-destructive"
                onClick={() => ref.current?.close()}
              >
                <X size={24} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <p className="text-lg">Category: {selectedItinerary.category}</p>
              <p className="text-lg">
                Active: {selectedItinerary.active ? "Yes" : "No"}
              </p>
              {selectedItinerary.accessibility && (
                <div className="flex flex-col gap-2">
                  <h2 className="text-lg">Accessibility</h2>
                  {Object.entries(selectedItinerary.accessibility).map(
                    ([key, value]) =>
                      key !== "_id" && (
                        <p key={key} className="text-lg">
                          {key}: {value ? "Yes" : "No"}
                        </p>
                      ),
                  )}
                </div>
              )}
              {selectedItinerary.tags.length > 0 && (
                <p className="rounded-full text-lg">
                  Tags:{" "}
                  {selectedItinerary.tags.map((tag) => tag.name).join(", ")}
                </p>
              )}
              <p className="text-lg">
                Average Rating: {selectedItinerary.average_rating}
              </p>
              <p className="text-lg">Language: {selectedItinerary.language}</p>
              <p className="text-lg">
                Available Datetimes:{" "}
                {selectedItinerary.available_datetimes
                  .map((datetime) => new Date(datetime).toLocaleString())
                  .join(", ")}
              </p>
              <p className="text-lg">Price: {selectedItinerary.price}</p>
              <p className="text-lg">
                Timeline:{" "}
                {selectedItinerary.timeline
                  .split(" - ")
                  .map((datetime) => new Date(datetime).toLocaleString())
                  .join(" to ")}
              </p>
              <p className="text-lg">
                Pick Up Location: {selectedItinerary.pick_up_location.name}
              </p>
              <p className="text-lg">
                Drop Off Location: {selectedItinerary.drop_off_location.name}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <p className="p-1 text-lg">
                Flagged: {selectedItinerary.flagged ? "Yes" : "No"}
              </p>
              <button
                className="rounded-md bg-accent-dark-blue p-2 text-white"
                onClick={() => handleFlagItinerary(selectedId)}
              >
                {selectedItinerary.flagged ? "Unflag" : "Flag"} Itinerary
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

export async function loader() {
  return axiosInstance
    .get("/itineraries/get")
    .then((res) => res.data.data.itineraries);
}
