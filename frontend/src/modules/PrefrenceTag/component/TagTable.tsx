import { Pencil, X } from "lucide-react";
import { prefrenceTag } from "../types/PrefrenceTag";
import UpdatePopup from "./update-popup";
import { useRef, useState } from "react";
import Table, { type TableColumn } from "../../shared/components/Table";

interface TagTableProps {
  Tags: prefrenceTag[];
  onDeleteTag: (id: string) => void;
  setTags: React.Dispatch<React.SetStateAction<prefrenceTag[]>>;
}

function TagTable({ Tags, onDeleteTag, setTags }: TagTableProps) {
  const dialogRef = useRef<HTMLDialogElement>();
  const [updateId, setUpdateId] = useState("");
  const tableColumns: TableColumn[] = [
    {
      header: "Name",
      accessor: "name",
    },
    {
      header: "Historical Period",
      accessor: "historical_period",
    },
  ];

  const handleEdit = (id: string) => {
    setUpdateId(id);
    dialogRef.current?.showModal();
  };

  return (
    <>
      <div className="container mx-auto">
        <Table
          data={Tags}
          columns={tableColumns}
          actions={{
            onDelete: onDeleteTag,
            onEdit: handleEdit,
          }}
        />
      </div>
      <UpdatePopup
        dialogRef={dialogRef}
        _id={updateId}
        title="Update a Preference Tag"
        setTags={setTags}
      />
    </>
  );
}

export default TagTable;
