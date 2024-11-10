import axiosInstance from "@/modules/shared/services/axiosInstance";
import { useState, useRef, useContext } from "react";
import EditModal, { formModalRef } from "../../shared/components/FormEditModal";
import { UserContext } from "@/modules/shared/store/user-context";
import toast from "react-hot-toast";
import { requestAccountDeletion } from "../services/apiDeleteUser";
import { apiAddDocs } from "@/modules/Register/services/apiAddDocs";
import { updateUser } from "../services/apiUpdateUser";
import { getUser } from "../services/apiGetUserInfo";
import { validateFormDataValue } from "@/modules/Register/utils/helpers";
import { fieldNames } from "../constants/inputNames";
import { updatePassword } from "../services/apiUpdatePassword";
import { WorkHistory } from "../types/PrevWorks";
import TourGuideProfile from "@/modules/TourGuide/components/TourGuideProfile";
import WorkHistoryModal from "@/modules/TourGuide/components/WorkHistoryModal";
import TouristProfile from "@/modules/Tourist/components/TouristProfile";
import AdvertiserProfile from "@/modules/Advertiser/components/AdvertiserProfile";
import SellerProfile from "@/modules/Seller/components/SellerProfile";
import ProfilePicAndName from "./ProfilePicAndName";
import { TagType } from "../types/Tag.types";

interface NewProfProps {
  countries?: { name: { common: string } }[];
  fieldsIncludeNationality?: boolean;
  mappingNeeded?: boolean;
  APICallFields: string[];
  accountTypeNeededInAPICall?: boolean;
  initialFormValues: { [key: string]: string };
  endpoint: (
    id: string,
    data: { [key: string]: FormDataEntryValue },
  ) => Promise<unknown>;
  tags: TagType[];
}

