import React from "react";
import Table, { ActionProps, TableColumn } from "../../shared/components/Table";

interface Itinerary {
  _id: string;
  name: string;
  tags: { name: string }[];
  timeline: string;
  language: string;
  price: number;
  average_rating?: number;
  created_by: { username: string };
  available_datetimes: Date[];
  accessibility: {
    wheelchairAccessible: boolean;
    assistiveHearingDevices: boolean;
    visualAidSupport: boolean;
    serviceAnimalAllowed: boolean;
    accessibleParking: boolean;
  };
  pick_up_location: { name: string };
  drop_off_location: { name: string };
}

interface ItineraryTableProps {
  itineraries: Itinerary[];
  onEditRating: (object: { _id: string; type: string }) => void;
}

const ItineraryTable: React.FC<ItineraryTableProps> = ({ itineraries, onEditRating }) => {
  const columns: TableColumn[] = [
    { header: "Name", accessor: "name" },
    { header: "Timeline", accessor: "timeline" },
    { header: "Language", accessor: "language" },
    { header: "Price", accessor: "price" },
    {
        header: "Available Dates",
        accessor: "available_datetimes",
        render: (dates: Date[]) =>
            dates.map((date, index) => <div key={index}>{new Date(date).toLocaleDateString()}</div>),
    },
    {
        header: "Accessibility",
        accessor: "accessibility",
        render: (accessibility) => (
           <div className="flex flex-col gap-2">
           <div className={`${accessibility.wheelchairAccessible ? 'bg-green-500' : 'bg-red-700'} text-black rounded-full px-3 py-1 text-sm`}>
            Wheelchair
          </div>
          <div className={`${accessibility.assistiveHearingDevices ? 'bg-green-500' : 'bg-red-700'} text-black rounded-full px-3 py-1 text-sm`}>
            Hearing Devices
          </div>
          <div className={`${accessibility.visualAidSupport ? 'bg-green-500' : 'bg-red-700'} text-black  rounded-full px-3 py-1 text-sm`}>
            Visual Aid
          </div>
          <div className={`${accessibility.serviceAnimalAllowed ? 'bg-green-500' : 'bg-red-700'} text-black  rounded-full px-3 py-1 text-sm`}>
            Service Animal
          </div>
          <div className={`${accessibility.accessibleParking ? 'bg-green-500' : 'bg-red-700'} text-black  rounded-full px-3 py-1 text-sm`}>
            Parking
          </div>
        </div>
      ),
    },
    { header: "Tags", accessor: "tags", render: (tags: { name: string }[]) => (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="bg-gray-400 text-black rounded-full px-3 py-1 text-sm"
            >
              {tag.name}
            </span>
          ))}
        </div>
      ),
    },
    { header: "Pick-up Location", accessor: "pick_up_location.name" },
    { header: "Drop-off Location", accessor: "drop_off_location.name" },
    { header: "Created By", accessor: "created_by.username" },
    {
      header: "Ratings",
      accessor: "average_rating",
      render: (rating) => (rating !== undefined ? rating.toFixed(1) +"/5" : "N/A"),
    },
  ];

  const actions: ActionProps = {
    onEdit: (id: string) => {
      const itinerary = itineraries.find((i) => i._id === id);
      if (itinerary) {
        onEditRating({ _id: id, type: "itineraries" });
      }
    },
  };

  return <Table data={itineraries} columns={columns} actions={actions} />;
};

export default ItineraryTable;
