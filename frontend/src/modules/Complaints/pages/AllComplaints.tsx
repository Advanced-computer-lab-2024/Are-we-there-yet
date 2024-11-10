import React, { useContext, useEffect, useState, useRef } from "react";
import Modal, { ModalRef } from "@/modules/shared/components/Modal";
import { UserContext } from "../../shared/store/user-context";
import axiosInstance from "@/modules/shared/services/axiosInstance";
import ComplaintsTable from "../components/ComplaintsTable";
import toast from "react-hot-toast";
import ComplaintsForm from "../components/ComplaintsForm";
import Greeting from "@/modules/shared/components/Greeting";

interface Complaint {
  _id: string;
  title: string;
  body: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const AllComplaints: React.FC = () => {
  const { user } = useContext(UserContext);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const modalRef = useRef<ModalRef>(null);
  const [editingComplaint, setEditingComplaint] = useState<Complaint | null>(null);
  const [refresh, setRefresh] = useState(0); // State for refresh trigger

  const handleOpenModal = (complaint?: Complaint) => {
    setEditingComplaint(complaint || null);
    modalRef.current?.open();
  };

  const handleCloseModal = () => {
    setEditingComplaint(null);
    modalRef.current?.close();
  };

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const response = await axiosInstance.get("/complaints/mine");
        setComplaints(response.data.data.complaints);
      } catch (error) {
        console.error("Error fetching complaints:", error);
      }
    };
    fetchComplaints();
  }, [refresh]);

  const handleCreateOrUpdateComplaint = async (complaintData: { title: string; body: string }) => {
    try {
      let response;
      if (editingComplaint) {
        // Update the existing complaint
        response = await axiosInstance.patch(`/complaints/${editingComplaint._id}`, complaintData);
        toast.success("Complaint updated successfully!");
      } else {
        // Create a new complaint
        response = await axiosInstance.post("/complaints", { ...complaintData, status: "Pending" });
        toast.success("Complaint submitted successfully!");
      }

      // Update state based on response
      if (response.status === 200) {
        setComplaints((prevComplaints) => {
          if (editingComplaint) {
            // Update the specific complaint in the state with the response data
            return prevComplaints.map((complaint) => 
              complaint._id === editingComplaint._id ? { ...complaint, ...response.data } : complaint
            );
          } else {
            // Add the new complaint to the state
            return [...prevComplaints, response.data];
          }
        });
      }
    } catch (error) {
      toast.error("An error occurred.");
    } finally {
      setRefresh((prev) => prev + 1); // Increment the refresh state
      handleCloseModal(); // Close the modal after submit
    }
  };

  return (
    <div className="p-9 text-text-primary">
      <div className="flex flex-col divide-y-2 divide-borders-bottomBorder">
        <Greeting name = {user.username} title="Complaints" signedIn />
      </div>
      <div className="flex justify-end mt-2">
        <button 
          className="flex items-center gap-2 rounded-lg bg-accent-dark-blue px-6 py-3 font-bold text-white transition-all duration-150 hover:opacity-80"
          onClick={() => handleOpenModal()}
        >
          File New Complaint
        </button>
      </div>

      <Modal ref={modalRef} onClose={handleCloseModal}>
        <ComplaintsForm 
          onClose={handleCloseModal} 
          initialValues={editingComplaint ? { title: editingComplaint.title, body: editingComplaint.body } : { title: "", body: "" }}
          onSubmit={handleCreateOrUpdateComplaint}
        />
      </Modal>
      <div className="mt-6">
        <ComplaintsTable
          complaints={complaints}
          onEditComplaint={handleOpenModal}
        />
      </div>
    </div>
  );
};

export default AllComplaints;