const NewProf: React.FC<NewProfProps> = ({
  countries = [],
  fieldsIncludeNationality = false,
  mappingNeeded = false,
  APICallFields,
  accountTypeNeededInAPICall = false,
  endpoint,
  initialFormValues,
  tags,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [showWorkHistoryModal, setShowWorkHistoryModal] = useState(false);
  const [editingWorkHistory, setEditingWorkHistory] =
    useState<WorkHistory | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<formModalRef>(null);
  const { user, setUser } = useContext(UserContext);

  const handleRedeemPoints = async (
    loyaltyPointsToRedeem: number,
    setLoyaltyPointsToRedeem: React.Dispatch<React.SetStateAction<number>>,
  ) => {
    setLoyaltyPointsToRedeem(0);
    try {
      await axiosInstance.post("/users/tourists/redeem", {
        points: loyaltyPointsToRedeem,
      });

      const response = await getUser(user._id);

      setUser(response.data.data.user);
    } catch (error) {
      console.error("Error redeeming points:", error);
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      const res = await apiAddDocs(formData);
      const id = res.data._id;
      const url = res.data.url;

      await updateUser(user._id, {
        account_type: user.account_type,
        profile_pic: id,
      });

      setUser((prev) => ({
        ...prev,
        profile_pic: { url, _id: id },
      }));
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      toast.error("Failed to update profile picture");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleSave = async (data: Record<string, string>) => {
    if (
      fieldsIncludeNationality &&
      data["Nationality"] &&
      !countries?.find((country) => country.name.common === data["Nationality"])
    ) {
      toast.error("Invalid country name");
      return;
    }

    const fieldsMap: Record<string, string> = {};
    if (mappingNeeded) {
      for (const key in initialFormValues) {
        fieldsMap[key] =
          APICallFields[Object.keys(initialFormValues).indexOf(key)];
      }
    }

    const mappedData = Object.entries(data).reduce<Record<string, string>>(
      (acc, [key, value]) => ({
        ...acc,
        [fieldsMap[key] || key]: value,
      }),
      {},
    );

    if (mappedData.password) {
      if (
        !validateFormDataValue(
          fieldNames.password,
          mappedData.password as string,
        )
      ) {
        return toast.error(
          "Password must contain at least 8 characters, 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character",
        );
      }
      await updatePassword(mappedData.password);
    }

    if (accountTypeNeededInAPICall) {
      mappedData["account_type"] = user.account_type;
    }

    if (mappedData["dob"]) delete mappedData["dob"];

    try {
      const res = (await endpoint(user._id, mappedData)) as { status: number };

      if (res.status === 200) {
        setUser((prev) => ({ ...prev, ...mappedData }));
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleEditWorkHistory = async (work: WorkHistory) => {
    setEditingWorkHistory(work);

    try {
      if (user.previous_work) {
        setUser((prev) => ({
          ...prev,
          previous_work: prev.previous_work?.filter(
            (item) => item._id !== work._id,
          ),
        }));
      }

      setShowWorkHistoryModal(true);
    } catch (error) {
      console.error("Error updating work history:", error);
      toast.error("Failed to update work history");
    }
  };

  const handleSaveWorkHistory = async (work: WorkHistory) => {
    try {
      // review this part
      const allWorks = [work, ...(user.previous_work || [])];

      await updateUser(user._id, undefined, allWorks);

      setUser((prev) => ({
        ...prev,
        previous_works: prev.previous_work?.unshift(work) || [],
      }));

      setShowWorkHistoryModal(false);
      setEditingWorkHistory(null);
      // toast.success("Work history updated successfully");
    } catch (error) {
      console.error("Error updating work history:", error);
      // toast.error("Failed to update work history");
    }
  };

  const onDeleteReq = async () => {
    try {
      await requestAccountDeletion();
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Request to delete account failed");
    }
  };

  const openModal = () => {
    modalRef.current?.open({
      ...initialFormValues,
    });
  };

  const renderProfileContent = () => {
    switch (user.account_type.toLowerCase()) {
      case "tourguide":
        return (
          <TourGuideProfile
            user={user}
            handleEditWorkHistory={handleEditWorkHistory}
            setEditingWorkHistory={setEditingWorkHistory}
            setShowWorkHistoryModal={setShowWorkHistoryModal}
          />
        );

      case "advertiser":
        return <AdvertiserProfile user={user} />;

      case "seller":
        return <SellerProfile user={user} />;

      default: // Tourist profile
        return (
          <TouristProfile
            tags={tags}
            user={user}
            handleRedeemPoints={handleRedeemPoints}
          />
        );
    }
  };

  return (
    <div className="relative min-h-screen">
      <div className="relative flex min-h-screen items-center justify-center">
        <div className="w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="h-full rounded-xl border border-secondary-light_grey bg-secondary-light_grey p-8 shadow-lg backdrop-blur-sm">
            <div className="flex items-center gap-12 lg:flex-row">
              <ProfilePicAndName
                user={user}
                isUploading={isUploading}
                handleCameraClick={handleCameraClick}
                fileInputRef={fileInputRef}
                handleFileChange={handleFileChange}
              />

              {renderProfileContent()}
            </div>

            <div className="mt-8 flex justify-end space-x-4">
              <button
                onClick={openModal}
                className="rounded-lg bg-accent-dark-blue px-8 py-3 text-white transition-colors hover:bg-accent-dark-blue/80"
              >
                Edit Profile
              </button>
              <EditModal
                ref={modalRef}
                fields={Object.keys(initialFormValues)}
                onSave={handleSave}
                onDeleteAccount={() => onDeleteReq()}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Work History Modal */}
      <WorkHistoryModal
        editingWorkHistory={editingWorkHistory}
        setEditingWorkHistory={setEditingWorkHistory}
        showWorkHistoryModal={showWorkHistoryModal}
        setShowWorkHistoryModal={setShowWorkHistoryModal}
        handleSaveWorkHistory={handleSaveWorkHistory}
      />
    </div>
  );
};

export default NewProf;
