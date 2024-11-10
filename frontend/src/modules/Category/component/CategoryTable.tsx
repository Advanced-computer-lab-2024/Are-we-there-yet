import { Category } from '../types/Category';
import UpdatePopup from './update-popup';
import { useRef, useState } from 'react';
import Table, { type TableColumn } from "../../shared/components/Table";


interface CategoryTableProps {
  Categories: Category[];
  onDeleteCategory: (id: string) => void;
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
}

function CategoryTable({ Categories, onDeleteCategory, setCategories }: CategoryTableProps) {
  const dialogRef = useRef<HTMLDialogElement>();
  const [updateId, setUpdateId] = useState("");
  const tableColumns: TableColumn[] = [
    {
      header: "Name",
      accessor: "name",
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
          data={Categories}
          columns={tableColumns}
          actions={{
            onDelete: onDeleteCategory,
            onEdit: handleEdit,
          }}
        />
      </div>
      <UpdatePopup
        dialogRef={dialogRef}
        _id={updateId}
        title="Update Category"
        setCategories={setCategories}
      />
    </>
  );

}

export default CategoryTable;
