import Table, { type TableColumn } from "../../shared/components/Table";
import { useEffect, useRef, useState } from "react";
import type { UserType } from "@/modules/shared/types/User.types";
import Modal, { type ModalRef } from "@/modules/shared/components/Modal";
import axiosInstance from "@/modules/shared/services/axiosInstance";
import toast from "react-hot-toast";
import { X } from "lucide-react";

interface ProfileTableProps {
  profiles: UserType[];
  setProfiles: React.Dispatch<React.SetStateAction<UserType[]>>;
  onDeleteProfile: (id: string) => void;
}

function ProfileTable({
  profiles,
  setProfiles,
  onDeleteProfile,
}: ProfileTableProps) {
  const tableColumns: TableColumn[] = [
    {
      header: "Username",
      accessor: "username",
    },
    {
      header: "Email",
      accessor: "email",
    },
    {
      header: "Accepted?",
      accessor: "accepted",
      render: (accepted: boolean) => (
        <span
          className={`rounded-full p-1 bg-${accepted ? "primary-green" : ""}`}
        >
          {accepted ? "Yes" : "No"}
        </span>
      ),
    },
    {
      header: "Rejected?",
      accessor: "rejected",
      render: (rejected: boolean) => (
        <span
          className={`rounded-full p-1 bg-${rejected ? "destructive" : ""}`}
        >
          {rejected ? "Yes" : "No"}
        </span>
      ),
    },
    {
      header: "Request Deletion?",
      accessor: "deletionRequested",
      render: (deletionRequested: boolean) => (
        <span className={`text-${deletionRequested ? "red" : "blue"}-500`}>
          {deletionRequested ? "Yes" : "No"}
        </span>
      ),
    },
    {
      header: "Account Type",
      accessor: "account_type",
    },
  ];

  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const modalRef = useRef<ModalRef>(null);

  useEffect(() => {
    if (!selectedUser) return;
    const user = profiles.find((profile) => profile._id === selectedUser._id);
    if (!user) {
      console.error("User not found");
      return;
    }
    setSelectedUser(user);
  }, [profiles]);

  return (
    <>
      <div className="container mx-auto p-4">
        <Table
          data={profiles}
          columns={tableColumns}
          actions={{
            onEdit: (id: string) => {
              const user = profiles.find((profile) => profile._id === id);
              if (!user) {
                console.error("User not found");
                return;
              }
              setSelectedUser(user);
              modalRef.current?.open();
            },
            onDelete: onDeleteProfile,
          }}
        />
      </div>
      <Modal ref={modalRef} onClose={() => setSelectedUser(null)}>
        {selectedUser && (
          <>
            <div className="w-full flex justify-between">
              <div className="w-full flex items-center justify-between">
                <h1>Edit User</h1>

                <button
                  className="text-lg text-destructive"
                  onClick={() => modalRef.current?.close()}
                >
                  <X size={24} />
                </button>
              </div>
              {!(selectedUser.accepted || selectedUser.rejected) && (
                <div className="flex gap-3">
                  <button
                    onClick={() =>
                      toast.promise(
                        axiosInstance
                          .patch(`/users/accept-user/${selectedUser._id}`)
                          .then(() => {
                            setProfiles((prevProfiles) => {
                              const index = prevProfiles.findIndex(
                                (profile) => profile._id === selectedUser._id,
                              );
                              if (index === -1) return prevProfiles;
                              const updatedProfiles = [...prevProfiles];
                              updatedProfiles[index] = {
                                ...updatedProfiles[index],
                                accepted: true,
                              };
                              return updatedProfiles;
                            });
                            modalRef.current?.close();
                          }),
                        {
                          loading: "Accepting The User...",
                          success: "Accepted The User",
                          error: (error) =>
                            `Failed to accept the user: ${error}`,
                        },
                      )
                    }
                    className="rounded bg-green-500 p-2 text-white"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() =>
                      toast.promise(
                        axiosInstance
                          .patch(`/users/rejectUser/${selectedUser._id}`)
                          .then(() => {
                            setProfiles((prevProfiles) => {
                              const index = prevProfiles.findIndex(
                                (profile) => profile._id === selectedUser._id,
                              );
                              if (index === -1) return prevProfiles;
                              const updatedProfiles = [...prevProfiles];
                              updatedProfiles[index] = {
                                ...updatedProfiles[index],
                                rejected: true,
                              };
                              return updatedProfiles;
                            });
                            modalRef.current?.close();
                          }),
                        {
                          loading: "Rejecting The User...",
                          success: "Rejected The User",
                          error: (error) =>
                            `Failed to reject the user: ${error}`,
                        },
                      )
                    }
                    className="rounded bg-red-500 p-2 text-white"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
            <img src={selectedUser.profile_pic?.url} alt="profile pic" />
            {selectedUser.attachments?.map((attach) => (
              <details key={attach._id}>
                <summary>{attach.original_name}</summary>
                <iframe
                  src={attach.url}
                  title={attach.original_name}
                  width="100%"
                  height="600px"
                ></iframe>
              </details>
            ))}
          </>
        )}
      </Modal>
    </>
  );
}

export default ProfileTable;
