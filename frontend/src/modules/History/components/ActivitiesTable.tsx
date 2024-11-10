import React from "react";
import Table, { ActionProps, TableColumn } from "../../shared/components/Table"; // Assuming you have a Table component in shared

interface Activity {
  _id: string;
  name: string;
  datetime: Date;
  location: { name: string };
  price: number;
  category: { name: string };
  tags: { name: string }[];
  specialDiscounts: number;
  average_rating?: number;
}

interface ActivitiesTableProps {
  activities: Activity[];
  onEditRating: (object: { _id: string; type: string }) => void; // You can adjust this for different actions like edit, view, etc.
}

const ActivitiesTable: React.FC<ActivitiesTableProps> = ({ activities, onEditRating }) => {
  const columns: TableColumn[] = [
    { header: "Name", accessor: "name", render: (name) => (name !== undefined ? name : "N/A"),    },
    { header: "Date", accessor: "datetime", render: (datetime: Date) => new Date(datetime).toLocaleDateString() },
    { header: "Time", accessor: "datetime", render: (datetime: Date) => new Date(datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
    { header: "Location", accessor: "location.name", render: (name) => (name !== undefined ? name : "N/A"), },
    { header: "Category", accessor: "category.name", render: (name) => (name !== undefined ? name : "N/A"), },
    { header: "Price", accessor: "price"},
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
    { header: "Special Discounts", accessor: "specialDiscounts", render: (discounts: number) => `${discounts}%` },
    {
        header: "Ratings",
        accessor: "average_rating",
        render: (rating) => (rating !== undefined ? rating.toFixed(1) + "/5" : "N/A"),
      },
  ];

  const actions: ActionProps = {
    onEdit: (id: string) => {
      const activity = activities.find((a) => a._id === id);  // Make sure to match by _id or another unique field
      if (activity) {
        onEditRating({ _id: id, type: "activities" }); 
      }
    },
  };

  return <Table data={activities} columns={columns} actions={actions} />;
};

export default ActivitiesTable;
